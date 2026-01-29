import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"; //

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
    const { fullname, email, mobile, location, password } = await request.json();
    const emailNormalized = email.trim().toLowerCase();

    // 1. Check for Conflicts
    const existingDesigner = await prisma.designer.findFirst({
      where: { OR: [{ email: emailNormalized }, { mobile: mobile }] }
    });

    if (existingDesigner) {
      return NextResponse.json({ message: "Email or Mobile already registered" }, { status: 409 });
    }

    // 2. Verify OTP
    const verifiedOtp = await prisma.designerOtp.findFirst({
      where: { email: emailNormalized, verified: true },
    });
    if (!verifiedOtp) return NextResponse.json({ message: "Email not verified" }, { status: 403 });

    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create Designer with Admin Notification
    const designer = await prisma.$transaction(async (tx) => {
      const newDesigner = await tx.designer.create({
        data: { fullname, email: emailNormalized, mobile, location, passwordHash },
      });
      await tx.designerOtp.deleteMany({ where: { email: emailNormalized } });
      return newDesigner;
    });

    // 4. Send Email to Team Core2Cover
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Your system email (e.g., noreply@core2cover.com)
      to: "team.core2cover@gmail.com", // The new target email
      replyTo: emailNormalized, // This allows you to reply directly to the seller
      subject: `New Designer Alert: ${fullname}`,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 10px;">
        New Registration - Verification Required
      </h2>
      <p>A new professional Designer has registered on <strong>Core2Cover</strong> and is waiting for your verification.</p>
      <p>Verify the designer on <strong>Core2Cover Admin Panel</strong>.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Designer Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Name:</strong> ${fullname}</li>
          <li><strong>Email:</strong> ${emailNormalized}</li>
          <li><strong>Mobile:</strong> ${mobile}</li>
          <li><strong>Location:</strong> ${location}</li>
        </ul>
      </div>

      <p><em>Note: You can click "Reply" to this email to contact the user directly at their registered email.</em></p>
      
    </div>`,
    });
    return NextResponse.json({ message: "Success", designer: { id: designer.id } }, { status: 201 });

  } catch (err) {
    console.error("DESIGNER SIGNUP ERROR:", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}