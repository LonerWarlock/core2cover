import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // Await the params Promise to access the id
    const resolvedParams = await params;
    const designerId = Number(resolvedParams.id);

    if (isNaN(designerId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const ratings = await prisma.designerRating.findMany({
      where: { designerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ratings);
  } catch (err) {
    console.error("GET DESIGNER RATINGS ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}