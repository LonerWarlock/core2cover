// src/app/api/product/[id]/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const encodeData = (data) => {
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString("base64");
};

// src/app/api/product/[id]/route.js

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            business: true,
            delivery: true,
          },
        },
        ratings: true,
      },
    });

    if (!product) return NextResponse.json(null, { status: 404 });

    // FIX: Include description and ensure consistent naming
    const productData = {
      id: product.id,
      sellerId: product.sellerId,
      title: product.name, // Frontend expects 'title'
      name: product.name,  // Fallback for logic checks
      price: product.price,
      images: product.images,
      description: product.description || "No description provided.", // ADDED
      productType: product.productType, // Used for calculation logic
      unit: product.unit ?? "pcs",
      unitsPerTrip: product.unitsPerTrip ?? 1,
      conversionFactor: product.conversionFactor ?? 1,
      
      // FIX: Ensure seller is passed in a way the frontend can resolve
      seller: product.seller?.name || "Verified Seller", 
      
      installationAvailable: product.seller?.delivery?.installationAvailable ?? "no",
      installationCharge: product.seller?.delivery?.installationCharge ?? 0,
      shippingChargeType: product.seller?.delivery?.shippingChargeType ?? "Paid",
      shippingCharge: product.seller?.delivery?.shippingCharge ?? 0,
    };

    return NextResponse.json({
      payload: encodeData(productData)
    });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ==========================================
    PUT: Update Product & Logistics
   ========================================== */
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = Number(resolvedParams.id);

    if (isNaN(productId)) return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });

    const formData = await request.formData();

    const name = formData.get("name")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const productType = formData.get("productType")?.toString();
    const description = formData.get("description")?.toString().trim();
    const availability = formData.get("availability")?.toString();

    const existingImagesRaw = formData.get("existingImages");
    let keptImages = [];
    try { keptImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : []; } 
    catch (e) { keptImages = []; }

    const newImageFiles = formData.getAll("images");
    let newImageUrls = [];
    if (newImageFiles.length > 0) {
      const validFiles = newImageFiles.filter(f => f instanceof File && f.size > 0);
      const results = await Promise.all(
        validFiles.map(f => uploadToCloudinary(f, "coretocover/products/images"))
      );
      newImageUrls = results.map(r => r.secure_url);
    }

    const newVideoFile = formData.get("video");
    const existingVideo = formData.get("existingVideo");
    let finalVideoUrl = existingVideo || null;

    if (newVideoFile && newVideoFile instanceof File) {
      const videoResult = await uploadToCloudinary(newVideoFile, "coretocover/products/videos");
      finalVideoUrl = videoResult.secure_url;
    }

    const rawPrice = formData.get("price")?.toString();
    const parsedPrice = parseFloat(rawPrice || "0");

    const updateData = {
      name: name || "Untitled Product",
      category: category || "Uncategorized",
      productType: productType || "finished",
      price: isNaN(parsedPrice) ? 0 : parsedPrice,
      description: description || null,
      availability: availability || "available",
      images: [...keptImages, ...newImageUrls],
      video: finalVideoUrl,
    };

    if (productType === "material" || productType === "Raw Material") {
      const unit = formData.get("unit")?.toString() || "pcs";
      const rawUPT = formData.get("unitsPerTrip")?.toString();
      const rawCF = formData.get("conversionFactor")?.toString();

      updateData.unit = unit;
      const upt = parseInt(rawUPT || "1", 10);
      const cf = parseFloat(rawCF || "1.0");

      updateData.unitsPerTrip = isNaN(upt) ? 1 : upt;
      updateData.conversionFactor = isNaN(cf) ? 1.0 : cf;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ 
      message: "Catalogue updated successfully", 
      product: updatedProduct 
    });

  } catch (err) {
    console.error("PRISMA CRITICAL UPDATE ERROR:", err);
    return NextResponse.json({ message: "Update failed", error: err.message }, { status: 500 });
  }
}

/* ==========================================
    DELETE: Remove Product
   ========================================== */
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const productId = Number(resolvedParams.id);
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (err) { 
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 }); 
  }
}

/* ==========================================
    PATCH: Log Share Activity
   ========================================== */
export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (isNaN(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { shareCount: { increment: 1 } },
      select: { id: true, shareCount: true }
    });

    return NextResponse.json({ message: "Share logged", shareCount: updatedProduct.shareCount });
  } catch (err) { 
    console.error("SHARE_LOG_ERROR:", err);
    return NextResponse.json({ message: "Failed to log share" }, { status: 500 }); 
  }
}