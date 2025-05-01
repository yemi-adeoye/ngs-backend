import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'

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
    sequelize,
    modelName: 'followings',
    timestamps: true,
    updatedAt: false,
  },
)

FollowingEntity.sync()

export default FollowingEntity
