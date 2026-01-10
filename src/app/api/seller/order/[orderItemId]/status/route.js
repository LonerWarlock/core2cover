import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { status } = await request.json();
    const orderItemId = Number(params.orderItemId);

    const allowed = ["pending", "confirmed", "out_for_delivery", "rejected", "fulfilled", "cancelled"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}