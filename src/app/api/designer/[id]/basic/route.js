import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


const encodeData = (data) => {
  return Buffer.from(JSON.stringify(data)).toString("base64");
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const designerId = Number(id);

    if (!designerId || isNaN(designerId)) {
      return NextResponse.json({ message: "Invalid Designer ID" }, { status: 400 });
    }

    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      select: {
        fullname: true,
        availability: true,
        isVerified: true,
        ratings: {
          select: {
            stars: true,
            review: true,
            reviewerName: true, 
            createdAt: true,
            hireRequest: {
              select: {
                user: {
                  select: {
                    name: true 
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!designer) {
      return NextResponse.json({ message: "Designer not found" }, { status: 404 });
    }

    const processedRatings = designer.ratings.map(r => ({
      stars: r.stars,
      review: r.review,
      createdAt: r.createdAt,
      reviewerName: r.reviewerName || r.hireRequest?.user?.name || "Client"
    }));

    const totalRatings = processedRatings.length;
    const avgRating = totalRatings > 0 
      ? (processedRatings.reduce((acc, curr) => acc + curr.stars, 0) / totalRatings).toFixed(1)
      : 0;

    const dashboardData = {
      fullname: designer.fullname,
      availability: designer.availability,
      isVerified: designer.isVerified, 
      ratings: processedRatings,
      avgRating: Number(avgRating),
      totalRatings
    };

    return NextResponse.json({
      payload: encodeData(dashboardData)
    }, { status: 200 });

  } catch (err) {
    console.error("GET_DESIGNER_DASHBOARD_ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// --- 2. THE PATCH METHOD (For the availability toggle) ---
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { availability } = await request.json();

    if (!availability) {
      return NextResponse.json({ message: "Availability status required" }, { status: 400 });
    }

    const updatedDesigner = await prisma.designer.update({
      where: { id: Number(id) },
      data: { availability },
    });

    return NextResponse.json({ 
      message: "Status updated", 
      availability: updatedDesigner.availability 
    }, { status: 200 });

  } catch (err) {
    console.error("UPDATE_AVAILABILITY_ERROR:", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}