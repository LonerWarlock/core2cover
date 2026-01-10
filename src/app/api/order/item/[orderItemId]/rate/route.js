import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const orderItemId = Number(params.orderItemId);
    const { stars, comment, userEmail } = await request.json();

    if (!stars || !userEmail) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: { id: true, status: true, materialId: true, rating: true },
    });

    if (!orderItem) return NextResponse.json({ message: "Item not found" }, { status: 404 });

    if (orderItem.status !== "fulfilled") {
      return NextResponse.json({ message: "Only delivered items can be rated" }, { status: 400 });
    }

    if (orderItem.rating) {
      return NextResponse.json({ message: "Already rated" }, { status: 409 });
    }

    const rating = await prisma.rating.create({
      data: {
        stars,
        comment: comment || null,
        user: { connect: { id: user.id } },
        product: { connect: { id: orderItem.materialId } },
        orderItem: { connect: { id: orderItem.id } },
      },
    });

    return NextResponse.json({ message: "Rating submitted", rating }, { status: 201 });
  } catch (err) {
    console.error("RATE ORDER ERROR:", err);
    return NextResponse.json({ message: "Failed to submit rating" }, { status: 500 });
  }
}