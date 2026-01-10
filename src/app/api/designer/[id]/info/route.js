import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const designer = await prisma.designer.findUnique({
    where: { id: Number(params.id) },
    include: { profile: true, works: { orderBy: { createdAt: "desc" } } },
  });

  if (!designer) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: designer.id,
    name: designer.fullname,
    availability: designer.availability?.toLowerCase() === "available",
    designerType: designer.profile?.designerType || "Designer",
    location: designer.location,
    image: designer.profile?.profileImage,
    bio: designer.profile?.bio || "",
    portfolio: designer.profile?.portfolio,
    works: designer.works.map((w) => ({
      id: w.id,
      img: w.image,
      title: w.description?.split(".")[0] || "Work",
      desc: w.description || "",
    })),
  });
}