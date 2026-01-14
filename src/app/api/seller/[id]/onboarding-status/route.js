import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const sellerId = Number(params.sellerId);

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        business: true,
        bank: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasBusinessDetails: !!seller.business,
      hasBankDetails: !!seller.bank,
    });
  } catch (err) {
    console.error("ONBOARDING STATUS ERROR:", err);
    return NextResponse.json({ message: "Failed to check status" }, { status: 500 });
  }
}