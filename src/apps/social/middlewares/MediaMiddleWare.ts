import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { mediaService } from '../services/MediaService'

export const storage = multer.diskStorage({
  destination: function (req: any, file, cb) {
    cb(null, './temp')
  },
  filename: function (req: any, file, cb) {
    mediaService.isValidImageType(file.originalname)
    if (mediaService.isValidImageType(file.originalname)) {
      const extension = mediaService.getFileExtension(file.originalname)

      const newFileName = `${Date.now()}-${randomUUID()}.${extension}`
      cb(null, newFileName)
      return
    }
    cb(new Error('invalid file type'), file.filename)
  },
})
