import { Router } from 'express'
import passport from 'passport'
import { HttpStatusCode } from '../../../constants/HttpStatusCode'
import { Logger } from '../../../middlewares/logger'
import { User } from '../models/Users'
import { userService } from '../services/UserService'
export const userRouter = Router()

const userRouteLogger = new Logger('UserRoute')

userRouter.post(
  '/',
  passport.authenticate('register', { session: false }),
  async (req: any, res) => {
    const userDto: User = { ...req.body }

    if (req.user?.registeredUser != null) {
      userRouteLogger.log(`DUPLICATE USER: ${JSON.stringify(req.user)}`)

      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: `User with username '${req.body?.email}' exists` })
      return
    }
    try {
      const user = await userService.createUser(userDto)
      userRouteLogger.log(`creating user ${JSON.stringify(userDto)}`)
      res.status(HttpStatusCode.CREATED).json(user)
    } catch (error) {
      userRouteLogger.error(`creating user ${error}`)
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: 'Something went wrong' })
    }
  },
)

userRouter.patch(
  '/',
  passport.authenticate('jwt', { session: false }),
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
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { followFrom, followTo } = req.body

    if (!followFrom || !followTo) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: 'Missing parameters' })
      return
    }

    await userService.followUser(followFrom, followTo)

    res.status(HttpStatusCode.CREATED).json({ message: true })
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
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { field, key } = req.params

    const user = await userService.getUser(field, key)

    res.status(HttpStatusCode.OK).json({ user })
    return
  },
)
