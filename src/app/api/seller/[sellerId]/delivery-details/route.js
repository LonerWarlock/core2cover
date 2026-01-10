import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const delivery = await prisma.sellerDeliveryDetails.findUnique({ where: { sellerId: Number(params.sellerId) } });
  if (!delivery) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(delivery);
}