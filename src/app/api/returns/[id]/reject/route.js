import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const returnId = Number(id);
    const { reason } = await request.json();

    const updatedReturn = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        sellerApprovalStatus: "REJECTED",
        sellerDecisionNote: reason,
      }
    });

    return NextResponse.json({ message: "Return rejected by seller", updatedReturn });
  } catch (err) {
    return NextResponse.json({ message: "Rejection failed" }, { status: 500 });
  }
}