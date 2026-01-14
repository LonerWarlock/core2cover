import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

// GET: Fetch the designer's existing data
export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params must be awaited
    const { id } = await params;
    const designerId = Number(id);

    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      include: { profile: true },
    });

    if (!designer) {
      return NextResponse.json({ message: "Designer not found" }, { status: 404 });
    }

    // Return a clean object for the frontend form
    return NextResponse.json({
      fullname: designer.fullname,
      email: designer.email,
      mobile: designer.mobile,
      location: designer.location,
      experience: designer.profile?.experience || "",
      portfolio: designer.profile?.portfolio || "",
      bio: designer.profile?.bio || "",
      designerType: designer.profile?.designerType || "",
      profileImage: designer.profile?.profileImage || null,
    }, { status: 200 });

  } catch (err) {
    console.error("GET_PROFILE_ERROR:", err);
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT: Update Designer and Profile details
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const designerId = Number(id);
    const formData = await request.formData();

    // 1. Handle Image Upload (only if a new file is provided)
    const file = formData.get("profileImage");
    let profileImageUrl = undefined;
    
    // Check if the file is an actual File object and not a string URL
    if (file && typeof file !== "string" && file.size > 0) {
      const res = await uploadToCloudinary(file, "coretocover/designers/profiles");
      profileImageUrl = res.secure_url;
    }

    // 2. Prepare Data for 'Designer' table
    const designerData = {
      fullname: formData.get("fullname"),
      email: formData.get("email"),
      mobile: formData.get("mobile"),
      location: formData.get("location"),
    };

    // 3. Prepare Data for 'DesignerProfile' table
    const profileData = {
      experience: formData.get("experience"),
      portfolio: formData.get("portfolio"),
      bio: formData.get("bio"),
      designerType: formData.get("designerType"),
    };
    
    // Only add profileImage if a new one was uploaded
    if (profileImageUrl) {
      profileData.profileImage = profileImageUrl;
    }

    // 4. Update Database (Using a transaction to ensure both succeed)
    await prisma.$transaction([
      prisma.designer.update({
        where: { id: designerId },
        data: designerData,
      }),
      prisma.designerProfile.upsert({
        where: { designerId },
        update: profileData,
        create: { designerId, ...profileData },
      }),
    ]);

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });

  } catch (err) {
    console.error("UPDATE_PROFILE_ERROR:", err);
    return NextResponse.json({ 
      message: "Update failed", 
      error: err.message 
    }, { status: 500 });
  }
}