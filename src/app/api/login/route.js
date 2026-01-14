import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Find the customer in the 'User' table
    // We trim and lowercase to ensure a match regardless of formatting
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });

    // 2. Validate user existence and password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid email or password" }, 
        { status: 401 }
      );
    }

    // 3. Generate a JWT Token for the Customer
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your_secret_key", // Ensure this is in your .env
      { expiresIn: "7d" }
    );

    // 4. Return the data in the format your frontend expects
    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (err) {
    console.error("Customer Login Error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}