import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const sellerEmail = request.headers.get("x-seller-email");
  if (!sellerEmail) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const seller = await prisma.seller.findUnique({ where: { email: sellerEmail } });
  if (!seller) return NextResponse.json({ message: "Seller not found" }, { status: 404 });

  const returns = await prisma.returnRequest.findMany({
    where: { sellerId: seller.id },
    include: { orderItem: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ returns });
}