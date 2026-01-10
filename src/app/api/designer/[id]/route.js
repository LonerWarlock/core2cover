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
    designer: designer.fullname,
    category: designer.profile?.designerType || "General",
    description: designer.profile?.bio || "No description",
    origin: designer.location || "Not specified",
    image: designer.profile?.profileImage,
    portfolio: designer.works.map((w) => ({
      id: w.id,
      image: w.image,
      description: w.description,
    })),
  });
}