import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Helper for hashing (Keep this utility logic close or in utils)
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ message: "Email required" }, { status: 400 });

    const emailNormalized = email.trim().toLowerCase();
    await prisma.customerOtp.deleteMany({ where: { email: emailNormalized } });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.customerOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailNormalized,
      subject: "Casa Email Verification",
      html: `<h2>Verify your email</h2><h1>${otp}</h1><p>Expires in 5 mins.</p>`,
    });

    return NextResponse.json({ message: "OTP sent" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}