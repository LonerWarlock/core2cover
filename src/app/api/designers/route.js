import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const designers = await prisma.designer.findMany({
      where: {
        availability: "Available",
        // Multi-field search logic
        ...(search && {
          OR: [
            { fullname: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { profile: { bio: { contains: search, mode: 'insensitive' } } },
            { profile: { designerType: { contains: search, mode: 'insensitive' } } },
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
        totalRatings: count
      };
    });

    return NextResponse.json(formatted, { status: 200 });
  } catch (err) {
    console.error("SEARCH_ERROR:", err);
    return NextResponse.json({ message: "Search failed" }, { status: 500 });
  }
}