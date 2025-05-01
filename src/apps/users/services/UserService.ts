import bcrypt from 'bcrypt'
import { QueryTypes, Transaction } from 'sequelize'
import { sequelize } from '../../../config/DataSource'
import { Logger } from '../../../middlewares/logger'
import FollowingEntity from '../entities/FollowEntity'
import ProfileEntity from '../entities/ProfileEntity'
import UserEntity from '../entities/UserEntity'
import { Profile } from '../models/Profile'
import { User } from '../models/Users'
import { graph } from './GraphService'
import { queueService } from './QueueService'
/**
 * Han
 */
class UserService {
  private static instance: UserService
  readonly SALT_ROUNDS: number = 10

  userServiceLogger = new Logger(this.constructor.name)

  constructor() {
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
  async createUser(userDto: User): Promise<UserEntity | null> {
    let result = null

    try {
      result = await sequelize.transaction(async (t: any) => {
        const userProfile = ProfileEntity.build({})

        const userProfileDb = await userProfile.save({ transaction: t })

        const user: UserEntity = UserEntity.build({
          ...userDto,
          profileId: userProfileDb.dataValues.id,
        })

        user.dataValues.password = bcrypt.hashSync(
          user.dataValues.password,
          this.SALT_ROUNDS,
        )

        return user.save({ transaction: t })
      })
    } catch (error) {
      this.userServiceLogger.error(error + '')
    }

    return result
  }

  /**
   * Fetches a user by username or email
   */
  getUser(key: string, value: string): Promise<UserEntity | null> {
    return UserEntity.findOne({
      where: { [key]: value },
      include: { model: ProfileEntity, as: 'profile' },
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
      const userDb = await this.getUser(key, value + '')

      const updateFields: Partial<User> = {}

      Object.keys(keyAndValues).forEach((key: string) => {
        if (!ALLOWED_FIELDS.includes(key)) {
          throw new Error('Cannot update fields')
        }
        keyAndValues[key] ? (updateFields[key] = keyAndValues[key]) : null
      })

      const updated = userDb?.update({ ...userDb?.dataValues, ...updateFields })

      return updated
    } catch (error) {
      this.userServiceLogger.error(error + '')
      throw new Error('Cannot update fields')
    }
  }

  async deleteUser(key: any, value: any) {
    return await this.updateUser({ [key]: value, isActive: false })
  }

  async persistUserFollow(
    followFrom: string | number,
    followTo: string | number,
  ): Promise<boolean> {
    try {
      await sequelize.transaction(async (t: any) => {
        // create follow
        const followEntity = FollowingEntity.build({ followFrom, followTo })

        followEntity.save({ transaction: t })

        // increase follower and following count
        const followFromUserProfile = await this.getProfileByUserId(followFrom)
        const followToUserProfile = await this.getProfileByUserId(followTo)

        const followFromCountUpdate: Partial<Profile> = {
          followingCount: followFromUserProfile?.dataValues.followingCount + 1,
        }
        const followToCountUpdate: Partial<Profile> = {
          followersCount: followToUserProfile?.dataValues.followersCount + 1,
        }

        await this.updateProfile(followFrom, followFromCountUpdate, t)
        await this.updateProfile(followTo, followToCountUpdate, t)
      })
      return true
    } catch (error) {
      this.userServiceLogger.error(error + '')
    }

    return false
  }

  async followUser(
    followFrom: string | number,
    followTo: string | number,
  ): Promise<boolean> {
    try {
      await graph.createFollow(followFrom, followTo)

      // write task to queue for future processing
      const job = { name: 'follow', data: { followFrom, followTo } }

      await queueService.queue.add(job.name, job.data)
    } catch (error) {
      this.userServiceLogger.error(error + '')
      return false
    }

    return true
  }

  async getFollowers(userId: string, offset: string): Promise<any> {
    let parsedOffset = parseInt(offset) || 0
    let parsedUserID = parseInt(userId) || 0

    const query = `SELECT followFrom as userId FROM followings WHERE followTo =  :userId LIMIT 20 OFFSET :offset`

    try {
      const response = await sequelize.query(query, {
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
