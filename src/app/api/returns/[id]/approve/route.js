import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const returnId = Number(params.id);
    const sellerEmail = request.headers.get("x-seller-email");
    if (!sellerEmail) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const seller = await prisma.seller.findUnique({ where: { email: sellerEmail } });
    const rr = await prisma.returnRequest.findUnique({ where: { id: returnId }, include: { orderItem: true } });

    if (!rr || rr.sellerId !== seller.id) return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    if (rr.sellerApprovalStatus !== "PENDING") return NextResponse.json({ message: "Already processed" }, { status: 400 });

    const refundAmount = rr.refundAmount ?? rr.orderItem.totalAmount;

    await prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: returnId },
        data: { sellerApprovalStatus: "APPROVED", sellerApprovedAt: new Date(), sellerDecisionNote: "Approved by seller" },
      });
      await tx.orderItem.update({
        where: { id: rr.orderItemId },
        data: { returnStatus: "APPROVED", returnResolvedAt: new Date(), status: "fulfilled" },
      });
      if (rr.refundMethod === "STORE_CREDIT") {
        await tx.user.update({
          where: { id: rr.userId },
          data: { credit: { increment: refundAmount } },
        });
      }
    });

    return NextResponse.json({ message: "Return approved" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}