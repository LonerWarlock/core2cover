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
      deliveryTimeMin: product.seller?.delivery?.deliveryTimeMin ?? null,
      deliveryTimeMax: product.seller?.delivery?.deliveryTimeMax ?? null,
      installationAvailable: product.seller?.delivery?.installationAvailable ?? "no",
      installationCharge: product.seller?.delivery?.installationCharge ?? 0,
      shippingChargeType: product.seller?.delivery?.shippingChargeType ?? "free",
      shippingCharge: product.seller?.delivery?.shippingCharge ?? 0,
    });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params; // This is the PRODUCT ID
    const formData = await request.formData();

    const existingImagesRaw = formData.get("existingImages");
    let keptImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];

    // Media Uploads
    const newFiles = formData.getAll("images");
    let newImageUrls = [];
    if (newFiles.length > 0) {
      const results = await Promise.all(
        newFiles.map(file => uploadToCloudinary(file, "coretocover/products/images"))
      );
      newImageUrls = results.map(r => r.secure_url);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: formData.get("name"),
        price: Number(formData.get("price")),
        category: formData.get("category"),
        description: formData.get("description"),
        availability: formData.get("availability"),
        images: [...keptImages, ...newImageUrls],
      },
    });

    return NextResponse.json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
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