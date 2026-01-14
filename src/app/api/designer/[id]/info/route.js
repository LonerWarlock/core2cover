import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const designer = await prisma.designer.findUnique({
      where: { id: Number(id) },
      include: {
        profile: true,
        works: { orderBy: { createdAt: 'desc' } }
      }
    });
    return NextResponse.json(designer);
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}