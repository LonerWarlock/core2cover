import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sellerId = Number(id);

    const bank = await prisma.sellerBankDetails.findUnique({
      where: { sellerId },
      select: {
        accountHolder: true,
        bankName: true,
        accountNumber: true,
        ifsc: true,
        upiId: true, // Included UPI ID
      },
    });

    return NextResponse.json(bank || null);
  } catch (err) {
    console.error("FETCH BANK ERROR:", err);
    return NextResponse.json(null, { status: 500 });
  }
}