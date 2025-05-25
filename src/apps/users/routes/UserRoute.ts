import { Router } from 'express'
import { HttpStatusCode } from '../../../constants/HttpStatusCode'
import { ErrorCode } from '../models/ErrorCode'
import { User } from '../models/Users'
import { userService } from '../services/UserService'

export const userRouter = Router()

userRouter.post('/', async (req: any, res) => {
  const userDto: User = { ...req.body }
  const user = await userService.createUser(userDto)

  if (!user?.code) {
    res.status(HttpStatusCode.CREATED).json({ user })
    return
  }

  switch (user?.code) {
    case ErrorCode.DUPLICATE_USER:
      res.status(HttpStatusCode.BAD_REQUEST).json({ msg: user?.message })
      break
    case ErrorCode.SOME_WRONG:
    default:
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ msg: user?.message || 'Something went wrong' })
  }
})

userRouter.patch(
  '/',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { updateFields } = req.body

    try {
      const updatedUser = await userService.updateUser(updateFields)
      res.status(HttpStatusCode.OK).json({ updatedUser })
    } catch (error) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: 'Error while updating user' + error })
    }
  },
)

userRouter.delete(
  '/:key/:value',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { key, value } = req.params

    const user = await userService.deleteUser(key, value)

    res.status(HttpStatusCode.OK).json({ user })
    return
  },
)

userRouter.post(
  '/follow',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { followFrom, followTo } = req.body

    if (!followFrom || !followTo || followFrom == followTo) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: 'Missing or wrong parameters' })
      return
    }

    const response = await userService.followUser(followFrom, followTo)

    let statusCode = response
      ? HttpStatusCode.CREATED
      : HttpStatusCode.BAD_REQUEST

    res.status(statusCode).json({ message: response })
  },
)

userRouter.get(
  '/:userId/followers/:offset',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { userId, offset } = req.params

    if (!userId) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: 'Missing parameters' })
      return
    }

    const response = await userService.getFollowers(userId, offset)

    if (!response) {
      res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ error: 'Something went Wrong' })
      return
    }

    res.status(HttpStatusCode.OK).json({ followers: response })
  },
)

userRouter.get(
  '/:field/:key',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { field, key } = req.params

    const user = await userService.getUser(field, key)

    res.status(HttpStatusCode.OK).json({ user })
    return
  },
)
