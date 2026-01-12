import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // Await the params Promise to access the id
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const designer = await prisma.designer.findUnique({
      where: { id },
      include: { 
        profile: true, 
        works: { orderBy: { createdAt: "desc" } } 
      },
    });

    if (!designer) {
      return NextResponse.json({ message: "Designer not found" }, { status: 404 });
    }

    return NextResponse.json(designer);
  } catch (err) {
    console.error("GET DESIGNER INFO ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}