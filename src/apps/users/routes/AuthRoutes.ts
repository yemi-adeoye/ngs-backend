import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { HttpStatusCode } from '../../../constants/HttpStatusCode'
import { Logger } from '../middlewares/logger'

export const authRouter = Router()

const authRouteLogger = new Logger('AuthRoute')

authRouter.post('/login', async (req: any, res: any, next) => {
  passport.authenticate(
    'login',
    { failureMessage: true },
    async (err: any, user: any, info: any) => {
      const APP_SECRET: string | undefined = process.env.APP_SECRET || ''

      // without app secret jwt tokens cant be signed and verified securely, fail gracefully and log error
      if (!APP_SECRET) {
        authRouteLogger.log(
          'Auth Router, Error Loading APP_SECRET from environment variables',
        )
        return res
          .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: 'Something went wrong' })
      }

      try {
        if (err || !user) {
          const error = new Error('Something went wrong')
          return res
            .status(HttpStatusCode.BAD_REQUEST)
            .json({ error: info.message })
        }
        req.login(user, { session: false }, async (error: any) => {
          if (error) {
            return next(error)
          }

          // defines fields to be added to the jwt token
          const body = { email: user.email, phone: user.phone }

          // set token expiry based on user's option to stay logged in
          const loginOption = req.body.stayLoggedIn ? 24 * 30 : 24
          const token = jwt.sign(
            {
              user: body,
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * loginOption,
            },
            APP_SECRET,
          )
          return res.status(HttpStatusCode.OK).json({ token })
        })
      } catch (error) {
        return next(error)
      }
    },
  )(req, res)
})
