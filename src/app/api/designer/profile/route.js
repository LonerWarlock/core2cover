import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // 1. Extract and Validate Designer ID
    const designerId = Number(formData.get("designerId"));
    if (!designerId || isNaN(designerId)) {
      return NextResponse.json({ message: "Designer ID is required" }, { status: 400 });
    }

    // 2. Check if Designer exists
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
    });

    if (!designer) {
      return NextResponse.json({ message: "Designer not found" }, { status: 404 });
    }

    // 3. Handle Profile Image Upload (Cloudinary)
    const profileImageFile = formData.get("profileImage");
    let profileImageUrl = null;

    // Only upload if it's a valid file object, not a string or null
    if (profileImageFile && typeof profileImageFile !== "string" && profileImageFile.size > 0) {
      const uploadRes = await uploadToCloudinary(profileImageFile, "coretocover/designers/profiles");
      profileImageUrl = uploadRes.secure_url;
    }

    // 4. Extract other fields
    const experience = formData.get("experience");
    const portfolio = formData.get("portfolio");
    const designerType = formData.get("designerType");
    const bio = formData.get("bio");

    // 5. UPSERT Profile (Update if exists, Create if not)
    const profile = await prisma.designerProfile.upsert({
      where: { designerId: designerId },
      update: {
        experience: experience?.toString() || null,
        portfolio: portfolio?.trim() || null,
        designerType: designerType?.trim() || null,
        bio: bio?.trim() || null,
        // Only update image if a new one was actually uploaded
        ...(profileImageUrl && { profileImage: profileImageUrl }),
      },
      create: {
        designerId: designerId,
        experience: experience?.toString() || null,
        portfolio: portfolio?.trim() || null,
        designerType: designerType?.trim() || null,
        bio: bio?.trim() || null,
        profileImage: profileImageUrl,
      },
    });

    // 6. Return response matching your frontend expectations
    return NextResponse.json({
      message: "Designer profile saved successfully",
      profile: {
        id: profile.id,
        designerId: profile.designerId,
        profileImage: profile.profileImage, // Now contains the full Cloudinary URL
      },
    }, { status: 200 });

  } catch (err) {
    console.error("DESIGNER PROFILE SETUP ERROR:", err);
    return NextResponse.json({
      message: "Failed to save designer profile",
      error: err.message,
    }, { status: 500 });
  }
}