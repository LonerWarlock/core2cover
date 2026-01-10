import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const designer = await prisma.designer.findUnique({
    where: { id: Number(params.id) },
    select: { id: true, fullname: true, email: true, availability: true },
  });
  if (!designer) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(designer);
}