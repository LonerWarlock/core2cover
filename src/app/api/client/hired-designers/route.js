import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"; 

/**
 * EASY ENCRYPTION HELPER
 * Encodes data to Base64 to mask it from the Network Tab.
 */
const encodeData = (data) => {
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString("base64");
};

export async function GET(request) {
  try {
    // 1. Identity Pinning: Verify the secure session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
    }

    // 2. Verified Data Lookup
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ message: "Identity mismatch" }, { status: 404 });
    }

    // 3. Fetch requests associated with verified ID
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

    /* =========================================
        SECURE ENCODED RESPONSE
    ========================================= */
    return NextResponse.json({
      payload: encodeData(formatted)
    });

  } catch (error) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}