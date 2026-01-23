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

    if (creditToUse > 0 && user.credit < creditToUse) {
      return NextResponse.json({ message: "Insufficient store credit" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the main Order record
      const order = await tx.order.create({
        data: {
          userId: user.id,
          customerEmail,
          customerName: checkoutDetails.name,
          address: checkoutDetails.address,
          paymentMethod: creditToUse > 0 ? "store_credit" : checkoutDetails.paymentMethod,
          subtotal: Number(summary.subtotal || 0),
          casaCharge: Number(summary.casaCharge || 0),
          deliveryCharge: Number(summary.deliveryCharge || 0),
          // ADDED: Capture the total installation cost for the whole order
          installationCharge: Number(summary.installationTotal || 0),
          grandTotal: Number(summary.grandTotal || 0),
        },
      });

      // 2. Map and Create Order Items with Logistics & Installation Data
      const orderItemsData = orders.map((item) => {
        const qty = Number(item.quantity || 1);
        const trips = Number(item.trips || 1);
        const price = Number(item.amountPerTrip || 0);
        const shipCharge = Number(item.shippingCharge || 0);
        const instCharge = Number(item.installationCharge || 0);
        
        // Final calculation for this specific item including trip-based shipping
        const itemShippingTotal = item.shippingChargeType === "Paid" ? (trips * shipCharge) : 0;
        // ADDED: Calculate installation total for this specific item quantity
        const itemInstallationTotal = item.installationAvailable === "yes" ? (qty * instCharge) : 0;
        
        // Final calculation for this specific item
        const itemTotal = (qty * price) + itemShippingTotal + itemInstallationTotal;

        return {
          orderId: order.id,
          materialId: Number(item.materialId),
          materialName: item.materialName || item.name || "Unknown Product",
          supplierName: item.supplierName || item.supplier || "Unknown Seller",
          sellerId: Number(item.supplierId || item.sellerId),
          
          // MAP TO SCHEMA FIELDS
          quantity: qty,
          unit: item.unit || "pcs",
          totalTrips: trips, 
          pricePerUnit: price,
          totalAmount: itemTotal,
          imageUrl: item.imageUrl || item.image || null,

          // SNAPSHOT DELIVERY & INSTALLATION DATA
          shippingChargeType: item.shippingChargeType || "Paid",
          shippingCharge: shipCharge,
          installationAvailable: item.installationAvailable || "no",
          // ADDED: Capture the per-unit installation charge snapshot
          installationCharge: instCharge,
        };
      });

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // 3. Update Credit if used
      if (creditToUse > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { credit: { decrement: creditToUse } },
        });
      }

      return order;
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credit: true },
    });

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: result.id,
      newCredit: updatedUser?.credit ?? 0,
    }, { status: 201 });

  } catch (error) {
    console.error("ORDER PLACE ERROR:", error);
    return NextResponse.json({ message: "Failed to place order" }, { status: 500 });
  }
}