import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const returnId = Number(params.id);
  await prisma.returnRequest.update({
    where: { id: returnId },
    data: { refundStatus: "COMPLETED" },
  });
  return NextResponse.json({ message: "Refund Completed" });
}