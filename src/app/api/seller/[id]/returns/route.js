import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sellerId = Number(id);

    const returns = await prisma.returnRequest.findMany({
      where: { sellerId },
      include: {
        user: {
          select: { name: true, email: true }
        },
        orderItem: true
      },
      orderBy: { requestedAt: "desc" }
    });

    return NextResponse.json({ returns });
  } catch (err) {
    console.error("FETCH RETURNS ERROR:", err);
    return NextResponse.json({ message: "Failed to fetch returns" }, { status: 500 });
  }
}