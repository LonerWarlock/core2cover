import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    // 1. Await params (Required in Next.js 15/16)
    const { id } = await params;
    
    // 2. Parse the body
    const { status } = await request.json();

    // 3. Perform the update with Number casting
    const updatedRequest = await prisma.designerHireRequest.update({
      where: { 
        id: Number(id) // CRITICAL: Ensure this is a number
      },
      data: { 
        status: status 
      },
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("STATUS_UPDATE_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to update status", error: error.message },
      { status: 500 }
    );
  }
}