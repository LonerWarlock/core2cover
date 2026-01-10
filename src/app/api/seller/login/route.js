import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const seller = await prisma.seller.findUnique({ where: { email } });

    if (!seller || !(await bcrypt.compare(password, seller.password))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      seller: { id: seller.id, name: seller.name, email: seller.email },
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}