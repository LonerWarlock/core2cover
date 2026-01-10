import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Helper for hashing
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const emailNormalized = email.trim().toLowerCase();

    // 1. Delete old OTPs for this seller email
    await prisma.sellerOtp.deleteMany({
      where: { email: emailNormalized },
    });

    // 2. Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save to sellerOtp table
    await prisma.sellerOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // 4. Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailNormalized,
      subject: "Casa Seller Verification Code",
      html: `
        <h2>Casa Seller Verification</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    return NextResponse.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("SELLER OTP ERROR:", err);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}