import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { fullname, email, mobile, location, password } = await request.json();
    const emailNormalized = email.trim().toLowerCase();

    // 1. Check for Existing Email OR Mobile
    const existingDesigner = await prisma.designer.findFirst({
      where: {
        OR: [
          { email: emailNormalized },
          { mobile: mobile }
        ]
      }
    });

    if (existingDesigner) {
      const conflictField = existingDesigner.email === emailNormalized ? "Email" : "Mobile number";
      return NextResponse.json(
        { message: `${conflictField} is already registered.` }, 
        { status: 409 }
      );
    }

    // 2. OTP Verification
    const verifiedOtp = await prisma.designerOtp.findFirst({
      where: { email: emailNormalized, verified: true },
    });
    if (!verifiedOtp) return NextResponse.json({ message: "Email not verified" }, { status: 403 });

    // 3. Password Hashing & Creation
    const passwordHash = await bcrypt.hash(password, 10);
    
    const designer = await prisma.$transaction(async (tx) => {
      const newDesigner = await tx.designer.create({
        data: { fullname, email: emailNormalized, mobile, location, passwordHash },
      });
      await tx.designerOtp.deleteMany({ where: { email: emailNormalized } });
      return newDesigner;
    });

    return NextResponse.json({ message: "Success", designer: { id: designer.id } }, { status: 201 });

  } catch (err) {
    console.error("DESIGNER SIGNUP ERROR:", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}