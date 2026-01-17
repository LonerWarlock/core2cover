import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"; 

export async function GET(request) {
  try {
    // 1. Identify the user via their secure session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user's ID from the DB using their session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 3. Query hire requests associated with this User ID
    const requests = await prisma.designerHireRequest.findMany({
      where: { userId: user.id },
      include: {
        designer: {
          include: { profile: true }
        },
        rating: true,      
        userRating: true,  
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Map and format the data
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

    // FIX: Return the correct variable name
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}