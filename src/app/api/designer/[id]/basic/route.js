import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        ratings: {
          select: {
            stars: true,
            review: true,
            reviewerName: true, // This is the static string
            createdAt: true,
            // --- ADDED: Fetch the name from the hire request relation ---
            hireRequest: {
              select: {
                user: {
                  select: {
                    name: true // This is the actual Client Name
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

    // Process ratings to ensure a name is always present
    const processedRatings = designer.ratings.map(r => ({
      stars: r.stars,
      review: r.review,
      createdAt: r.createdAt,
      // Priority: 1. Static reviewerName, 2. Dynamic User Name, 3. Fallback
      reviewerName: r.reviewerName || r.hireRequest?.user?.name || "Client"
    }));

    const totalRatings = processedRatings.length;
    const avgRating = totalRatings > 0 
      ? (processedRatings.reduce((acc, curr) => acc + curr.stars, 0) / totalRatings).toFixed(1)
      : 0;

    return NextResponse.json({
      fullname: designer.fullname,
      availability: designer.availability,
      ratings: processedRatings,
      avgRating: Number(avgRating),
      totalRatings
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