import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  const { availability } = await request.json();
  const designer = await prisma.designer.update({
    where: { id: Number(params.id) },
    data: { availability },
  });
  return NextResponse.json({ message: "Updated", availability: designer.availability });
}