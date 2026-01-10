import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const orderId = Number(params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const nonCancelableStatuses = ["fulfilled", "rejected", "cancelled"];
    const hasNonCancelableItem = order.items.some((item) =>
      nonCancelableStatuses.includes(item.status)
    );

    if (hasNonCancelableItem) {
      return NextResponse.json({ message: "Order cannot be cancelled" }, { status: 400 });
    }

    // 2-day limit
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const orderTime = new Date(order.createdAt).getTime();

    if (now - orderTime > TWO_DAYS) {
      return NextResponse.json({ message: "Cancellation period expired" }, { status: 400 });
    }

    await prisma.orderItem.updateMany({
      where: { orderId },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);
    return NextResponse.json({ ok: false, message: "Failed to cancel" }, { status: 500 });
  }
}