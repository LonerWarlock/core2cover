import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const designerId = Number(params.id);
  
  const requests = await prisma.designerHireRequest.findMany({
    where: { designerId },
    orderBy: { createdAt: "desc" },
    include: { userRating: true },
  });

  const emails = [...new Set(requests.map(r => r?.email).filter(Boolean))];

  // Fetch ratings for these clients
  let allRatings = [];
  if (emails.length > 0) {
    allRatings = await prisma.userRating.findMany({
      where: { hireRequest: { email: { in: emails } } },
      include: { hireRequest: true },
    });
  }

  const ratingsByEmail = {};
  allRatings.forEach(r => {
    const e = r.hireRequest?.email;
    if(e) {
        if(!ratingsByEmail[e]) ratingsByEmail[e] = [];
        ratingsByEmail[e].push(r);
    }
  });

  const response = requests.map((r) => {
    const clientRatings = ratingsByEmail[r.email] || [];
    const avg = clientRatings.length ? clientRatings.reduce((s, x) => s + x.stars, 0) / clientRatings.length : 0;

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
      userRating: r.userRating,
      clientSummary: {
        average: Number(avg.toFixed(1)),
        count: clientRatings.length,
        reviews: clientRatings,
      },
    };
  });

  return NextResponse.json(response);
}