import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const ratings = await prisma.userRating.findMany({
    where: { hireRequest: { userId: Number(params.userId) } },
    include: { designer: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    ratings.map((r) => ({
      id: r.id,
      stars: r.stars,
      review: r.review,
      reviewerName: r.reviewerName || "Designer",
      designerImage: r.designer?.profile?.profileImage,
      createdAt: r.createdAt,
    }))
  );
}