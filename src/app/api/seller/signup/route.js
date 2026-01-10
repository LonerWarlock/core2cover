import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: "All fields required" }, { status: 400 });
    }

    const emailNormalized = email.trim().toLowerCase();

    // 1. Verify that the email was OTP verified
    const verifiedOtp = await prisma.sellerOtp.findFirst({
      where: { email: emailNormalized, verified: true },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedOtp) {
      return NextResponse.json({ message: "Email not verified" }, { status: 403 });
    }

    // 2. Check if account already exists
    const existingSeller = await prisma.seller.findUnique({
      where: { email: emailNormalized },
    });

    if (existingSeller) {
      return NextResponse.json(
        {
          message: "Account already exists. Please login.",
          redirect: "/seller/login",
        },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create Seller
    const seller = await prisma.seller.create({
      data: {
        name,
        email: emailNormalized,
        phone,
        password: hashedPassword,
      },
    });

    // 5. Cleanup OTPs
    await prisma.sellerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    return NextResponse.json({ sellerId: seller.id }, { status: 201 });
  } catch (err) {
    console.error("SELLER SIGNUP ERROR:", err);
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}