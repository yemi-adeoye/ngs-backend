import bcrypt from 'bcrypt'
import { QueryTypes, Transaction } from 'sequelize'
import { sequelize } from '../../../config/RelationalDataSource'
import { Logger } from '../../../middlewares/logger'
import GlobalEntity from '../entities/GlobalEntity'
import { ProfileEntity, profileEntityShards } from '../entities/ProfileEntity'
import { userEntityShards } from '../entities/UserEntity'
import { ErrorCode } from '../models/ErrorCode'
import { NgsError } from '../models/NgsError'
import { Profile } from '../models/Profile'
import { User } from '../models/Users'
import { graph } from './GraphService'
import { queueService } from './QueueService'
import { getShardFromUserId, ShardResolver } from './ShardService'
import followEntityShards from '../entities/FollowEntity'

class UserService {
  private static instance: UserService
  readonly SALT_ROUNDS: number = 10
  readonly shardResolver = ShardResolver()

  userServiceLogger = new Logger(this.constructor.name)

  private constructor() {
    UserService.instance = this
  }

  public static getInstance() {
    if (!UserService.instance) {
      return new UserService()
    }
    return UserService.instance
  }

  /**
   * Creates a user
   * @param userDto the data object containing the user to be created's details
   * @returns
   */
  async createUser(
    userDto: User,
  ): Promise<(typeof userEntityShards)[1] | null | NgsError> {
    let result = null

    try {
      // check global table to see if user exist // TODO write this code
      const [userGlobal, hashedPassword] = await Promise.all([
        userService.createGlobalUser(userDto),
        this._hashPassword(`${userDto.password}`),
      ])

      const shardKey = `${userGlobal?.dataValues.shard}`

      userDto.password = hashedPassword

      try {
        await sequelize[shardKey].transaction(async (t: any) => {
          // populate user entity
          const user: (typeof userEntityShards)[1] = userEntityShards[
            shardKey
          ].build({
            ...userDto,
          })

          const userDb = await user.save({ transaction: t })

          // create user's profile
          const userProfile = profileEntityShards[shardKey].build({
            userId: userDb.dataValues.id,
          })

          // save the user's profile
          await userProfile.save({ transaction: t })

          result = userDb
        })
      } catch (error) {
        // couldnt save user, delete from global table or offload to queue
        this.userServiceLogger.error(`${error}`)

        result = { code: ErrorCode.SOME_WRONG, message: 'Something went wrong' }
      }
    } catch (error: any) {
      // user already exists, tell controller
      result = {
        code: ErrorCode.DUPLICATE_USER,
        message: `User with ${userDto.email} or ${userDto.phone} exists`,
      }
      this.userServiceLogger.log(error?.parent.sqlMessage)
    }

    return result
  }

  private _hashPassword(passwordRaw: string) {
    return bcrypt.hash(passwordRaw, this.SALT_ROUNDS)
  }

  async createGlobalUser(userDto: User): Promise<GlobalEntity | null> {
    const user: GlobalEntity = GlobalEntity.build({
      ...userDto,
      shard: this.shardResolver.next().value,
    })

    return await user.save()
  }

  async getGlobalUser(
    key: string,
    value: string,
  ): Promise<GlobalEntity | null> {
    const validKeys = ['email', 'phone']

    if (!validKeys.includes(key)) {
      this.userServiceLogger.error('Invalid key supplied to fetch global user')
      throw new Error('Invalid key supplied to fetch global user')
    }

    try {
      return await GlobalEntity.findOne({ where: { [key]: value } })
    } catch (error) {
      this.userServiceLogger.error(`${error}`)
      return null
    }
  }

  /**
   * Fetches a user by username or email
   */
  async getUser(
    key: string,
    value: string,
  ): Promise<(typeof userEntityShards)[1] | null> {
    // get user's shard from global table

    try {
      let userShard

      if (key.toLocaleLowerCase() == 'id') {
        userShard = getShardFromUserId(parseInt(value))
      } else {
        const globalUser = await GlobalEntity.findOne({
          where: { [key]: value },
          attributes: ['shard'],
        })

        if (!globalUser) {
          return null
        }

        userShard = globalUser?.dataValues.shard
      }

      const user = await userEntityShards[userShard].findOne({
        // const user = await userEntityShards['3'].findOne({
        where: { [key]: value },
        // include: { model: profileEntityShards[shard], as: 'profile' },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'password',
          'phone',
          'dob',
          'isSuspended',
          'lastSuccessfulLogin',
          'lastUnsuccessfulLogin',
          'invalidLoginCount',
          'createdAt',
          'updatedAt',
          'isActive',
          'isSuspended',
        ],
      })

      return user
    } catch (error: any) {
      this.userServiceLogger.error(`${error}`)
      return null
    }
  }

  async updateUser(keyAndValues: Partial<User>) {
    const ALLOWED_FIELDS = ['id', 'email', 'phone', 'isSuspended', 'isActive']

    // if neither id nor
    if (!keyAndValues.email && !keyAndValues.id) {
      this.userServiceLogger.error(
        'id or email field must be supplied to update user',
      )
      throw new Error('id or email field must be supplied to update user')
    }

    const key = keyAndValues.id ? 'id' : 'email'
    const value = keyAndValues[key]

    try {
      const userDb = await this.getUser(key, `${value}`)

      const updateFields: Partial<User> = {}

      Object.keys(keyAndValues).forEach((key: string) => {
        if (!ALLOWED_FIELDS.includes(key)) {
          throw new Error('Cannot update fields')
        }
        updateFields[key] = keyAndValues[key]
      })

      const updated = userDb?.update({ ...userDb?.dataValues, ...updateFields })

      return updated
    } catch (error) {
      this.userServiceLogger.error(error + '')
      throw new Error('Cannot update fields')
    }
  }

  async deleteUser(key: any, value: any) {
    const updateFields = { isActive: false, [key]: value }

    // return await this.updateUser({ [key]: value, isActive: false })
    return await this.updateUser({ ...updateFields })
  }

  async persistUserFollow(
    followFrom: string | number,
    followTo: string | number,
    shard: number,
  ): Promise<boolean> {
    try {
      // await sequelize[0].transaction(async (t: any) => {
      //TODO fix
      // create follow
      const followEntity = followEntityShards[shard].build({
        followFrom,
        followTo,
      })

      followEntity.save()

      // // increase follower and following count
      // const followFromUserProfile = await this.getProfileByUserId(followFrom)
      // const followToUserProfile = await this.getProfileByUserId(followTo)

      // const followFromCountUpdate: Partial<Profile> = {
      //   followingCount: followFromUserProfile?.dataValues.followingCount + 1,
      // }
      // const followToCountUpdate: Partial<Profile> = {
      //   followersCount: followToUserProfile?.dataValues.followersCount + 1,
      // }

      // await this.updateProfile(followFrom, followFromCountUpdate, t)
      // await this.updateProfile(followTo, followToCountUpdate, t)
      // })
      return true
    } catch (error) {
      this.userServiceLogger.error(error + '')
    }

    return false
  }

  async persistUserFollowAll(
    follows: { followFrom: string | number; followTo: string | number }[],
    shard: number,
  ): Promise<boolean> {
    this.userServiceLogger.log(`persisting bulk follow to db`)

    const values = follows.map(() => '(?, ?, ?)').join(', ')
    const replacements = []

    for (let { followFrom, followTo } of follows) {
      replacements.push(followFrom, followTo, new Date(Date.now()))
    }

    const sql = ` INSERT INTO followings (followFrom, followTo, createdAt) VALUES ${values} `

    try {
      await sequelize[shard].query(sql, {
        replacements,
        type: QueryTypes.INSERT,
      })
      return true
    } catch (error) {
      this.userServiceLogger.error(`${error}`)
    }

    return false
  }

  async followUser(
    followFrom: string | number,
    followTo: string | number,
  ): Promise<boolean> {
    try {
      graph.createFollow(followFrom, followTo)

      const shard = getShardFromUserId(followTo) || 1

      // write task to queue for future processing
      const job = { name: 'follow', data: { followFrom, followTo, shard } }

      queueService.queue[shard].add(job.name, job.data)

      return true
    } catch (error) {
      this.userServiceLogger.error(`${error}`)
    }

    return false
  }

  async getFollowers(userId: string, offset: string): Promise<any> {
    let parsedOffset = parseInt(offset) || 0
    let parsedUserID = parseInt(userId) || 0

    const query = `SELECT followFrom as userId FROM followings WHERE followTo =  :userId LIMIT 20 OFFSET :offset`

    try {
      const response = await sequelize[0].query(query, {
        //TODO fix
        replacements: { userId: parsedUserID, offset: parsedOffset },
        type: QueryTypes.SELECT,
      })

      return response
    } catch (error) {
      this.userServiceLogger.error(error + '')
    }

    return false
  }

  async updateProfile(
    userId: string | number,
    profile: Partial<Profile>,
    transaction: Transaction,
  ) {
    try {
      if (!userId) {
        this.userServiceLogger.error(
          `user id must be provided to update user, value supplied: ${userId}`,
        )
        throw new Error(
          `user id must be provided to update user, value supplied: ${userId}`,
        )
      }

      const userProfile = await this.getProfileByUserId(userId)

      if (transaction) {
        return userProfile?.update(
          { ...userProfile?.dataValues, ...profile },
          { transaction },
        )
      }

      return userProfile?.update({ ...userProfile?.dataValues, ...profile })
    } catch (error) {
      this.userServiceLogger.error(`${error}`)

      throw new Error('Cannot update fields')
    }
  }

  async getProfileByUserId(userId: number | string) {
    try {
      const user = await this.getUser('id', `${userId}`)

      const profileId = user?.dataValues.profile.dataValues.id

      const profile = await ProfileEntity.findOne({ where: { id: profileId } })

      return profile
    } catch (error) {
      this.userServiceLogger.error(`${error}`)

      throw new Error(`${error}`)
    }
  }
}

export const userService = UserService.getInstance()
