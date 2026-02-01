import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { 
        id: parseInt(id) 
      },
      include: {
        seller: {
          select: {
            name: true,
            delivery: {
              select: {
                shippingChargeType: true,
                shippingCharge: true,
                installationAvailable: true,
                installationCharge: true,
              }
            },
            business: { select: { city: true, state: true } },
          },
        },
        ratings: { select: { stars: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Calculate rating stats
    const total = product.ratings.reduce((sum, r) => sum + r.stars, 0);
    const count = product.ratings.length;
    const avgRating = count ? total / count : 0;

    // Formatting exactly like your list route to ensure frontend compatibility
    const formatted = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      availability: product.availability,
      productType: product.productType,
      images: product.images,
      video: product.video, // CRITICAL: This was likely missing
      sellerId: product.sellerId,
      seller: product.seller?.name || "Verified Seller",
      sellerBusiness: product.seller?.business || null,
      avgRating: Number(avgRating.toFixed(1)),
      ratingCount: count,
      
      // LOGISTICS FIELDS
      unit: product.unit || "pcs",
      unitsPerTrip: product.unitsPerTrip || 1,
      conversionFactor: product.conversionFactor || 1,

      shippingChargeType: product.seller?.delivery?.shippingChargeType || "Paid",
      shippingCharge: product.seller?.delivery?.shippingCharge || 0,
      installationAvailable: product.seller?.delivery?.installationAvailable || "no",
      installationCharge: product.seller?.delivery?.installationCharge || 0,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("FETCH SINGLE PRODUCT ERROR:", err);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}