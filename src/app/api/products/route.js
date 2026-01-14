import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const products = await prisma.product.findMany({
      where: type ? { productType: type } : {},
      include: {
        seller: {
          select: {
            name: true,
            business: { select: { city: true, state: true } },
          },
        },
        ratings: { select: { stars: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => {
      const total = p.ratings.reduce((sum, r) => sum + r.stars, 0);
      const count = p.ratings.length;
      const avgRating = count ? total / count : 0;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        availability: p.availability,
        productType: p.productType,
        images: p.images, 
        video: p.video,
        sellerId: p.sellerId,
        seller: p.seller?.name || "Verified Seller",
        sellerBusiness: p.seller?.business || null,
        avgRating: Number(avgRating.toFixed(1)),
        ratingCount: count,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("FETCH PRODUCTS ERROR:", err);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}