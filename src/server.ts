import { configuration } from './config/Configuration'
configuration() // load environment variables

import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { logger } from './middlewares/logger'
import { userRouter } from './apps/users/routes/UserRoute'

import passport from 'passport'
import {
  localStrategy,
  loginStrategy,
  verifyJwtStrategy,
} from './apps/users/middlewares/auth'
import { authRouter } from './apps/users/routes/AuthRoutes'
import { profileRouter } from './apps/users/routes/ProfileRoutes'
import { testRouter } from './apps/users/test/loadTesting'
import { commentRouter } from './apps/social/routes/CommentsRoutes'
import { postRouter } from './apps/social/routes/PostRoutes'

const app = express()
const PORT = 5001 //process.env.SERVER_PORT

/**
 * MIDDLEWARES
 * LOGGER: Logs all API calls
 * USEROUTER: handles users collection routes
 */
app.use(logger)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

passport.use('register', localStrategy)
passport.use('login', loginStrategy)
passport.use('jwt', verifyJwtStrategy)

/**
 * ROUTES
 */
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/profile', profileRouter)
app.use('/test', testRouter)
app.use('/comment', commentRouter)
app.use('/post', postRouter)

app.get('/', async (req, res) => {
  res.json({ user: 'hello' })
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
