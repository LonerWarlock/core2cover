import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { sellerId, businessName, sellerType, ...rest } = body;

    const existing = await prisma.sellerBusinessDetails.findUnique({
      where: { sellerId: Number(sellerId) },
    });
    if (existing) return NextResponse.json({ message: "Already exists" }, { status: 409 });

    const business = await prisma.sellerBusinessDetails.create({
      data: { sellerId: Number(sellerId), businessName, sellerType, ...rest },
    });
    return NextResponse.json({ message: "Saved", business }, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}