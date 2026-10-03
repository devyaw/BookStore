import multer, { type FileFilterCallback } from 'multer'
import type { Request } from 'express'



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, file.filename + '-' + Date.now() + file.originalname)
  },
})

const fileFilter = (req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback) => {
  if(file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type'))
  }
}
 const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
})

 export default upload
