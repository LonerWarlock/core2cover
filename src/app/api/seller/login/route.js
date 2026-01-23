import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * EASY ENCRYPTION HELPER
 * Encodes data to Base64 to mask it from the Network Tab.
 */
const encodeData = (data) => {
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString("base64");
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Find the seller with a normalized email search
    const seller = await prisma.seller.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });

    if (!seller || !(await bcrypt.compare(password, seller.password))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Prepare the seller data for the secure payload
    const sellerData = { 
      id: seller.id, 
      name: seller.name, 
      email: seller.email 
    };

    return NextResponse.json({
      message: "Login successful",
      // The payload is now scrambled Base64
      payload: encodeData(sellerData),
    });

  } catch (err) {
    console.error("Seller Login Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}