import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // 1. Await params (Required in newer Next.js versions)
    const { id } = await params;
    const designerId = Number(id);

    if (!designerId || isNaN(designerId)) {
      return NextResponse.json({ message: "Invalid Designer ID" }, { status: 400 });
    }

    // 2. Fetch Hire Requests
    const requests = await prisma.designerHireRequest.findMany({
      where: { designerId },
      orderBy: { createdAt: "desc" },
      include: { 
        userRating: true // Rating the designer gave this user for THIS specific request
      },
    });

    // 3. Extract unique emails to fetch global client reputation
    const emails = [...new Set(requests.map(r => r?.email).filter(Boolean))];

    let allRatings = [];
    if (emails.length > 0) {
      allRatings = await prisma.userRating.findMany({
        where: { 
          hireRequest: { 
            email: { in: emails } 
          } 
        },
        include: { 
          hireRequest: {
             select: { email: true }
          } 
        },
      });
    }

    // 4. Group ratings by email for quick lookup
    const ratingsByEmail = {};
    allRatings.forEach(r => {
      const e = r.hireRequest?.email;
      if (e) {
        if (!ratingsByEmail[e]) ratingsByEmail[e] = [];
        ratingsByEmail[e].push(r);
      }
    });

    // 5. Build final response with Average Rating per Client
    const response = requests.map((r) => {
      const clientRatings = ratingsByEmail[r.email] || [];
      const totalStars = clientRatings.reduce((s, x) => s + x.stars, 0);
      const avg = clientRatings.length ? totalStars / clientRatings.length : 0;

      return {
        id: r.id,
        userId: r.userId,
        clientName: r.fullName,
        mobile: r.mobile,
        email: r.email,
        type: r.workType,
        budget: r.budget,
        location: r.location,
        timelineDate: r.timelineDate,
        status: r.status,
        message: r.description,
        alreadyRated: !!r.userRating, // Tells frontend if designer already rated this lead
        clientSummary: {
          average: Number(avg.toFixed(1)),
          count: clientRatings.length,
          reviews: clientRatings.map(cr => ({
            stars: cr.stars,
            review: cr.review,
            reviewer: cr.reviewerName,
            date: cr.createdAt
          })),
        },
      };
    });

    return NextResponse.json(response, { status: 200 });

  } catch (err) {
    console.error("WORK_REQUESTS_GET_ERROR:", err);
    return NextResponse.json({ message: "Failed to fetch work requests" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { requestId, status } = await request.json(); // e.g., status: "accepted"

    const updated = await prisma.designerHireRequest.update({
      where: { id: Number(requestId) },
      data: { status },
    });

    return NextResponse.json({ message: "Status updated", updated });
  } catch (err) {
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}