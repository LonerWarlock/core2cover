import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const designerId = Number(resolvedParams.id);

    if (isNaN(designerId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const ratings = await prisma.designerRating.findMany({
      where: { designerId },
      include: {
        // Fix: Go through hireRequest to reach the user
        hireRequest: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ratings);
  } catch (err) {
    console.error("GET DESIGNER RATINGS ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}