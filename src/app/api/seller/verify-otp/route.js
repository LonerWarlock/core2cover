import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP required" }, { status: 400 });
    }

    const emailNormalized = email.trim().toLowerCase();

    // 1. Find valid OTP record
    const record = await prisma.sellerOtp.findFirst({
      where: {
        email: emailNormalized,
        expiresAt: { gt: new Date() }, // Check expiry
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Validate existence and hash match
    if (!record) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    if (record.otpHash !== hashOtp(otp)) {
      return NextResponse.json({ message: "Incorrect OTP" }, { status: 400 });
    }

    // 3. Mark as verified
    await prisma.sellerOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("SELLER VERIFY OTP ERROR:", err);
    return NextResponse.json({ message: "OTP verification failed" }, { status: 500 });
  }
}