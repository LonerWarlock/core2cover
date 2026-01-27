import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"; 


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
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: "All fields required" }, { status: 400 });
    }

    const emailNormalized = email.trim().toLowerCase();

    // 1. Verify OTP Status
    const verifiedOtp = await prisma.sellerOtp.findFirst({
      where: { email: emailNormalized, verified: true },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedOtp) {
      return NextResponse.json({ message: "Email not verified" }, { status: 403 });
    }

    const existingSeller = await prisma.seller.findUnique({
      where: { email: emailNormalized },
    });

    if (existingSeller) {
      return NextResponse.json({ message: "Account already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.seller.create({
      data: { name, email: emailNormalized, phone, password: hashedPassword },
    });

    await prisma.sellerOtp.deleteMany({ where: { email: emailNormalized } });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "omnileshkarande@gmail.com, sohamphatakssp@gmail.com",
      subject: "New Seller Registration - Verification Needed",
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Seller Alert</h2>
          <p>A new seller has registered on Core2Cover and requires verification.</p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${emailNormalized}</li>
            <li><strong>Phone:</strong> ${phone}</li>
          </ul>
          <p>Please log in to the Admin Panel to review documents and verify this account.</p>
        </div>
      `,
    });

    return NextResponse.json({ sellerId: seller.id }, { status: 201 });
  } catch (err) {
    console.error("SELLER SIGNUP ERROR:", err);
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}