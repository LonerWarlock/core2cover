import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // 1. Save to Database first
    await prisma.contactMessage.create({
      data: { name, email, message },
    });

    // 2. Configure Transporter using EMAIL_PASS
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "team.core2cover@gmail.com",
        pass: process.env.EMAIL_PASS, // Updated to match your .env key
      },
    });

    // 3. Define Email
    const mailOptions = {
      from: `"Core2Cover" <team.core2cover@gmail.com>`,
      to: "team.core2cover@gmail.com",
      replyTo: email, 
      subject: `Contact Form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // 4. Send
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Success" }, { status: 201 });

  } catch (error) {
    // Log the specific error to the terminal to see if it's still an Auth issue
    console.error("CONTACT_API_ERROR:", error.message);
    return NextResponse.json({ message: "Failed to process request" }, { status: 500 });
  }
}