import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/RelationalDataSource'

class CommentMediaEntity extends Model {}

CommentMediaEntity.init(
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
    modelName: 'comment_media',
  },
)

export default CommentMediaEntity
