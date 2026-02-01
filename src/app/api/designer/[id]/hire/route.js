import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

// 1. Configure the Email Transporter (matches your OTP logic)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const designerId = Number(id);

    // 2. Locate the Client User
    const user = await prisma.user.findUnique({
      where: { email: body.userEmail.toLowerCase().trim() }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 3. Locate the Designer to get their email address
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      select: { email: true, fullname: true }
    });

    if (!designer) return NextResponse.json({ message: "Designer not found" }, { status: 404 });

    // 4. Create the Hire Request in Database
    const hireRequest = await prisma.designerHireRequest.create({
      data: {
        userId: user.id,
        designerId: designerId,
        fullName: body.fullName,
        email: body.email,
        mobile: body.mobile,
        location: body.location,
        budget: Number(body.budget),
        workType: body.workType,
        timelineDate: body.timelineDate ? new Date(body.timelineDate) : null,
        description: body.description,
      }
    });

    // 5. Send Notification Email to Designer
    // Using the "from" address team.core2cover@gmail.com via env
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, 
      to: designer.email,
      subject: "New Project Inquiry - Core2Cover",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>Hello ${designer.fullname},</h2>
          <p>You have received a new work request on Core2Cover!</p>
          <hr />
          <h3>Project Details:</h3>
          <ul>
            <li><strong>Client Name:</strong> ${body.fullName}</li>
            <li><strong>Work Type:</strong> ${body.workType}</li>
            <li><strong>Budget:</strong> ₹${body.budget}</li>
            <li><strong>Location:</strong> ${body.location}</li>
          </ul>
          <p>Log in to your designer dashboard to view full details and respond to this request.</p>
          <br />
          <p>Best Regards,<br /><strong>Core2Cover Team</strong></p>
        </div>
      `,
    });

    return NextResponse.json(hireRequest, { status: 201 });
  } catch (error) {
    console.error("HIRE_REQUEST_ERROR:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}