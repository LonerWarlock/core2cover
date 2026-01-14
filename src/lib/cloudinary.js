import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = (file, folder) => {
  // Try both prefixed and non-prefixed versions
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName) {
    throw new Error("Cloudinary Cloud Name is missing in .env. Ensure CLOUDINARY_CLOUD_NAME is set.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: folder, 
          resource_type: "auto",
          chunk_size: 7000000 
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

export default cloudinary;