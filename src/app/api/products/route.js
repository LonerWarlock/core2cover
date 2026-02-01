import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const products = await prisma.product.findMany({
      where: {
        // Filter by type if provided
        ...(type ? { productType: type } : {}),
        // Ensure we only show products from verified sellers
        seller: {
          isVerified: true 
        }
      },
      include: {
        seller: {
          select: {
            name: true,
            // Use 'delivery' only if it exists as a 1-to-1 or 1-to-many in your schema
            delivery: true, 
            business: true,
          },
        },
        ratings: { select: { stars: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => {
      // Calculate ratings safely
      const total = p.ratings?.reduce((sum, r) => sum + r.stars, 0) || 0;
      const count = p.ratings?.length || 0;
      const avgRating = count ? total / count : 0;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        availability: p.availability,
        productType: p.productType,
        images: p.images || [], 
        video: p.video || null, // Ensure video is passed
        sellerId: p.sellerId,
        seller: p.seller?.name || "Verified Seller",
        sellerBusiness: p.seller?.business || null,
        avgRating: Number(avgRating.toFixed(1)),
        ratingCount: count,
        
        // Logistics & Raw Material Fields
        unit: p.unit || "pcs",
        unitsPerTrip: p.unitsPerTrip || 1,
        conversionFactor: p.conversionFactor || 1,

        // Safe access to nested delivery charges
        shippingChargeType: p.seller?.delivery?.shippingChargeType || "Paid",
        shippingCharge: p.seller?.delivery?.shippingCharge || 0,
        installationAvailable: p.seller?.delivery?.installationAvailable || "no",
        installationCharge: p.seller?.delivery?.installationCharge || 0,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    // Log the exact error to Vercel/Terminal logs for debugging
    console.error("FETCH PRODUCTS ERROR:", err.message);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message }, 
      { status: 500 }
    );
  }
}