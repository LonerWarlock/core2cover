import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get("userId"));

  if (!userId) return NextResponse.json({ message: "Login required" }, { status: 401 });

  const hires = await prisma.designerHireRequest.findMany({
    where: { userId },
    include: {
      designer: { include: { profile: true } },
      rating: true,
      userRating: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    hires.map((h) => ({
      id: h.id,
      designerId: h.designerId,
      name: h.designer.fullname,
      category: h.designer.profile?.designerType,
      location: h.designer.location,
      status: h.status,
      budget: h.budget,
      workType: h.workType,
      image: h.designer.profile?.profileImage,
      rating: h.rating,
      userRating: h.userRating,
    }))
  );
}