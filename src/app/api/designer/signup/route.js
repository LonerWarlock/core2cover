import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { fullname, email, mobile, location, password } = await request.json();
    const emailNormalized = email.trim().toLowerCase();

    const verifiedOtp = await prisma.designerOtp.findFirst({
      where: { email: emailNormalized, verified: true },
    });
    if (!verifiedOtp) return NextResponse.json({ message: "Email not verified" }, { status: 403 });

    const existing = await prisma.designer.findUnique({ where: { email: emailNormalized } });
    if (existing) return NextResponse.json({ message: "Email exists" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const designer = await prisma.designer.create({
      data: { fullname, email: emailNormalized, mobile, location, passwordHash },
    });

    await prisma.designerOtp.deleteMany({ where: { email: emailNormalized } });

    return NextResponse.json({ message: "Success", designer: { id: designer.id } }, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}