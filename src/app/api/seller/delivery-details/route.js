import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST: Create or Update delivery details
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sellerId, ...data } = body;

    if (!sellerId) {
      return NextResponse.json({ message: "Seller ID is missing" }, { status: 400 });
    }

    const sid = Number(sellerId);

    // SANITISATION: Convert strings to types defined in schema.prisma (Int? and Boolean)
    const payload = {
      deliveryResponsibility: data.deliveryResponsibility,
      deliveryCoverage: data.deliveryCoverage,
      deliveryType: data.deliveryType,
      // parseInt ensures we satisfy the Int? requirement in your schema
      deliveryTimeMin: data.deliveryTimeMin ? parseInt(data.deliveryTimeMin, 10) : null,
      deliveryTimeMax: data.deliveryTimeMax ? parseInt(data.deliveryTimeMax, 10) : null,
      shippingChargeType: data.shippingChargeType,
      shippingCharge: data.shippingCharge ? parseInt(data.shippingCharge, 10) : 0,
      internationalDelivery: data.internationalDelivery === true || data.internationalDelivery === "true",
      installationAvailable: data.installationAvailable || "no",
      installationCharge: data.installationCharge ? parseInt(data.installationCharge, 10) : 0,
    };

    const result = await prisma.sellerDeliveryDetails.upsert({
      where: { sellerId: sid },
      update: payload,
      create: {
        sellerId: sid,
        ...payload,
      },
    });

    return NextResponse.json({ 
      message: "Delivery details updated successfully", 
      data: result 
    });
  } catch (err) {
    console.error("UPSERT DELIVERY ERROR:", err);
    // Returning the error message helps you see if it's a Prisma validation error
    return NextResponse.json(
      { message: err.message || "Failed to save delivery details" }, 
      { status: 500 }
    );
  }
}

/**
 * GET: Fetch existing details
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ message: "Seller ID required" }, { status: 400 });
    }

    const details = await prisma.sellerDeliveryDetails.findUnique({
      where: { sellerId: Number(sellerId) },
    });

    // Return empty object if not found so the frontend doesn't crash
    return NextResponse.json(details || {});
  } catch (err) {
    console.error("GET DELIVERY ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}