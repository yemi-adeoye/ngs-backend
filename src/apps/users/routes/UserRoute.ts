import { Router } from 'express'
import passport from 'passport'
import { HttpStatusCode } from '../../../constants/HttpStatusCode'
import { Logger } from '../middlewares/logger'
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

userRouter.patch('/', async (req, res) => {})
