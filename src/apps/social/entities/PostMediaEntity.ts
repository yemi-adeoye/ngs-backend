import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/RelationalDataSource'

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
    sequelize: sequelize[1],
    modelName: 'post_media',
  },
)

export default PostMediaEntity
