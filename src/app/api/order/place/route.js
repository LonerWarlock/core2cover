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
    if (creditToUse > 0 && user.credit < creditToUse) {
      return NextResponse.json({ message: "Insufficient store credit" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 2. Create the main Order record with sanitized numbers
      const order = await tx.order.create({
        data: {
          userId: user.id,
          customerEmail,
          customerName: checkoutDetails.name || "Customer",
          address: checkoutDetails.address || "N/A",
          paymentMethod: checkoutDetails.razorpayPaymentId 
            ? "razorpay" 
            : (creditToUse > 0 ? "store_credit" : (checkoutDetails.paymentMethod || "cod")),
          razorpayPaymentId: checkoutDetails.razorpayPaymentId || null,
          razorpayOrderId: checkoutDetails.razorpayOrderId || null,
          subtotal: parseFloat(summary.subtotal || 0),
          // platformCharge logic: ensure it matches frontend platform charge
          casaCharge: parseFloat(summary.deliveryCharge || 0), 
          deliveryCharge: parseFloat(summary.deliveryCharge || 0),
          installationCharge: parseFloat(summary.installationTotal || 0),
          grandTotal: parseFloat(summary.grandTotal || 0),
        },
      });

      // 3. Map Order Items with strict NaN protection
      const orderItemsData = orders.map((item) => {
        const qty = Number(item.quantity) || 1;
        const trips = Number(item.trips) || 1;
        const price = Number(item.amountPerTrip || item.price) || 0;
        const shipCharge = Number(item.shippingCharge) || 0;
        const instCharge = Number(item.installationCharge) || 0;
        
        // Use unique IDs safely
        const mId = parseInt(item.materialId);
        const sId = parseInt(item.sellerId || item.supplierId);

        if (isNaN(mId)) throw new Error(`Invalid Material ID for item: ${item.name}`);

        const itemShippingTotal = item.shippingChargeType === "Paid" ? (trips * shipCharge) : 0;
        const itemInstallationTotal = item.installationAvailable === "yes" ? (qty * instCharge) : 0;
        const itemTotal = (qty * price) + itemShippingTotal + itemInstallationTotal;

        return {
          orderId: order.id,
          materialId: mId,
          materialName: item.name || item.materialName || "Unknown Product",
          supplierName: item.supplierName || "Unknown Seller",
          sellerId: isNaN(sId) ? 0 : sId, // Fallback if sellerId is missing
          quantity: qty,
          unit: item.unit || "pcs",
          totalTrips: trips, 
          pricePerUnit: price,
          totalAmount: itemTotal,
          imageUrl: item.image || item.imageUrl || null,
          shippingChargeType: item.shippingChargeType || "Paid",
          shippingCharge: shipCharge,
          installationAvailable: item.installationAvailable || "no",
          installationCharge: instCharge,
        };
      });

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // 4. Update Credit
      if (creditToUse > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { credit: { decrement: creditToUse } },
        });
      }

      return order;
    });

    return NextResponse.json({
      message: "Order placed successfully",
      orderId: result.id,
    }, { status: 201 });

  } catch (error) {
    console.error("CRITICAL DATABASE ERROR:", error);
    // Return specific error message for debugging 
    return NextResponse.json({ 
      message: "Failed to place order: " + error.message 
    }, { status: 500 });
  }
}