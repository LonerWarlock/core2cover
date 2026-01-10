import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch User Profile
export async function GET(request, { params }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: decodedEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT: Update User Profile
export async function PUT(request, { params }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email).trim().toLowerCase();
    const data = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: decodedEmail },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Update User Error:", err);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}