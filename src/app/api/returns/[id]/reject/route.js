import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const { decisionNote } = await request.json();
    const returnId = Number(params.id);
    const sellerEmail = request.headers.get("x-seller-email");

    const seller = await prisma.seller.findUnique({ where: { email: sellerEmail } });
    const rr = await prisma.returnRequest.findUnique({ where: { id: returnId } });

    if (rr.sellerId !== seller.id) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

    await prisma.returnRequest.update({
      where: { id: returnId },
      data: { sellerApprovalStatus: "REJECTED", sellerDecisionNote: decisionNote, sellerApprovedAt: new Date() },
    });

    await prisma.orderItem.update({
      where: { id: rr.orderItemId },
      data: { returnStatus: "REJECTED", returnResolvedAt: new Date() },
    });

    return NextResponse.json({ message: "Rejected" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}