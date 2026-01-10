import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  const formData = await request.formData();
  const designerId = Number(formData.get("designerId"));
  const files = formData.getAll("images");
  const descriptions = formData.getAll("descriptions"); // Note: FormData behavior for arrays varies

  const worksData = [];
  
  for (let i = 0; i < files.length; i++) {
      const upload = await uploadToCloudinary(files[i], "designers/portfolio");
      worksData.push({
          designerId,
          image: upload.secure_url,
          description: descriptions[i] || null
      });
  }

  await prisma.designerWork.createMany({ data: worksData });
  return NextResponse.json({ message: "Saved" });
}