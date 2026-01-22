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
    // 1. Await params for Next.js 15+ stability
    const resolvedParams = await params;
    const productId = Number(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const formData = await request.formData();

    // 2. Extract basic fields
    const name = formData.get("name")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const productType = formData.get("productType")?.toString(); 
    const priceRaw = formData.get("price");
    const description = formData.get("description")?.toString().trim();
    const availability = formData.get("availability")?.toString();

    // 3. Handle image logic
    const existingImagesRaw = formData.get("existingImages");
    let keptImages = [];
    try {
      keptImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
    } catch (e) {
      keptImages = [];
    }

    const newImageFiles = formData.getAll("images");
    let newImageUrls = [];
    if (newImageFiles.length > 0) {
      const validFiles = newImageFiles.filter(f => f instanceof File && f.size > 0);
      const results = await Promise.all(
        validFiles.map(f => uploadToCloudinary(f, "coretocover/products/images"))
      );
      newImageUrls = results.map(r => r.secure_url);
    }

    // 4. Construct strictly typed Update Data
    const price = parseFloat(priceRaw?.toString() || "0");
    const updateData = {
      name,
      category,
      productType,
      price: isNaN(price) ? 0 : price,
      description: description || null,
      availability,
      images: [...keptImages, ...newImageUrls],
    };

    // 5. Force numeric conversion for Logistics (Prisma Int/Float requirements)
    if (productType === "material" || productType === "Raw Material") {
      const unit = formData.get("unit")?.toString() || "pcs";
      const rawUPT = formData.get("unitsPerTrip");
      const rawCF = formData.get("conversionFactor");

      updateData.unit = unit;
      
      const upt = parseInt(rawUPT?.toString() || "1");
      const cf = parseFloat(rawCF?.toString() || "1");

      updateData.unitsPerTrip = isNaN(upt) ? 1 : upt;
      updateData.conversionFactor = isNaN(cf) ? 1.0 : cf;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ 
      message: "Product updated successfully", 
      product: updatedProduct 
    });

  } catch (err) {
    console.error("FULL DATABASE ERROR:", err); // Check your server terminal, not just browser
    return NextResponse.json({ 
      message: "Update failed", 
      error: err.message 
    }, { status: 500 });
  }
}