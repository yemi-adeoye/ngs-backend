import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'

class ProfileEntity extends Model {}

ProfileEntity.init(
  {
    profilePic: {
      type: DataTypes.STRING,
      defaultValue: 'https://localhost:7852/default.png',
    },
    club: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    followersCount: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    followingCount: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  },
  { sequelize, modelName: 'profiles' },
)

export default ProfileEntity
