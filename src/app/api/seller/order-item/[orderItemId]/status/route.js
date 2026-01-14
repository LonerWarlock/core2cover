import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    // 1. Await params and convert ID to a Number
    const { orderItemId } = await params;
    const idToUpdate = Number(orderItemId);

    // 2. Get the new status from the request body
    const { status } = await request.json();

    if (isNaN(idToUpdate)) {
      return NextResponse.json({ message: "Invalid Order Item ID" }, { status: 400 });
    }

    // 3. Update the database
    const updatedItem = await prisma.orderItem.update({
      where: { id: idToUpdate }, // Using the converted Number ID
      data: { status: status },
    });

    return NextResponse.json({
      message: "Status updated successfully ",
      updatedItem,
    });
  } catch (err) {
    // This will show exactly why it failed in your terminal
    console.error("DATABASE UPDATE ERROR:", err);
    
    return NextResponse.json(
      { message: "Failed to update status. Check if ID exists." },
      { status: 500 }
    );
  }
}