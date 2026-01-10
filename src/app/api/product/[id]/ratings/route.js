import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const productId = Number(params.id);
    const ratings = await prisma.rating.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const avg = ratings.reduce((s, r) => s + r.stars, 0) / (ratings.length || 1);

    return NextResponse.json({
      avgRating: Number(avg.toFixed(1)),
      count: ratings.length,
      reviews: ratings.map((r) => ({
        id: r.id,
        stars: r.stars,
        comment: r.comment,
        user: r.user.name,
      })),
    });
  } catch {
    return NextResponse.json({ avgRating: 0, count: 0, reviews: [] });
  }
}