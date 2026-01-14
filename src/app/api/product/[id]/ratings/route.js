import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // 1. Unwrapping the params promise (Required in Next.js 15+)
    const resolvedParams = await params;
    const productId = Number(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid Product ID" }, { status: 400 });
    }

    const ratings = await prisma.rating.findMany({
      where: { productId },
      include: { 
        user: { select: { name: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formatting for the frontend
    const formattedReviews = ratings.map(r => ({
      id: r.id,
      stars: r.stars,
      user: r.user?.name || "Anonymous",
      comment: r.comment
    }));

    // Calculate summary stats
    const totalStars = ratings.reduce((sum, r) => sum + r.stars, 0);
    const avgRating = ratings.length ? (totalStars / ratings.length) : 0;

    return NextResponse.json({
      avgRating: Number(avgRating.toFixed(1)),
      count: ratings.length,
      reviews: formattedReviews
    });

  } catch (err) {
    console.error("GET RATINGS ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}