import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    // 1. Await and unwrap params (Required for Next.js 15+)
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

    // 4. PREVENT UNIQUE CONSTRAINT ERROR: Check if rating already exists
    const existingRating = await prisma.designerRating.findUnique({
      where: { hireRequestId: Number(hireRequestId) }
    });

    if (existingRating) {
      return NextResponse.json(
        { message: "You have already rated this designer for this project." },
        { status: 409 }
      );
    }

    // 5. Fetch Designer details for the snapshot/validation
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      select: { fullname: true }
    });

    if (!designer) {
      return NextResponse.json({ message: "Designer not found" }, { status: 404 });
    }

    // 6. Create the rating BY the customer TO the designer
    // Note: Based on your schema, this is DesignerRating
    const newRating = await prisma.designerRating.create({
      data: {
        hireRequestId: Number(hireRequestId),
        designerId: designerId,
        stars: Number(stars),
        review: review || "",
        reviewerName: "Verified Client", // Or fetch user name from session
      },
    });

    return NextResponse.json(
      { message: "Designer rated successfully", data: newRating }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("BACKEND_RATING_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}