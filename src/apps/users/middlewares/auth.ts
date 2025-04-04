import bcrypt from 'bcrypt'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import { userService } from '../services/UserService'
import { Logger } from './logger'

const authLogger = new Logger('Auth Logger')
const MAX_LOGIN_BEFORE_SUSPENSION = 3

/**
 * Updates the users invalidLogin count and suspended status on unsuccessful login attemps
 * @param user the user data to be updated
 */
const handleLoginError = async (user: any) => {
  const invalidLoginCount = user.dataValues.invalidLoginCount
    ? user.dataValues.invalidLoginCount + 1
    : 1

  const isSuspended =
    user.dataValues.invalidLoginCount >= MAX_LOGIN_BEFORE_SUSPENSION
      ? true
      : false

  try {
    await user.update(
      { lastUnsuccessfulLogin: Date.now(), invalidLoginCount, isSuspended },
      { where: { id: user.dataValues.id } },
    )
  } catch (error) {
    authLogger.error(error + '')
    console.log(error)
  }
}

/**
 * Updates the users lastSuccessful Login time and resets the invalid login count on successful login attemps
 * @param user the user data to be updated
 */
const handleLoginSuccess = async (user: any) => {
  try {
    await user.update(
      { lastSuccessfulLogin: Date.now(), invalidLoginCount: 0 },
      { where: { id: user.dataValues.id } },
    )
  } catch (error) {
    authLogger.error(error + '')
    console.log(error)
  }
}

/**
 * Handles the registration of a new user
 * @param req the Request object
 * @param username the email of the new user
 * @param password the password of the new user
 * @param done the function to call once registration is done (successful or not)
 * @returns
 */
const registrationHandler = async (
  req: any,
  username: string,
  password: string,
  done: Function,
) => {
  const user = req.body

  const registeredUser = await userService.getUser('email', username)

  user.registeredUser = registeredUser

  return done(null, user)
}

/**
 * Handles the authentication of a logged in user
 * @param req the Request object
 * @param email the email of the user
 * @param password the password of the user
 * @param done the function to call once login is done (successful or not)
 * @returns
 */
const login = async (email: string, password: string, done: Function) => {
  console.log('Logging in ')
  try {
    let user = await userService.getUser('email', email)

    if (user == null) {
      return done(null, false, { message: 'Invalid Credentials' })
    }

    // if the user is not active or is suspended
    if (!user?.dataValues.isActive || user?.dataValues.isSuspended) {
      await handleLoginError(user)

      const message = user?.dataValues.isSuspended
        ? 'Account Locked'
        : 'Invalid Credentials'
      return done(null, false, { message })
    }

    const valid = bcrypt.compareSync(password, user.dataValues.password)

    // passwords do not match
    if (!valid) {
      await handleLoginError(user)

      return done(null, false, { message: 'Invalid Credentials' })
    }

    await handleLoginSuccess(user)

    return done(null, user, { message: 'Login Successfully' })
  } catch (error) {
    authLogger.error(error + '')
    return done(null, false, { message: 'Something went wrong' })
  }
}

/**
 * Verifies the JWT Token passed when accessing protected routes
 * @param jwtPayload
 * @param done
 * @returns
 */
const verifyJwtToken = async (jwtPayload: any, done: Function) => {
  try {
    const { email } = jwtPayload.user
    const user = await userService.getUser('email', email)

    if (user?.dataValues.isActive && user?.dataValues.isActive) {
      return done(null, done)
    }
    return done(null, false, { message: 'Authentication Failed' })
  } catch (error) {
    done(error)
  }
}

export const localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true,
  },
  registrationHandler,
)
export const loginStrategy = new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  login,
)
export const verifyJwtStrategy = new JwtStrategy(
  {
    secretOrKey: process.env.APP_SECRET || '',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  verifyJwtToken,
)
