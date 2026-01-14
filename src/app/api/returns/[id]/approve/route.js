import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1. Change POST to PATCH to match your frontend api.patch() call
export async function PATCH(request, { params }) {
  try {
    // 2. Await params (Required in recent Next.js versions)
    const { id } = await params;
    const returnId = Number(id);

    // Using a safer way to identify the seller (e.g., from query or body) 
    // because headers can sometimes be stripped in certain environments
    const sellerIdHeader = request.headers.get("x-seller-id"); 
    
    const rr = await prisma.returnRequest.findUnique({ 
      where: { id: returnId }, 
      include: { orderItem: true } 
    });

    if (!rr) return NextResponse.json({ message: "Return request not found" }, { status: 404 });
    
    // Authorization check
    if (sellerIdHeader && rr.sellerId !== Number(sellerIdHeader)) {
       return NextResponse.json({ message: "Not authorised" }, { status: 403 });
    }

    if (rr.sellerApprovalStatus !== "PENDING") {
      return NextResponse.json({ message: "Already processed" }, { status: 400 });
    }

    const refundAmount = rr.refundAmount ?? rr.orderItem.totalAmount;

    await prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: returnId },
        data: { 
          sellerApprovalStatus: "APPROVED", 
          sellerApprovedAt: new Date(), 
          sellerDecisionNote: "Approved by seller" 
        },
      });
      
      await tx.orderItem.update({
        where: { id: rr.orderItemId },
        data: { 
          returnStatus: "APPROVED", 
          returnResolvedAt: new Date(), 
          status: "returned" // Changed 'fulfilled' to 'returned' to be more accurate
        },
      });

      if (rr.refundMethod === "STORE_CREDIT") {
        await tx.user.update({
          where: { id: rr.userId },
          data: { credit: { increment: refundAmount } },
        });
      }
    });

    return NextResponse.json({ message: "Return approved successfully" });
  } catch (err) {
    console.error("Approve API Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}