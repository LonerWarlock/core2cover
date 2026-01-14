import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "User ID required" }, { status: 400 });
  }

  try {
    const requests = await prisma.designerHireRequest.findMany({
      where: { userId: Number(userId) },
      include: {
        designer: {
          include: { profile: true }
        },
        rating: true,      // Rating given BY customer TO designer
        userRating: true,  // Rating given BY designer TO customer
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = requests.map(r => ({
      id: r.id,
      designerId: r.designerId,
      name: r.designer.fullname,
      image: r.designer.profile?.profileImage,
      category: r.designer.profile?.designerType,
      location: r.location,
      workType: r.workType,
      budget: r.budget,
      status: r.status,
      rating: r.rating,         
      userRating: r.userRating 
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}