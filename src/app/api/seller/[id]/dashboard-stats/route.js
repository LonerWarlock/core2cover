import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Standardized to 'id'
    const sellerId = Number(id);

    if (isNaN(sellerId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId },
      select: {
        status: true,
        totalAmount: true,
      },
    });

    const ordersCount = orderItems.length;
    const totalEarnings = orderItems
      .filter((it) => it.status === "fulfilled")
      .reduce((s, it) => s + Number(it.totalAmount ?? 0), 0);

    return NextResponse.json({
      ordersCount,
      totalEarnings,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    return NextResponse.json({ message: "Failed to fetch dashboard" }, { status: 500 });
  }
}