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
    include: { seller: { include: { business: true } }, ratings: true },
    orderBy: { createdAt: "desc" },
  });

  // Format logic (same as index.js but using Cloudinary URLs directly)
  const formatted = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    description: p.description,
    images: p.images, // Cloudinary URLs are stored directly
    video: p.video,
    availability: p.availability,
    sellerId: p.sellerId,
    sellerName: p.seller.name,
    avgRating: 0, // Simplified for brevity, add calc logic if needed
  }));

  return NextResponse.json(formatted);
}