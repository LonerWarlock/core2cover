import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    // British English validation message
    if (!sellerId || sellerId === "null") {
      return NextResponse.json({ message: "Seller ID is required to fetch the catalogue" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { sellerId: Number(sellerId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}