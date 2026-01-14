import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const designerId = Number(id);

    const portfolio = await prisma.designerWork.findMany({
      where: { designerId: designerId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(portfolio, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error fetching portfolio" }, { status: 500 });
  }
}