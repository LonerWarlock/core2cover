import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    
    if (isNaN(id)) return NextResponse.json(null, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            name: true,
            business: { select: { city: true, state: true } },
            delivery: true,
          },
        },
        ratings: { select: { stars: true, comment: true } },
      },
    });

    if (!product) return NextResponse.json(null, { status: 404 });

    const total = product.ratings.reduce((s, r) => s + r.stars, 0);
    const count = product.ratings.length;

    return NextResponse.json({
      id: product.id,
      sellerId: product.sellerId,
      title: product.name,
      // FIX 2: Use optional chaining to prevent crashes if seller data is missing
      seller: product.seller?.name || "Unknown Seller",
      origin: product.seller?.business
        ? `${product.seller.business.city}, ${product.seller.business.state}`
        : "Not specified",
      price: product.price,
      images: product.images, 
      video: product.video,
      description: product.description,
      availability: product.availability,
      avgRating: count ? total / count : 0,
      ratingCount: count,
      // SAFELY access nested delivery details
      deliveryTimeMin: product.seller?.delivery?.deliveryTimeMin ?? null,
      deliveryTimeMax: product.seller?.delivery?.deliveryTimeMax ?? null,
      installationAvailable: product.seller?.delivery?.installationAvailable ?? "no",
      installationCharge: product.seller?.delivery?.installationCharge ?? 0,
      shippingChargeType: product.seller?.delivery?.shippingChargeType ?? "free",
      shippingCharge: product.seller?.delivery?.shippingCharge ?? 0,
    });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    return NextResponse.json(null, { status: 500 });
  }
}