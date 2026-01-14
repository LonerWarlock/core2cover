import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    // 1. Await params to get the ID from the URL
    const { id } = await params; 
    const designerId = Number(id);

    // 2. Get form data from request body
    const data = await request.json();

    // 3. Create the hire request
    const hireRequest = await prisma.designerHireRequest.create({
      data: {
        userId: Number(data.userId),
        designerId: designerId, // From URL param
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        location: data.location,
        budget: Number(data.budget),
        workType: data.workType,
        timelineDate: data.timelineDate ? new Date(data.timelineDate) : null,
        description: data.description,
        status: "pending"
      }
    });

    return NextResponse.json({ message: "Success", hireRequest }, { status: 201 });
  } catch (err) {
    console.error("HIRE_API_ERROR:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}