import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  const { hireRequestId, stars, review } = await request.json();
  const designerId = Number(params.id);

  const hire = await prisma.designerHireRequest.findUnique({
    where: { id: Number(hireRequestId) },
  });

  if (hire.designerId !== designerId) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  if (hire.status !== "completed") return NextResponse.json({ message: "Job not completed" }, { status: 400 });

  const rating = await prisma.designerRating.create({
    data: {
      designerId,
      hireRequestId: Number(hireRequestId),
      reviewerName: hire.fullName,
      stars: Number(stars),
      review,
    },
  });

  return NextResponse.json({ message: "Rated", ratingId: rating.id }, { status: 201 });
}