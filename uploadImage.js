import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv'
dotenv.config()



cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

const options = {
    overwrite: true,
    invalidate:true,
    resource_type:"auto"
  };


export default cloudinary