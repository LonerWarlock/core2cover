import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const returnId = Number(params.id);
  const rr = await prisma.returnRequest.findUnique({ where: { id: returnId }, include: { orderItem: true } });

  if (!rr) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const refundAmount = rr.refundAmount ?? rr.orderItem.totalAmount;

  await prisma.$transaction(async (tx) => {
    await tx.returnRequest.update({
      where: { id: returnId },
      data: { adminApprovalStatus: "APPROVED", adminApprovedAt: new Date(), refundStatus: rr.refundMethod === "STORE_CREDIT" ? "COMPLETED" : "PENDING" },
    });

    if (rr.refundMethod === "STORE_CREDIT") {
      await tx.user.update({
        where: { id: rr.userId },
        data: { credit: { increment: refundAmount } },
      });
    }
  });

  return NextResponse.json({ message: "Admin Approved" });
}