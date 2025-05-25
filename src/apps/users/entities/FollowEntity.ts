import { DataTypes, Model, Sequelize } from 'sequelize'
import { sequelize } from '../../../config/RelationalDataSource'

const defineModels = (sequelize: Sequelize) => {
  class FollowingEntity extends Model {
    [x: string]: any
  }

  FollowingEntity.init(
    {
      followFrom: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      followTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize: sequelize,
      modelName: 'followings',
      timestamps: true,
      updatedAt: false,
    },
  )
}

const followEntityShards: any = {
  1: defineModels(sequelize['1']),
  2: defineModels(sequelize['2']),
  3: defineModels(sequelize['3']),
}

export default followEntityShards
