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

    // 4. Send Email to Team Core2Cover
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Your system authenticated email
      to: "team.core2cover@gmail.com", // Your central team inbox
      replyTo: emailNormalized, // Allows you to hit 'Reply' to talk to the seller
      subject: `New Seller Alert: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #111; border-bottom: 2px solid #000; padding-bottom: 10px;">
            New Seller Registration
          </h2>
          <p>A new seller has joined the **Core2Cover** marketplace and is awaiting your verification.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Business Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${emailNormalized}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
          </div>

          <p>Please check the Admin Panel to review their product catalog and approve the account.</p>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://core2cover.vercel.app/admin" 
               style="background: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
               Go to Admin Panel
            </a>
          </div>
          <p style="font-size: 12px; color: #777; margin-top: 25px;">
            Note: This is an automated notification. You can reply directly to this email to contact the seller.
          </p>
        </div>
      `,
    });
    return NextResponse.json({ sellerId: seller.id }, { status: 201 });
  } catch (err) {
    console.error("SELLER SIGNUP ERROR:", err);
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}