import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const userEmail = request.headers.get("x-user-email");

    // 1. Authentication Check
    if (!userEmail) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract Data from FormData
    const orderItemId = Number(formData.get("orderItemId"));
    const reason = formData.get("reason");
    const note = formData.get("note");
    const refundMethod = formData.get("refundMethod");
    const images = formData.getAll("images"); // Array of File objects

    // 3. Validation
    if (!["STORE_CREDIT", "ORIGINAL_PAYMENT"].includes(refundMethod)) {
      return NextResponse.json({ message: "Invalid refund method" }, { status: 400 });
    }

    // 4. Fetch User and Order Item
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true, seller: true },
    });

    // 5. Security & Status Logic
    if (!item || item.order.userId !== user.id) {
      return NextResponse.json({ message: "Invalid order" }, { status: 403 });
    }

    if (item.status !== "fulfilled") {
      return NextResponse.json({
        message: "Only delivered items can be returned",
      }, { status: 400 });
    }

    // Prevent duplicate returns
    const existing = await prisma.returnRequest.findUnique({
      where: { orderItemId: item.id },
    });

    if (existing) {
      return NextResponse.json({
        message: "Return already requested for this item",
      }, { status: 400 });
    }

    // 6. Upload Images to Cloudinary
    const uploadPromises = images.map((file) =>
      uploadToCloudinary(file, "coretocover/returns")
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((r) => r.secure_url);

    /* =========================
       START TRANSACTION
    ========================= */
    const result = await prisma.$transaction(async (tx) => {
      // A. Create the Return Request
      const returnRequest = await tx.returnRequest.create({
        data: {
          orderItemId: item.id,
          userId: user.id,
          productName: item.materialName,
          sellerId: item.sellerId,
          sellerName: item.seller?.name || "Unknown Seller",
          reason: reason,
          note: note || null,
          images: imageUrls,
          refundMethod: refundMethod,
          refundAmount: item.totalAmount,
        },
      });

      // B. Update the Order Item Status
      await tx.orderItem.update({
        where: { id: item.id },
        data: {
          returnStatus: "REQUESTED",
          returnRequestedAt: new Date(),
          // We keep the main status as 'fulfilled' until return is resolved
        },
      });

      return returnRequest;
    });

    return NextResponse.json({
      message: "Return requested successfully",
      returnRequest: result,
    }, { status: 201 });

  } catch (err) {
    console.error("RETURN REQUEST ERROR:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}