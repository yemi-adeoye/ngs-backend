import { Router } from 'express'
import multer from 'multer'
import { HttpStatusCode } from '../../../constants/HttpStatusCode'
import { Logger } from '../../../middlewares/logger'
import { storage } from '../middlewares/MediaMiddleWare'

const upload = multer({ storage }).array('media', 5)
export const postRouter = Router()

const postRouteLogger = new Logger('PostRoute')

postRouter.post('/', async (req: any, res: any) => {
  upload(req, res, (error: any) => {
    if (error) {
      postRouteLogger.error(`${error}`)
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: 'Something went wrong' })
      return
    }
    // save post

    // save media
    res.status(HttpStatusCode.OK).json({ message: 'Hello' })
  })
})
