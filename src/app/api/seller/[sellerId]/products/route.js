import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const sellerId = Number(params.sellerId);
    if (!sellerId || isNaN(sellerId)) return NextResponse.json([]);

    const products = await prisma.product.findMany({
      where: { sellerId: sellerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("FETCH SELLER PRODUCTS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}