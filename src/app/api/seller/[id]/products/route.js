import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

// ==========================================
// GET: Fetch products for a specific seller
// URL: /api/seller/[id]/products
// ==========================================
export async function GET(request, { params }) {
  try {
    const { id } = await params; // This is the SELLER ID
    const products = await prisma.product.findMany({
      where: { sellerId: Number(id) },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch catalogue" }, { status: 500 });
  }
}

// ==========================================
// DELETE: Remove a Product
// URL: /api/seller/[id]/products (Note: In this context, usually product ID is passed)
// ==========================================
// IMPORTANT: If this file is for a specific product, the [id] is the Product ID. 
// If it is for a seller list, DELETE usually requires a query param or a different folder.
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = Number(resolvedParams.id);

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

// ==========================================
// PUT: Update a Product (Multipart Form Data)
// URL: /api/seller/[id]/products
// ==========================================
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = Number(resolvedParams.id);
    const formData = await request.formData();

    // Data extraction
    const name = formData.get("name");
    const category = formData.get("category");
    const productType = formData.get("productType");
    const price = formData.get("price");
    const description = formData.get("description");
    const availability = formData.get("availability");
    const existingImagesRaw = formData.get("existingImages");
    const removeVideo = formData.get("removeVideo");

    let keptImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];

    // Media Uploads
    const newImageFiles = formData.getAll("images"); 
    let newImageUrls = [];
    if (newImageFiles.length > 0) {
      const uploadPromises = newImageFiles.map(file => 
        uploadToCloudinary(file, "coretocover/products/images")
      );
      const results = await Promise.all(uploadPromises);
      newImageUrls = results.map(r => r.secure_url);
    }

    const finalImages = [...keptImages, ...newImageUrls];

    let videoPath = undefined; 
    const videoFile = formData.get("video");
    if (videoFile && videoFile.size > 0) {
      const vResult = await uploadToCloudinary(videoFile, "coretocover/products/videos");
      videoPath = vResult.secure_url;
    } else if (removeVideo === "true") {
      videoPath = null;
    }

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
        ...(videoPath !== undefined && { video: videoPath }),
      },
    });

    return NextResponse.json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}