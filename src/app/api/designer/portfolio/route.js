import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // 1. Extract and Validate Designer ID
    const designerId = Number(formData.get("designerId"));
    if (!designerId || isNaN(designerId)) {
      return NextResponse.json({ message: "Valid Designer ID is required" }, { status: 400 });
    }

    // 2. Extract arrays of images and descriptions
    const files = formData.getAll("images");
    const descriptions = formData.getAll("descriptions");

    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No images provided" }, { status: 400 });
    }

    // 3. Process Uploads to Cloudinary
    // Using Promise.all allows images to upload in parallel, making it much faster
    const uploadPromises = files.map(async (file, index) => {
      // Basic check to ensure it's a valid file
      if (!file || typeof file === "string" || file.size === 0) return null;

      try {
        const upload = await uploadToCloudinary(file, "coretocover/designers/portfolio");
        
        // Return the object structure expected by Prisma
        return {
          designerId,
          image: upload.secure_url, // This is the 'link' stored in the DB
          description: descriptions[index] || null,
        };
      } catch (err) {
        console.error(`Cloudinary Error at index ${index}:`, err);
        throw new Error("Failed to upload one or more images");
      }
    });

    // Wait for all uploads to finish
    const worksData = (await Promise.all(uploadPromises)).filter(Boolean);

    if (worksData.length === 0) {
      return NextResponse.json({ message: "No valid images were processed" }, { status: 400 });
    }

    // 4. Store the URLs in the Database
    // .createMany is efficient for inserting multiple rows at once
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