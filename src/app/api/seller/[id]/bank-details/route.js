import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const sellerId = Number(params.sellerId);
    const bank = await prisma.sellerBankDetails.findUnique({
      where: { sellerId },
      select: {
        accountHolder: true,
        bankName: true,
        accountNumber: true,
        ifsc: true,
      },
    });

    return NextResponse.json(bank || null);
  } catch (err) {
    console.error("FETCH BANK DETAILS ERROR:", err);
    return NextResponse.json(null, { status: 500 });
  }
}