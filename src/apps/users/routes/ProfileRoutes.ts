import { Router } from 'express'
import passport from 'passport'
import { HttpStatusCode } from '../../../constants/HttpStatusCode'
import { isValidUser } from '../middlewares/auth'
import { userService } from '../services/UserService'
export const profileRouter = Router()

profileRouter.patch(
  '/',
  passport.authenticate('jwt', { session: false, passReqToCallback: true }),
  isValidUser,
  async (req: any, res: any) => {
    const { userId, userToFollowId } = req.body
    const result = await userService.followUser(userId, userToFollowId)

    console.log({ result })

    res.status(HttpStatusCode.OK).json({ msg: result })
  },
)
