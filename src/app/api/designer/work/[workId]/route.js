import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

// PUT (Update Work)
export async function PUT(request, { params }) {
  const formData = await request.formData();
  const workId = Number(params.workId);
  const description = formData.get("description");
  const file = formData.get("image");

  let imagePath = undefined;
  if (file && typeof file !== "string") {
    const res = await uploadToCloudinary(file, "designers/portfolio");
    imagePath = res.secure_url;
  }

  const updated = await prisma.designerWork.update({
    where: { id: workId },
    data: {
      description,
      ...(imagePath && { image: imagePath }),
    },
  });
  return NextResponse.json({ message: "Updated", work: updated });
}

// DELETE Work
export async function DELETE(request, { params }) {
  await prisma.designerWork.delete({ where: { id: Number(params.workId) } });
  return NextResponse.json({ message: "Deleted" });
}