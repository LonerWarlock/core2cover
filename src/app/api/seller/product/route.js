import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const sellerId = formData.get("sellerId");
    const name = formData.get("name");
    const price = formData.get("price");
    const productType = formData.get("productType");
    const category = formData.get("category");
    const description = formData.get("description");
    const availability = formData.get("availability") || "available";

    // Extract files (All inputs named 'images' will be collected)
    const imageFiles = formData.getAll("images"); 
    const videoFile = formData.get("video"); // Single file or null

    if (!sellerId || !name || !price || !productType || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ message: "At least one image is required" }, { status: 400 });
    }

    // 1. Upload Images to Cloudinary
    const imageUploadPromises = imageFiles.map((file) => 
      uploadToCloudinary(file, "coretocover/products/images")
    );
    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map((img) => img.secure_url);

    // 2. Upload Video (if exists)
    let videoUrl = null;
    if (videoFile && videoFile.size > 0) {
      const uploadedVideo = await uploadToCloudinary(videoFile, "coretocover/products/videos");
      videoUrl = uploadedVideo.secure_url;
    }

    // 3. Save to Database
    const product = await prisma.product.create({
      data: {
        sellerId: Number(sellerId),
        name: name.trim(),
        price: Number(price),
        productType: productType.toLowerCase(),
        category: category.trim(),
        description: description?.trim() || null,
        images: imageUrls, // Storing full Cloudinary URLs now
        video: videoUrl,
        availability,
      },
    });

    return NextResponse.json({ message: "Product added", product }, { status: 201 });

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}