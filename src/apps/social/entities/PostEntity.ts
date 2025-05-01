import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'

class PostEntity extends Model {}

PostEntity.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    madCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shockCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sharedPostId: {
      type: DataTypes.INTEGER,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'posts',
  },
)

export default PostEntity
