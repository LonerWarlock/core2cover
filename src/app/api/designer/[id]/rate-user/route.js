import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const { hireRequestId, stars, review } = await request.json();
  const designerId = Number(params.id);

  const designer = await prisma.designer.findUnique({ where: { id: designerId } });
  
  await prisma.userRating.create({
    data: {
      hireRequestId: Number(hireRequestId),
      designerId,
      reviewerName: designer.fullname,
      stars: Number(stars),
      review,
    },
  });

  return NextResponse.json({ message: "User rated" }, { status: 201 });
}