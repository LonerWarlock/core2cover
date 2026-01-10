import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      checkoutDetails,
      orders,
      summary,
      creditUsed = 0,
    } = body;

    // 1. Basic Validation
    if (!customerEmail || !orders?.length) {
      return NextResponse.json({ message: "Invalid order data" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const creditToUse = Number(creditUsed || 0);

    // 2. Credit Validation
    if (creditToUse > 0) {
      if (user.credit < creditToUse) {
        return NextResponse.json({ message: "Insufficient store credit" }, { status: 400 });
      }
    }

    /* =========================
       START TRANSACTION
    ========================= */
    const result = await prisma.$transaction(async (tx) => {
      /* =========================
         A. CREATE ORDER RECORD
      ========================= */
      const order = await tx.order.create({
        data: {
          userId: user.id,
          customerEmail,
          customerName: checkoutDetails.name,
          address: checkoutDetails.address,

          // Payment Method Logic
          paymentMethod: creditToUse > 0 ? "store_credit" : checkoutDetails.paymentMethod,

          subtotal: summary.subtotal,
          casaCharge: summary.casaCharge,
          deliveryCharge: summary.deliveryCharge,
          grandTotal: summary.grandTotal,
        },
      });

      /* =========================
         B. FETCH SELLER DELIVERY SNAPSHOTS
      ========================= */
      // Avoid querying the same seller multiple times
      const sellerDeliveryMap = {};
      
      for (const item of orders) {
        if (!sellerDeliveryMap[item.supplierId]) {
          sellerDeliveryMap[item.supplierId] = await tx.sellerDeliveryDetails.findUnique({
            where: { sellerId: item.supplierId },
          });
        }
      }

      /* =========================
         C. PREPARE ORDER ITEMS DATA
      ========================= */
      const orderItemsData = await Promise.all(
        orders.map(async (item) => {
          // Fetch product to snapshot the image
          const product = await tx.product.findUnique({
            where: { id: item.materialId },
          });

          const delivery = sellerDeliveryMap[item.supplierId];

          return {
            orderId: order.id,

            materialId: item.materialId,
            materialName: item.materialName,
            supplierName: item.supplierName,

            sellerId: item.supplierId,
            quantity: item.trips,
            pricePerUnit: item.amountPerTrip,
            totalAmount: item.amountPerTrip * item.trips,

            // Snapshot Image URL
            imageUrl: product?.images?.[0] || null,

            // Snapshot Delivery Details
            deliveryTimeMin: delivery?.deliveryTimeMin || null,
            deliveryTimeMax: delivery?.deliveryTimeMax || null,
            shippingChargeType: delivery?.shippingChargeType ?? "free",
            shippingCharge: delivery?.shippingCharge ?? 0,
            installationAvailable: delivery?.installationAvailable ?? "no",
            installationCharge: delivery?.installationCharge ?? 0,
          };
        })
      );

      /* =========================
         D. BULK CREATE ORDER ITEMS
      ========================= */
      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      /* =========================
         E. DEDUCT STORE CREDIT
      ========================= */
      if (creditToUse > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            credit: {
              decrement: creditToUse,
            },
          },
        });
      }

      return order;
    });

    // Fetch updated user credit after transaction commits
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credit: true },
    });

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: result.id,
      creditUsed: creditToUse,
      newCredit: updatedUser?.credit ?? 0,
    }, { status: 201 });

  } catch (error) {
    console.error("ORDER PLACE ERROR:", error);
    return NextResponse.json({ message: "Failed to place order" }, { status: 500 });
  }
}