import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'

class CommentReactionEntity extends Model {}

CommentReactionEntity.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    reactionType: {
      type: DataTypes.STRING,
    },
    // userId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    // }
  },
  {
    sequelize,
    modelName: 'comment_reactions',
  },
)

export default CommentReactionEntity
