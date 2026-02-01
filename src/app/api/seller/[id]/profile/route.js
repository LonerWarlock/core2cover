import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const encodeData = (data) => {
  return Buffer.from(JSON.stringify(data)).toString("base64");
};


export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const sellerId = Number(id);

    if (isNaN(sellerId)) {
      return NextResponse.json({ message: "Invalid Seller ID" }, { status: 400 });
    }

    //  FIX: Query 'seller' instead of 'user'
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        business: true, // Matches your 'business SellerBusinessDetails?' relation
      },
    });

    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    }

    // Format the response to match your SellerProfile.jsx expectations
    return NextResponse.json({
      payload: encodeData({
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        isVerified: seller.isVerified,
        location: seller.business?.city || "Not specified",
        businessName: seller.business?.businessName || seller.name
      })
    });

  } catch (err) {
    console.error("DETAILED PRISMA ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error: " + err.message },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update seller profile information
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const sellerId = Number(id);
    const { name, phone } = await request.json();

    if (isNaN(sellerId)) {
      return NextResponse.json({ message: "Invalid Seller ID" }, { status: 400 });
    }

    // FIX: Update 'seller' instead of 'user'
    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        name: name,
        phone: phone,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully ",
      seller: updatedSeller
    });

  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}