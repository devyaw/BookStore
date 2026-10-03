import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary'


const cloudinaryHelper = cloudinary.config({
  cloud_name: String(process.env.cloud_name),
  api_key: String(process.env.api_key),
  api_secret: String(process.env.api_secret),
})


export default cloudinaryHelper
