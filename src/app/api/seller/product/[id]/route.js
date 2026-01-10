import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ==========================================
// DELETE: Remove a Product
// ==========================================
export async function DELETE(request, { params }) {
  try {
    const productId = Number(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}

// ==========================================
// PUT: Update a Product (Multipart Form Data)
// ==========================================
export async function PUT(request, { params }) {
  try {
    const productId = Number(params.id);
    const formData = await request.formData();

    // 1. Extract Text Fields
    const name = formData.get("name");
    const category = formData.get("category");
    const productType = formData.get("productType");
    const price = formData.get("price");
    const description = formData.get("description");
    const availability = formData.get("availability");
    const existingImagesRaw = formData.get("existingImages");
    const removeVideo = formData.get("removeVideo");

    // 2. Validation
    if (!productType) {
      return NextResponse.json({ message: "productType is required" }, { status: 400 });
    }

    // 3. Handle Existing Images (JSON Parsing)
    let keptImages = [];
    if (existingImagesRaw) {
      try {
        keptImages = JSON.parse(existingImagesRaw);
      } catch (e) {
        console.error("Error parsing existingImages:", e);
        keptImages = [];
      }
    }

    // 4. Handle New Image Uploads (Cloudinary)
    const newImageFiles = formData.getAll("images"); // Returns array of File objects
    let newImageUrls = [];

    if (newImageFiles && newImageFiles.length > 0) {
      // Filter out invalid/empty files
      const validFiles = newImageFiles.filter((f) => f.size > 0);
      
      const uploadPromises = validFiles.map((file) => 
        uploadToCloudinary(file, "coretocover/products/images")
      );
      
      const results = await Promise.all(uploadPromises);
      newImageUrls = results.map((r) => r.secure_url);
    }

    // Combine kept images (old URLs) with new uploads (new URLs)
    const finalImages = [...keptImages, ...newImageUrls];

    // 5. Handle Video Logic
    const videoFile = formData.get("video");
    let videoPath = undefined; // undefined means "do not update this field" in Prisma

    if (videoFile && videoFile.size > 0) {
      // User uploaded a NEW video -> Upload and set URL
      const videoUpload = await uploadToCloudinary(videoFile, "coretocover/products/videos");
      videoPath = videoUpload.secure_url;
    } else if (removeVideo === "true") {
      // User explicitly clicked "Remove Video" -> Set to null
      videoPath = null;
    }

    // 6. Update Database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name?.trim(),
        category: category?.trim(),
        productType,
        price: Number(price),
        description: description?.trim() || null,
        availability,
        images: finalImages,
        // Only update video field if we have a new URL or explicit null
        ...(videoPath !== undefined && { video: videoPath }),
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}