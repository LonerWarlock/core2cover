import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { sellerId, password } = await request.json();
    const seller = await prisma.seller.findUnique({ where: { id: Number(sellerId) } });

    if (!seller) return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    const isValid = await bcrypt.compare(password, seller.password);

    if (!isValid) return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
    return NextResponse.json({ verified: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Verification failed" }, { status: 500 });
  }
}