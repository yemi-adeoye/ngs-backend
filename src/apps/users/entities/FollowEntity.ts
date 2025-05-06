import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/RelationalDataSource'

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
    sequelize: sequelize[1], //TODO fix
    modelName: 'followings',
    timestamps: true,
    updatedAt: false,
  },
)

try {
  FollowingEntity.sync()
} catch (error: any) {
  console.log(error)
}


export default FollowingEntity
