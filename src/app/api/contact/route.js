import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ message: "Message is too long" }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      },
    });

    return NextResponse.json({ message: "Message received successfully" }, { status: 201 });
  } catch (err) {
    console.error("CONTACT FORM ERROR:", err);
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
  }
}