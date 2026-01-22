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
    const designer = await prisma.designer.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!designer || !(await bcrypt.compare(password, designer.passwordHash))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Prepare the designer data for the secure payload
    const designerData = { 
      id: designer.id, 
      fullname: designer.fullname, 
      email: designer.email, 
      availability: designer.availability 
    };

    return NextResponse.json({
      message: "Login successful",
      // The payload is now scrambled Base64
      payload: encodeData(designerData),
    });
    
  } catch (err) {
    console.error("Designer Login Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}