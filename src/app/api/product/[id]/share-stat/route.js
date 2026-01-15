import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const productId = Number(params.id);

    // Increment share count in the database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        shareCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, shareCount: updatedProduct.shareCount });
  } catch (err) {
    return NextResponse.json({ error: "Failed to log share" }, { status: 500 });
  }
}