import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (fsError) {
      console.error("Failed to delete local file:", fsError);
    }
    return null;
  }
};

const deleteFromCloudinary = async (public_id, options = {}) => {
  return await cloudinary.uploader.destroy(public_id, {
    invalidate: true,
    ...options,
  });
};

export { uploadOnCloudinary, deleteFromCloudinary };
