import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET: Fetch bank/UPI details for a specific seller
 * URL: /api/seller/bank-details?sellerId=123
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ message: "Seller ID is required" }, { status: 400 });
    }

    const bankDetails = await prisma.sellerBankDetails.findUnique({
      where: { sellerId: Number(sellerId) },
    });

    // If no details exist yet, return an empty object instead of a 404 to help the frontend
    return NextResponse.json(bankDetails || {});
  } catch (err) {
    console.error("GET BANK ERROR:", err);
    return NextResponse.json({ message: "Server error fetching payment details" }, { status: 500 });
  }
}

/**
 * POST: Create or Update bank/UPI details (Upsert)
 * URL: /api/seller/bank-details
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sellerId, upiId, accountHolder, bankName, accountNumber, ifsc } = body;

    if (!sellerId) {
      return NextResponse.json({ message: "Seller ID is required" }, { status: 400 });
    }

    const sid = Number(sellerId);

    // Prisma Upsert: Update if exists, Create if not
    const result = await prisma.sellerBankDetails.upsert({
      where: { sellerId: sid },
      update: {
        upiId,
        accountHolder,
        bankName: bankName || "UPI",
        accountNumber: accountNumber || "UPI",
        ifsc: ifsc || "UPI",
      },
      create: {
        sellerId: sid,
        upiId,
        accountHolder,
        bankName: bankName || "UPI",
        accountNumber: accountNumber || "UPI",
        ifsc: ifsc || "UPI",
      },
    });

    return NextResponse.json({ 
      message: "Payment details saved successfully ", 
      data: result 
    });
  } catch (err) {
    console.error("POST BANK ERROR:", err);
    
    // Check for specific Prisma errors (like model field mismatch)
    return NextResponse.json({ 
      message: "Database error: " + (err.message || "Failed to save details") 
    }, { status: 500 });
  }
}