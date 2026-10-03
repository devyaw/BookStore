import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import cloudinaryHelper from '../helpers/cloudinaryHelper.ts'



const uploadToCloudinary = async (file: string) => {
  const result: UploadApiResponse = await cloudinary.uploader.upload(file, { cloudinaryHelper })
  return {
    url: result.secure_url,
    public_id: result.public_id,
  }


}

export default uploadToCloudinary
