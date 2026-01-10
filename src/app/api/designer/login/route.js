import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  const { email, password } = await request.json();
  const designer = await prisma.designer.findUnique({ where: { email: email.trim().toLowerCase() } });

  if (!designer || !(await bcrypt.compare(password, designer.passwordHash))) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Login successful",
    designer: { id: designer.id, fullname: designer.fullname, email: designer.email, availability: designer.availability },
  });
}