import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const ratings = await prisma.designerRating.findMany({
    where: { designerId: Number(params.id) },
    orderBy: { createdAt: "desc" },
  });

  const avg = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;

  return NextResponse.json({
    average: Number(avg.toFixed(1)),
    count: ratings.length,
    reviews: ratings.map((r) => ({
      name: r.reviewerName,
      stars: r.stars,
      review: r.review,
      createdAt: r.createdAt,
    })),
  });
}