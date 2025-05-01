import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'

class PostMediaEntity extends Model {}

PostMediaEntity.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    mediaUrl: {
      type: DataTypes.JSON,
    },
  },
  {
    sequelize,
    modelName: 'post_media',
  },
)

export default PostMediaEntity
