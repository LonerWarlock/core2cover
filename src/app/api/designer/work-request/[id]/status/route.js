import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  const { status } = await request.json();
  const updated = await prisma.designerHireRequest.update({
    where: { id: Number(params.id) },
    data: { status },
  });
  return NextResponse.json({ message: "Updated", status: updated.status });
}