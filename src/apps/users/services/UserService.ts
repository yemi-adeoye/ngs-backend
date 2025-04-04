import UserEntity from '../entities/UserEntity'
import { User } from '../models/Users'
import bcrypt from 'bcrypt'
/**
 * Han
 */
class UserService {
  static instance: UserService
  readonly SALT_ROUNDS: number = 10

  constructor() {
    if (UserService.instance) {
      return UserService.instance
    }
    return UserService.instance
  }

  /**
   * Creates a user
   * @param userDto the data object containing the user to be created's details
   * @returns
   */
  createUser(userDto: User): Promise<UserEntity> {
    const user: UserEntity = UserEntity.build({ ...userDto })

    user.dataValues.password = bcrypt.hashSync(
      user.dataValues.password,
      this.SALT_ROUNDS,
    )

    return user.save()
  }

  /**
   * Feteches a user by username or email
   */
  getUser(field: string, key: string): Promise<UserEntity | null> {
    return UserEntity.findOne({
      where: { [field]: key },
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
}

export const userService = new UserService()
