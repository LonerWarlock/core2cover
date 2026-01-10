import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { sellerId, accountHolder, bankName, accountNumber, ifsc } = body;

    if (!sellerId || !accountHolder || !bankName || !accountNumber || !ifsc) {
      return NextResponse.json({ message: "All bank fields are required" }, { status: 400 });
    }

    const seller = await prisma.seller.findUnique({
      where: { id: Number(sellerId) },
    });

    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    }

    const bank = await prisma.sellerBankDetails.upsert({
      where: { sellerId: Number(sellerId) },
      update: { accountHolder, bankName, accountNumber, ifsc },
      create: {
        sellerId: Number(sellerId),
        accountHolder,
        bankName,
        accountNumber,
        ifsc,
      },
    });

    return NextResponse.json({ message: "Bank details saved successfully", bank });
  } catch (err) {
    console.error("BANK DETAILS ERROR:", err);
    return NextResponse.json({ message: "Failed to save bank details" }, { status: 500 });
  }
}