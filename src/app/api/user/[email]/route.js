import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request, { params }) {
  console.log("--- GET User Profile Debug Start ---");
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session Check Result:", session ? "Session Found" : "No Session (Unauthorized)");
    
    if (!session) {
      // Log the cookies to see if the session token is even reaching the server
      const cookieHeader = request.headers.get("cookie");
      console.log("Cookie Header Received:", cookieHeader ? "Present" : "Missing");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email } = await params;
    console.log("Requested Email:", email);
    console.log("Logged in Email:", session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: decodeURIComponent(email).toLowerCase() },
    });

    console.log("Database User Result:", user ? "User Found" : "User Not in DB");
    return NextResponse.json(user);
    
  } catch (err) {
    console.error("Critical API Error:", err);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  } finally {
    console.log("--- GET User Profile Debug End ---");
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { email } = await params;
    const decodedEmail = decodeURIComponent(email).trim().toLowerCase();

    if (session.user.email !== decodedEmail) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

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
    console.error("PUT User Error:", err);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}