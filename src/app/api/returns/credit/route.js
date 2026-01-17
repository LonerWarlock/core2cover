import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options"; // Ensure this path is correct
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error("Credit API: No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Use the ID from the session (which we saw is '9' in your logs)
    const userId = session.user.id; 

    const userCredit = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { credit: true }
    });

    return NextResponse.json({ credit: userCredit?.credit || 0 });
  } catch (err) {
    console.error("Credit API Error:", err);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}