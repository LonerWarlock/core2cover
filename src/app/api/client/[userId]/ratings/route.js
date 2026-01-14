import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // 1. Await params (Mandatory in Next.js 15+)
    // 2. Use 'userId' because that is exactly what your folder is named
    const { userId } = await params; 
    
    const id = Number(userId);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid Client ID" }, { status: 400 });
    }

    const ratings = await prisma.userRating.findMany({
      where: {
        // Querying the userRating table by looking through the hireRequest relation
        hireRequest: {
          userId: id,
        },
      },
      include: {
        designer: {
          select: {
            fullname: true,
            profile: {
              select: {
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(ratings, { status: 200 });
  } catch (error) {
    // Check your VS Code terminal for this specific log to see why it crashed
    console.error("CLIENT_RATINGS_DATABASE_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}