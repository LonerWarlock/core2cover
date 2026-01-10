import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request, { params }) {
  const designer = await prisma.designer.findUnique({
    where: { id: Number(params.id) },
    include: { profile: true },
  });
  if (!designer) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({
    fullname: designer.fullname,
    email: designer.email,
    mobile: designer.mobile,
    location: designer.location,
    experience: designer.profile?.experience || "",
    portfolio: designer.profile?.portfolio || "",
    bio: designer.profile?.bio || "",
    designerType: designer.profile?.designerType || "",
    profileImage: designer.profile?.profileImage,
  });
}

export async function PUT(request, { params }) {
  const formData = await request.formData();
  const designerId = Number(params.id);
  const file = formData.get("profileImage");

  let profileImage = undefined;
  if (file && typeof file !== "string") {
    const res = await uploadToCloudinary(file, "designers/profiles");
    profileImage = res.secure_url;
  }

  const data = {
    fullname: formData.get("fullname"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
    location: formData.get("location"),
  };

  await prisma.designer.update({ where: { id: designerId }, data });

  const profileData = {
    experience: formData.get("experience"),
    portfolio: formData.get("portfolio"),
    bio: formData.get("bio"),
    designerType: formData.get("designerType"),
  };
  if (profileImage) profileData.profileImage = profileImage;

  await prisma.designerProfile.upsert({
    where: { designerId },
    update: profileData,
    create: { designerId, ...profileData },
  });

  return NextResponse.json({ message: "Profile updated" });
}