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

    // Get all entries for 'image' and 'description'
    // This allows the system to process 1 work or many works in one request
    const files = formData.getAll("image");
    const descriptions = formData.getAll("description");

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No images provided" }, { status: 400 });
    }

    // Process each image as a separate work entry (Strictly 1 image per work)
    const uploadPromises = files.map(async (file, index) => {
      // Skip invalid entries
      if (!file || typeof file === "string" || file.size === 0) return null;

      try {
        const upload = await uploadToCloudinary(file, "coretocover/designers/portfolio");
        
        // Each object in this array becomes a single row in the DesignerWork table
        return {
          designerId,
          image: upload.secure_url, 
          description: descriptions[index] || null,
        };
      } catch (err) {
        console.error(`Cloudinary Error at index ${index}:`, err);
        throw new Error("Failed to upload image");
      }
    });

    const worksData = (await Promise.all(uploadPromises)).filter(Boolean);

    if (worksData.length === 0) {
      return NextResponse.json({ message: "No valid images were processed" }, { status: 400 });
    }

    // Batch insert into the database
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