import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: body.userEmail.toLowerCase().trim() }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const hireRequest = await prisma.designerHireRequest.create({
      data: {
        userId: user.id, // Must be Int
        designerId: Number(id), // Must be Int
        fullName: body.fullName,
        email: body.email,
        mobile: body.mobile,
        location: body.location,
        budget: Number(body.budget),
        workType: body.workType,
        timelineDate: body.timelineDate ? new Date(body.timelineDate) : null, // Must be Date object
        description: body.description,
      }
    });

    return NextResponse.json(hireRequest, { status: 201 });
  } catch (error) {
    console.error("PRISMA ERROR:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}