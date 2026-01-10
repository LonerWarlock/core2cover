import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request, { params }) {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!file) return NextResponse.json({ message: "Image required" }, { status: 400 });

  const res = await uploadToCloudinary(file, "designers/portfolio");
  const work = await prisma.designerWork.create({
    data: {
      designerId: Number(params.id),
      description: formData.get("description"),
      image: res.secure_url,
    },
  });

  return NextResponse.json({ work }, { status: 201 });
}