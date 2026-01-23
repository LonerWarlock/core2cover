import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid email or password" }, 
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare the user data for encoding
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return NextResponse.json({
      message: "Login successful",
      token,
      // The payload is now scrambled Base64
      payload: encodeData(userData),
    });

  } catch (err) {
    console.error("Customer Login Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}