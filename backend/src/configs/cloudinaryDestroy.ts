import { v2 as cloudinary } from 'cloudinary'

const destroyFromCloudinary = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true })
}
