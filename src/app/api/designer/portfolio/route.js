// src/app/api/designer/portfolio/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const designerId = Number(formData.get("designerId"));
    if (!designerId || isNaN(designerId)) {
      return NextResponse.json({ message: "Valid Designer ID is required" }, { status: 400 });
    }

    // Support both 'image' (single) and 'images' (multiple/bulk)
    const files = formData.getAll("image").length > 0 
      ? formData.getAll("image") 
      : formData.getAll("images");

    // Support both 'description' and 'descriptions'
    const descriptions = formData.getAll("description").length > 0
      ? formData.getAll("description")
      : formData.getAll("descriptions");

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No images provided" }, { status: 400 });
    }

    // Process each file as a separate work entry (one image per work)
    const uploadPromises = files.map(async (file, index) => {
      if (!file || typeof file === "string" || file.size === 0) return null;

      try {
        const upload = await uploadToCloudinary(file, "coretocover/designers/portfolio");
        
        return {
          designerId,
          image: upload.secure_url, 
          description: descriptions[index] || null,
        };
      } catch (err) {
        console.error(`Cloudinary Error at index ${index}:`, err);
        throw new Error("Failed to upload one or more images");
      }
    });

    const worksData = (await Promise.all(uploadPromises)).filter(Boolean);

    if (worksData.length === 0) {
      return NextResponse.json({ message: "No valid images were processed" }, { status: 400 });
    }

    // Prisma createMany will insert each object as a new row in DesignerWork
    await prisma.designerWork.createMany({
      data: worksData,
    });

    return NextResponse.json({ 
      message: "Portfolio saved successfully",
      count: worksData.length 
    }, { status: 201 });

  } catch (err) {
    console.error("DATABASE_PORTFOLIO_ERROR:", err);
    return NextResponse.json({ 
      message: "Server error while saving portfolio",
      error: err.message 
    }, { status: 500 });
  }
}