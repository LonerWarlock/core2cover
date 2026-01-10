import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const sellerId = Number(body.sellerId);

    // Normalize types (match your index.js logic)
    const normalizedInternationalDelivery = body.internationalDelivery === true || body.internationalDelivery === "true";
    const normalizedInstallationAvailable = (body.installationAvailable === true || body.installationAvailable === "yes") ? "yes" : "no";

    const delivery = await prisma.sellerDeliveryDetails.upsert({
      where: { sellerId },
      update: { ...body, sellerId, internationalDelivery: normalizedInternationalDelivery, installationAvailable: normalizedInstallationAvailable },
      create: { ...body, sellerId, internationalDelivery: normalizedInternationalDelivery, installationAvailable: normalizedInstallationAvailable },
    });
    return NextResponse.json({ message: "Saved", delivery });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}