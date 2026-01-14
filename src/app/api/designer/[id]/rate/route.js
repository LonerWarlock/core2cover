import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    // 1. Await params (CRITICAL for Next.js 15+)
    const { id } = await params;
    const designerId = Number(id);

    // 2. Parse the request body
    const { hireRequestId, stars, review } = await request.json();

    // 3. Validation
    if (!hireRequestId || !stars) {
      return NextResponse.json(
        { message: "Missing required fields (hireRequestId or stars)" },
        { status: 400 }
      );
    }

    // 4. Fetch Designer details to populate 'reviewerName'
    // This prevents Prisma from crashing if 'reviewerName' is required
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      select: { fullname: true }
    });

    if (!designer) {
      return NextResponse.json(
        { message: "Designer not found" },
        { status: 404 }
      );
    }

    // 5. Create UserRating using a Transaction or simple Create
    // We explicitly map the fields to match your schema
    const newRating = await prisma.userRating.create({
      data: {
        hireRequestId: Number(hireRequestId),
        designerId: designerId,
        reviewerName: designer.fullname, // Designer is the reviewer
        stars: Number(stars),
        review: review || "",
      },
    });

    // 6. Return 201 Created to trigger the frontend 'Success' block
    return NextResponse.json(
      { 
        message: "Client rated successfully", 
        data: newRating 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("BACKEND_RATING_ERROR:", error);

    // Handle Unique Constraint (If client is already rated for this request)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "This client has already been rated for this project." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}