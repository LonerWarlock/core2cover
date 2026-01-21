import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (isNaN(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            name: true,
            business: { select: { city: true, state: true } },
            delivery: true,
          },
        },
        ratings: { select: { stars: true, comment: true } },
      },
    });

    if (!product) return NextResponse.json(null, { status: 404 });

    const total = product.ratings.reduce((s, r) => s + r.stars, 0);
    const count = product.ratings.length;

    return NextResponse.json({
      id: product.id,
      sellerId: product.sellerId,
      title: product.name,
      productType: product.productType,
      seller: product.seller?.name || "Unknown Seller",
      origin: product.seller?.business
        ? `${product.seller.business.city}, ${product.seller.business.state}`
        : "Not specified",
      price: product.price,
      images: product.images,
      video: product.video,
      description: product.description,
      availability: product.availability,
      avgRating: count ? total / count : 0,
      ratingCount: count,

      // LOGISTICS DATA FROM PRODUCT & SELLER MODELS
      unit: product.unit ?? "pcs",
      unitsPerTrip: product.unitsPerTrip ?? 1,
      conversionFactor: product.conversionFactor ?? 1,

      deliveryTimeMin: product.seller?.delivery?.deliveryTimeMin ?? null,
      deliveryTimeMax: product.seller?.delivery?.deliveryTimeMax ?? null,
      installationAvailable: product.seller?.delivery?.installationAvailable ?? "no",
      installationCharge: product.seller?.delivery?.installationCharge ?? 0,

      // CRITICAL FIX: Ensure charge is fetched from Product first, then fallback to Seller
      shippingChargeType: product.seller?.delivery?.shippingChargeType ?? "Paid",
      shippingCharge: (product.shippingCharge && product.shippingCharge > 0)
        ? product.shippingCharge
        : (product.seller?.delivery?.shippingCharge ?? 0),
    });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const productId = Number(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const formData = await request.formData();

    // 1. Extract Basic Fields
    const name = formData.get("name");
    const category = formData.get("category");
    const productType = formData.get("productType")?.toString(); 
    const price = formData.get("price");
    const description = formData.get("description");
    const availability = formData.get("availability");
    
    // 2. Extract Logistics Fields
    const unit = formData.get("unit");
    const rawUnitsPerTrip = formData.get("unitsPerTrip");
    const rawConversionFactor = formData.get("conversionFactor");

    // 3. Handle Image parsing
    const existingImagesRaw = formData.get("existingImages");
    let keptImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
    
    const newFiles = formData.getAll("images");
    let newImageUrls = [];
    if (newFiles.length > 0) {
      const results = await Promise.all(
        newFiles.filter(file => file instanceof File && file.size > 0)
                .map(file => uploadToCloudinary(file, "coretocover/products/images"))
      );
      newImageUrls = results.map(r => r.secure_url);
    }

    // 4. Construct strictly typed Update Data
    const updateData = {
      name: name?.toString().trim(),
      category: category?.toString().trim(),
      productType: productType,
      price: price ? parseFloat(price.toString()) : 0, 
      description: description?.toString().trim() || null,
      availability: availability?.toString(),
      images: [...keptImages, ...newImageUrls],
    };

    // 5. Force numeric conversion for Logistics
    // Note: Use the exact string "material" or "Raw Material" as stored in your DB
    if (productType === "material" || productType === "Raw Material") {
      updateData.unit = unit?.toString() || "pcs";
      
      // CRITICAL FIX: Convert strings to Int/Float for Prisma
      if (rawUnitsPerTrip) {
        updateData.unitsPerTrip = parseInt(rawUnitsPerTrip.toString());
      }
      if (rawConversionFactor) {
        updateData.conversionFactor = parseFloat(rawConversionFactor.toString());
      }
    } else {
      // Defaults for non-material products
      updateData.unit = "pcs";
      updateData.unitsPerTrip = 1;
      updateData.conversionFactor = 1.0;
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
    console.error("UPDATE ERROR:", err);
    return NextResponse.json({ 
      message: "Update failed", 
      error: err.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // Increment the shareCount atomically
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        shareCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        shareCount: true,
      }
    });

    return NextResponse.json({
      message: "Share logged",
      shareCount: updatedProduct.shareCount
    }, { status: 200 });

  } catch (err) {
    console.error("SHARE_LOG_ERROR:", err);
    return NextResponse.json({ message: "Failed to log share" }, { status: 500 });
  }
}