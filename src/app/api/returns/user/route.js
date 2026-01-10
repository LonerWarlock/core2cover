import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    const returns = await prisma.returnRequest.findMany({
      where: { userId: user.id },
      include: { orderItem: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ returns });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}