import { Router } from 'express'
import { HttpStatusCode } from '../../../constants/HttpStatusCode'
import { Logger } from '../../../middlewares/logger'
import CommentEntity from '../entities/CommentEntity'

export const commentRouter = Router()

const commentRouteLogger = new Logger('CommentsRoute')

commentRouter.get('/hello', async (req, res) => {
  CommentEntity.build({})
  commentRouteLogger.log('Hello welcome to my route')
  res.status(HttpStatusCode.OK).json({ message: 'Hello' })
})
