import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET Business Details
export async function GET(request, { params }) {
  const sellerId = Number(params.sellerId);
  const business = await prisma.sellerBusinessDetails.findUnique({ where: { sellerId } });
  if (!business) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(business);
}

// PUT Business Details
export async function PUT(request, { params }) {
  const sellerId = Number(params.sellerId);
  const body = await request.json();
  try {
    const updated = await prisma.sellerBusinessDetails.update({
      where: { sellerId },
      data: body,
    });
    return NextResponse.json({ message: "Updated successfully", updated });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}