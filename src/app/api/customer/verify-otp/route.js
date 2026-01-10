import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) return NextResponse.json({ message: "Email & OTP required" }, { status: 400 });

    const record = await prisma.customerOtp.findFirst({
      where: { email: email.trim().toLowerCase(), expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.otpHash !== hashOtp(otp)) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    await prisma.customerOtp.update({ where: { id: record.id }, data: { verified: true } });
    return NextResponse.json({ message: "Email verified" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Verification failed" }, { status: 500 });
  }
}