import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
      availability: { not: "discontinued" },
    },
    include: { 
      seller: { 
        include: { 
          business: true,
          delivery: true // Added to ensure delivery charges aren't lost in search
        } 
      }, 
      ratings: true 
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = products.map((p) => {
    // Logic to calculate actual ratings instead of hardcoded 0
    const total = p.ratings.reduce((sum, r) => sum + r.stars, 0);
    const count = p.ratings.length;
    const avgRating = count ? (total / count).toFixed(1) : 0;

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description,
      images: p.images,
      video: p.video,
      availability: p.availability,
      sellerId: p.sellerId,
      sellerName: p.seller.name,
      location: p.seller.business ? `${p.seller.business.city}, ${p.seller.business.state}` : "Remote",
      avgRating: Number(avgRating),
      ratingCount: count,
      // Ensure shipping/installation data is passed to results
      shippingChargeType: p.seller?.delivery?.shippingChargeType || "Paid",
      shippingCharge: p.seller?.delivery?.shippingCharge || 0,
      installationAvailable: p.seller?.delivery?.installationAvailable || "no",
      installationCharge: p.seller?.delivery?.installationCharge || 0,
    };
  });

  return NextResponse.json(formatted);
}