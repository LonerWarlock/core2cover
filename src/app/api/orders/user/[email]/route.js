import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise and must be awaited
    const resolvedParams = await params;
    const email = decodeURIComponent(resolvedParams.email);

    // 1. Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    // 2. Fetch all orders for this user including nested items, sellers, and ratings
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            seller: {
              select: { name: true },
            },
            rating: true, // Used to determine if the item has been rated
          },
        },
      },
    });

    // 3. Flatten and format the orders into individual items
    const formatted = orders.flatMap((order) =>
      order.items.map((item) => ({
        id: order.id,
        displayId: `ORD-${order.id}`,
        orderItemId: item.id,

        productName: item.materialName,
        sellerName: item.seller?.name || "Unknown Seller",
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        imageUrl: item.imageUrl,

        orderStatus: item.status,
        createdAt: order.createdAt,

        // Determine rating status
        isRated: Boolean(item.rating),

        // Rating details if they exist
        rating: item.rating
          ? {
              stars: item.rating.stars,
              comment: item.rating.comment,
            }
          : null,

        // Delivery details snapshot (saved at time of order)
        deliveryTimeMin: item.deliveryTimeMin,
        deliveryTimeMax: item.deliveryTimeMax,
        shippingChargeType: item.shippingChargeType,
        shippingCharge: item.shippingCharge,
        installationAvailable: item.installationAvailable,
        installationCharge: item.installationCharge,
      }))
    );

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("FETCH USER ORDERS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}