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

    // 1. Extract raw strings from form data
    const name = formData.get("name");
    const category = formData.get("category");
    const productType = formData.get("productType")?.toString(); // Ensure string
    const price = formData.get("price");
    const description = formData.get("description");
    const availability = formData.get("availability");
    
    // LOGISTICS FIELDS
    const unit = formData.get("unit");
    const rawUnitsPerTrip = formData.get("unitsPerTrip");
    const rawConversionFactor = formData.get("conversionFactor");

    // 2. Handle Image parsing
    const existingImagesRaw = formData.get("existingImages");
    let keptImages = [];
    if (existingImagesRaw) {
      try { keptImages = JSON.parse(existingImagesRaw); } catch (e) { keptImages = []; }
    }
    const newImageFiles = formData.getAll("images");
    let newImageUrls = [];
    if (newImageFiles.length > 0) {
      const validFiles = newImageFiles.filter((f) => f instanceof File && f.size > 0);
      const results = await Promise.all(validFiles.map((f) => uploadToCloudinary(f, "coretocover/products/images")));
      newImageUrls = results.map((r) => r.secure_url);
    }

    // 3. Construct strictly typed Update Data
    const updateData = {
      name: name?.toString().trim(),
      category: category?.toString().trim(),
      productType: productType,
      price: parseFloat(price.toString()), // Cast to Float
      description: description?.toString().trim() || null,
      availability: availability?.toString(),
      images: [...keptImages, ...newImageUrls],
    };

    // 4. Force numeric conversion for Logistics
    // Check for both common variations of the type string to be safe
    if (productType === "material" || productType === "Raw Material") {
      updateData.unit = unit?.toString() || "pcs";
      // Explicitly convert to Int and Float as required by schema.prisma
      if (rawUnitsPerTrip) updateData.unitsPerTrip = parseInt(rawUnitsPerTrip.toString());
      if (rawConversionFactor) updateData.conversionFactor = parseFloat(rawConversionFactor.toString());
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return NextResponse.json({ message: "Update failed", error: err.message }, { status: 500 });
  }
}