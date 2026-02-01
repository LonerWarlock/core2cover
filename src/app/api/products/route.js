import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: {
          include: {
            delivery: true,
            business: true,
          }
        },
        ratings: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Explicitly mapping every field to ensure nothing is lost
    const formatted = {
      ...product, // Spreading the product object ensures 'video' is included
      id: product.id,
      video: product.video || null, // Forced check for the video string
      seller: product.seller?.name || "Verified Seller",
      sellerId: product.sellerId,
      shippingChargeType: product.seller?.delivery?.shippingChargeType || "Paid",
      shippingCharge: product.seller?.delivery?.shippingCharge || 0,
      installationAvailable: product.seller?.delivery?.installationAvailable || "no",
      installationCharge: product.seller?.delivery?.installationCharge || 0,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}