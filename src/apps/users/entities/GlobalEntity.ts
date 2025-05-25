import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/RelationalDataSource'

class GlobalEntity extends Model {}

GlobalEntity.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    // username: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     unique: true
    // }
    shard: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
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
  },
  {
    sequelize: sequelize['GLOBAL'],
    modelName: 'global_users',
  },
)

GlobalEntity.sync()

export default GlobalEntity
