import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();

    // 1. Extract Fields
    const sellerId = formData.get("sellerId");
    const name = formData.get("name");
    const price = formData.get("price");
    const productType = formData.get("productType");
    const category = formData.get("category");
    const description = formData.get("description");
    const availability = formData.get("availability") || "available";

    // UPDATED LOGISTICS FIELDS
    const unit = formData.get("unit") || "pcs";
    
    // Logic to handle empty strings from the frontend
    const rawUnitsPerTrip = formData.get("unitsPerTrip");
    const rawConversionFactor = formData.get("conversionFactor");

    // Convert to numbers, defaulting to 1 if empty or invalid
    const unitsPerTrip = (rawUnitsPerTrip && !isNaN(rawUnitsPerTrip) && rawUnitsPerTrip !== "") 
      ? parseInt(rawUnitsPerTrip) 
      : 1;
    
    const conversionFactor = (rawConversionFactor && !isNaN(rawConversionFactor) && rawConversionFactor !== "") 
      ? parseFloat(rawConversionFactor) 
      : 1.0;

    // 2. Media Extraction
    const imageFiles = formData.getAll("images"); 
    const videoFile = formData.get("video");

    // 3. Validation
    if (!sellerId || !name || !price) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const seller = await prisma.seller.findUnique({
      where: { id: Number(sellerId) }
    });

    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    }

    // 4. Media Upload
    let imageUrls = [];
    if (imageFiles.length > 0) {
      const imagePromises = imageFiles.map((file) => 
        uploadToCloudinary(file, "coretocover/products/images")
      );
      const results = await Promise.all(imagePromises);
      imageUrls = results.map(r => r.secure_url);
    }

    let videoUrl = null;
    if (videoFile && videoFile.size > 0) {
      const vResult = await uploadToCloudinary(videoFile, "coretocover/products/videos");
      videoUrl = vResult.secure_url;
    }

    // 5. Create Record in Prisma
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: parseFloat(price),
        unit: unit,
        unitsPerTrip: unitsPerTrip,
        conversionFactor: conversionFactor, 
        productType: productType,
        category: category,
        description: description || null ,
        images: imageUrls, 
        video: videoUrl,
        availability: availability,
        sellerId: Number(sellerId),
      },
    });

    return NextResponse.json({ message: "Product listed!", product }, { status: 201 });

  } catch (err) {
    console.error("BACKEND UPLOAD ERROR:", err);
    return NextResponse.json(
      { message: "Backend Error: " + (err.message || "Upload failed") }, 
      { status: 500 }
    );
  }
}