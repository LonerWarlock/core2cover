import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    // FIX 1: Await params to unwrap the Promise (Required in Next.js 15+)
    const { orderItemId: rawId } = await params;
    const orderItemId = Number(rawId);

    const { stars, comment, userEmail, productId } = await request.json();

    if (!stars || !userEmail) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // FIX 2: Find the order item to verify status
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: { id: true, status: true, rating: true, materialId: true },
    });

    if (!orderItem) {
      return NextResponse.json({ message: "Order item not found" }, { status: 404 });
    }

    // Check if already rated to prevent Prisma Unique constraint error
    if (orderItem.rating) {
      return NextResponse.json({ message: "This item has already been rated" }, { status: 409 });
    }

    // Create the rating
    const rating = await prisma.rating.create({
      data: {
        stars: Number(stars),
        comment: comment || null,
        userId: user.id,
        productId: Number(productId),
        orderItemId: orderItemId,
        createdAt: new Date(), // Explicitly set current date to avoid nulls
      },
    });

    return NextResponse.json({ message: "Rating submitted successfully", rating }, { status: 201 });
  } catch (err) {
    console.error("RATE ORDER ERROR:", err);
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
  }
}