import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'

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
    sequelize,
    modelName: 'comment_media',
  },
)

export default CommentMediaEntity
