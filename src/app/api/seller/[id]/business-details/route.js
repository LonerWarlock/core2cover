import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to scramble data for your frontend's decodePayload function
const encodePayload = (data) => {
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString("base64");
};

// GET: Fetch existing details
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const business = await prisma.sellerBusinessDetails.findUnique({
      where: { sellerId: Number(id) },
    });

    if (!business) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ payload: encodePayload(business) });
  } catch (err) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// PUT: Update details (REMOVED GST)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // We explicitly destructure to ensure GST is ignored even if sent
    const { businessName, sellerType, address, city, state, pincode } = body;

    const updated = await prisma.sellerBusinessDetails.update({
      where: { sellerId: Number(id) },
      data: {
        businessName,
        sellerType,
        address,
        city,
        state,
        pincode,
        // gst is omitted here
      },
    });

    return NextResponse.json({ message: "Updated", business: updated });
  } catch (err) {
    console.error("Update Error:", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}