import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const id = Number(params.id);
    const userEmail = request.headers.get("x-user-email");
    if (!userEmail) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    const rr = await prisma.returnRequest.findUnique({ where: { id } });

    if (!rr || rr.userId !== user.id) return NextResponse.json({ message: "Not found" }, { status: 404 });
    if (rr.status !== "REQUESTED") return NextResponse.json({ message: "Cannot cancel" }, { status: 400 });

    await prisma.$transaction([
      prisma.returnRequest.update({
        where: { id },
        data: {
          status: "CANCELLED",
          decidedAt: new Date(),
          decisionNote: "Cancelled by user",
          decidedBy: user.email,
        },
      }),
      prisma.orderItem.update({
        where: { id: rr.orderItemId },
        data: { returnStatus: "CANCELLED", status: "fulfilled", returnRequestedAt: null },
      }),
    ]);

    return NextResponse.json({ message: "Return cancelled" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}