import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary ", response.url);

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (imageURL) => {
  const publicId = getPublicId(imageURL);
  await cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      throw new ApiError(
        500,
        "existing file could not be deleted from cloudinary"
      );
    }
  });
};

const getPublicId = (imageURL) => {
  const [, publicIdWithExtensionName] = imageURL.split("upload/");
  const extensionName = path.extname(publicIdWithExtensionName);
  const publicId = publicIdWithExtensionName.replace(extensionName, "");
  return publicId;
};

export { uploadOnCloudinary, deleteFromCloudinary };
