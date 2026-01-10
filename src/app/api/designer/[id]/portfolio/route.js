import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  const works = await prisma.designerWork.findMany({
    where: { designerId: Number(params.id) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    works.map((w) => ({
      id: w.id,
      description: w.description,
      preview: w.image, // Cloudinary URL
    }))
  );
}