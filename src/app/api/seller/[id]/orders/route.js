import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sellerId = Number(id);

    if (isNaN(sellerId)) return NextResponse.json([]);

    // 1. Fetch order items specifically for this seller
    // We only need to include the 'order' relation to get customer/address info
    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId },
      include: {
        order: {
          select: {
            address: true,
            customerName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Map data using the flat fields defined in your schema
    const formatted = orderItems.map((item) => ({
      id: item.id,
      material: item.materialName, // Uses materialName field from OrderItem
      quantity: item.quantity,
      // Mapping the correct field names from your schema
      trips: item.totalTrips ?? 1, 
      unit: item.unit || "pcs",
      customer: item.order?.customerName || "Customer",
      siteLocation: item.order?.address || "Not specified",
      status: item.status,
      time: item.createdAt,
      totalAmount: item.totalAmount ?? 0,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("FETCH ORDERS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}