// hum iss project me pahle user se file ko upload krwa lenge apne local pe uske baad hum cloudinary pe upload karenge, direct v  kr shkte hai koi problem nhi hai
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
dotenv.config('./.env')

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const uploadOnCloudinary = async function (localFilePath) {
  try {
    if (!localFilePath) {
      // console.error("No file path found");
      return null;
    }
    // Upload file to Cloudinary
    // console.log(localFilePath);
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detects file type
    });
    fs.unlinkSync(localFilePath);
    // console.log("File uploaded to Cloudinary");
    return response;
  } catch (error) {
    // Remove the local file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

// Export function for external use
export { uploadOnCloudinary };
