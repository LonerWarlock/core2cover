import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const sellerId = Number(params.sellerId);
    if (isNaN(sellerId)) return NextResponse.json([]);

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

    const formatted = orderItems.map((item) => ({
      id: item.id,
      material: item.materialName,
      quantity: item.quantity,
      customer: item.order?.customerName || "Customer",
      siteLocation: item.order?.address || "Not specified",
      status: item.status,
      time: item.createdAt,
      totalAmount: item.totalAmount ?? 0,
      pricePerUnit: item.pricePerUnit ?? null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("FETCH SELLER ORDERS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}