import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // 1. Extract and Validate Designer ID
    const designerIdRaw = formData.get("designerId");
    const designerId = Number(designerIdRaw);

    if (!designerId || isNaN(designerId)) {
      return NextResponse.json({ message: "A valid Designer ID is required" }, { status: 400 });
    }

    // 2. Verify Designer exists before attempting profile creation
    const designerExists = await prisma.designer.findUnique({
      where: { id: designerId },
    });

    if (!designerExists) {
      return NextResponse.json({ message: "Designer account not found" }, { status: 404 });
    }

    // 3. Handle Image Upload
    const profileImageFile = formData.get("profileImage");
    let profileImageUrl = null;

    // Check if file exists and has content
    if (profileImageFile && typeof profileImageFile !== "string" && profileImageFile.size > 0) {
      try {
        const uploadRes = await uploadToCloudinary(profileImageFile, "coretocover/designers/profiles");
        profileImageUrl = uploadRes.secure_url;
      } catch (uploadError) {
        console.error("CLOUDINARY UPLOAD ERROR:", uploadError);
        return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
      }
    }

    // 4. Extract and Sanitise other fields
    const experience = formData.get("experience")?.toString() || null;
    const portfolio = formData.get("portfolio")?.toString().trim() || null;
    const designerType = formData.get("designerType")?.toString().trim() || null;
    const bio = formData.get("bio")?.toString().trim() || null;

    // 5. UPSERT Profile (Update if exists, Create if not)
    // Using upsert ensures we don't get duplicate record errors
    const profile = await prisma.designerProfile.upsert({
      where: { designerId: designerId },
      update: {
        experience,
        portfolio,
        designerType,
        bio,
        // Only update the field if a new image was uploaded
        ...(profileImageUrl && { profileImage: profileImageUrl }),
      },
      create: {
        designerId,
        experience,
        portfolio,
        designerType,
        bio,
        profileImage: profileImageUrl,
      },
    });

    return NextResponse.json({
      message: "Profile saved successfully",
      profile: {
        id: profile.id,
        imageUrl: profile.profileImage,
      },
    }, { status: 200 });

  } catch (err) {
    console.error("DESIGNER PROFILE API ERROR:", err);
    return NextResponse.json({
      message: "Internal server error",
      error: err.message,
    }, { status: 500 });
  }
}