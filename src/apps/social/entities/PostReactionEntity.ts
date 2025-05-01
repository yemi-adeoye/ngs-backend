import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'

class PostReactionEntity extends Model {}

PostReactionEntity.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    reactionType: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'post_reactions',
  },
)

export default PostReactionEntity
