import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const body = await request.json();
  const { userId, timelineDate, ...rest } = body;
  
  if (!userId) return NextResponse.json({ message: "Login required" }, { status: 401 });

  const hire = await prisma.designerHireRequest.create({
    data: {
      userId: Number(userId),
      designerId: Number(params.id),
      timelineDate: timelineDate ? new Date(timelineDate) : null,
      ...rest,
      budget: Number(rest.budget),
    },
  });

  return NextResponse.json(hire, { status: 201 });
}