import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    let userLocation = searchParams.get("location");

    // If no location in params, try to get it from the logged-in user's profile
    if (!userLocation) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { address: true }
        });
        userLocation = dbUser?.address || "";
      }
    }

    const designers = await prisma.designer.findMany({
  where: {
    availability: "Available",
    isVerified: true, // - Only fetch designers who are verified
    ...(search && {
      OR: [
        { fullname: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { profile: { bio: { contains: search, mode: 'insensitive' } } },
      ]
    })
  },
  include: {
    profile: true,
    ratings: { select: { stars: true } }
  }
});

    const formatted = designers.map(d => {
      const count = d.ratings.length;
      const avg = count > 0 ? (d.ratings.reduce((a, b) => a + b.stars, 0) / count).toFixed(1) : 0;
      
      return {
        id: d.id,
        name: d.fullname,
        location: d.location || "Remote",
        category: d.profile?.designerType || "Designer",
        image: d.profile?.profileImage,
        experience: d.profile?.experience,
        bio: d.profile?.bio,
        avgRating: Number(avg),
        totalRatings: count,
        // Match logic: Check if designer city is mentioned in user's address
        isLocal: userLocation && d.location && 
                 userLocation.toLowerCase().includes(d.location.toLowerCase())
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("SEARCH_ERROR:", err);
    return NextResponse.json({ message: "Search failed" }, { status: 500 });
  }
}