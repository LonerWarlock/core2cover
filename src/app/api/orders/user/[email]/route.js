import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email).toLowerCase().trim();

    // 1. Find the user first to get their ID
    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json([], { status: 200 });
    }

    // 2. Fetch orders where the userId matches
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id, // Primary link
      },
      include: {
        items: {
          include: {
            rating: true,
            seller: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Flatten for the frontend (Jerry Frostwick's UI)
    const flattened = orders.flatMap((order) =>
      order.items.map((item) => ({
        id: order.id,
        orderItemId: item.id,
        productName: item.materialName,
        sellerName: item.seller.name,
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        orderStatus: item.status,
        imageUrl: item.imageUrl,
        isRated: !!item.rating,
        createdAt: order.createdAt,
      }))
    );

    return NextResponse.json(flattened);
  } catch (error) {
    console.error("FETCH ERROR:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}