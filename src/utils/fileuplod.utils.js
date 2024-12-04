// hum iss project me pahle user se file ko upload krwa lenge apne local pe uske baad hum cloudinary pe upload karenge, direct v  kr shkte hai koi problem nhi hai
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

(async function () {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
});

const uploadOnCloudinary= async function (localFilePath) {
    try {
        if(!localFilePath){
            console.log("no file path found");
            return null;
        }
        // upload on cloudinary
       const response=await cloudinary.uploader.upload(localFilePath,{
             resource_type:"auto"
        })
        // file upload ho gya hai 
        console.log("file is uploaded on cloudinary",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally uploaded file from system 
        return null;
    }
}

export {uploadOnCloudinary}
