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

    const name = formData.get("name");
    const category = formData.get("category");
    const productType = formData.get("productType");
    const price = formData.get("price");
    const description = formData.get("description");
    const availability = formData.get("availability");
    const existingImagesRaw = formData.get("existingImages");
    
    // NEW RAW MATERIAL FIELDS
    const unit = formData.get("unit");
    const unitsPerTrip = formData.get("unitsPerTrip");
    const conversionFactor = formData.get("conversionFactor");

    if (!productType) {
      return NextResponse.json({ message: "productType is required" }, { status: 400 });
    }

    let keptImages = [];
    if (existingImagesRaw) {
      try { keptImages = JSON.parse(existingImagesRaw); } 
      catch (e) { keptImages = []; }
    }

    const newImageFiles = formData.getAll("images");
    let newImageUrls = [];
    if (newImageFiles && newImageFiles.length > 0) {
      const validFiles = newImageFiles.filter((f) => f.size > 0);
      const uploadPromises = validFiles.map((file) => uploadToCloudinary(file, "coretocover/products/images"));
      const results = await Promise.all(uploadPromises);
      newImageUrls = results.map((r) => r.secure_url);
    }

    const finalImages = [...keptImages, ...newImageUrls];

    // Build the Update Object
    const updateData = {
      name: name?.trim(),
      category: category?.trim(),
      productType,
      price: Number(price),
      description: description?.trim() || null,
      availability,
      images: finalImages,
    };

    // Only apply raw material logic if the type matches
    if (productType === "material") {
      updateData.unit = unit || "pcs";
      updateData.unitsPerTrip = unitsPerTrip ? parseInt(unitsPerTrip) : 1;
      updateData.conversionFactor = conversionFactor ? parseFloat(conversionFactor) : 1.0;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
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