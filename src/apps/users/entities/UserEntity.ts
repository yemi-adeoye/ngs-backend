import { DataTypes, Model, Sequelize } from 'sequelize'
import { sequelize } from '../../../config/RelationalDataSource'

const defineUserModels = (sequelize: Sequelize) => {
  class UserEntity extends Model {
    [x: string]: any

    getFullName(): string {
      return [this.firstName, this.lastName].join(' ')
    }
  }

  UserEntity.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      sex: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isSuspended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastSuccessfulLogin: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      lastUnsuccessfulLogin: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      invalidLoginCount: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      roles: {
        type: DataTypes.JSON,
        defaultValue: ['USER'],
      },
    },
    {
      sequelize,
      modelName: 'users',
    },
  )

  return UserEntity
}

const userEntityShards: any = {
  1: defineUserModels(sequelize['1']),
  2: defineUserModels(sequelize['2']),
  3: defineUserModels(sequelize['3']),
}

export { userEntityShards }
