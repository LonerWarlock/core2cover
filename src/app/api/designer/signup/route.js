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

    // 4. Send Email to Admins
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "omnileshkarande@gmail.com, sohamphatakssp@gmail.com",
      subject: "New Designer Registration - Verification Needed",
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Designer Alert</h2>
          <p>A new designer has joined Core2Cover and is awaiting verification.</p>
          <ul>
            <li><strong>Name:</strong> ${fullname}</li>
            <li><strong>Email:</strong> ${emailNormalized}</li>
            <li><strong>Mobile:</strong> ${mobile}</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          <p>Please review their professional profile and verify the account in the Admin Panel.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Success", designer: { id: designer.id } }, { status: 201 });

  } catch (err) {
    console.error("DESIGNER SIGNUP ERROR:", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}