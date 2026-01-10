import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const designers = await prisma.designer.findMany({
    where: { availability: "Available" },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    designers.map((d) => ({
      id: d.id,
      name: d.fullname,
      category: d.profile?.designerType || "General",
      description: d.profile?.bio || "No description",
      designerLocation: d.location || "Not specified",
      imageUrl: d.profile?.profileImage || null,
    }))
  );
}