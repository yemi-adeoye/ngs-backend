import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../../../config/DataSource'
import CommentMediaEntity from './CommentMediaEntity'
import CommentReactionEntity from './CommentReactionEntity'
import UserEntity from '../../users/entities/UserEntity'
import ProfileEntity from '../../users/entities/ProfileEntity'
import PostEntity from './PostEntity'
import PostReactionEntity from './PostReactionEntity'
import PostMediaEntity from './PostMediaEntity'

class CommentEntity extends Model {}

CommentEntity.init(
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
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'comments',
  },
)

UserEntity.hasOne(ProfileEntity, {
  foreignKey: { name: 'profileId', allowNull: false },
})
ProfileEntity.belongsTo(UserEntity)

// comment - media relationship
CommentEntity.hasMany(CommentMediaEntity, {
  foreignKey: { name: 'commentId', allowNull: false },
})
CommentMediaEntity.belongsTo(CommentEntity)

// comment - reaction relationship
CommentEntity.hasMany(CommentReactionEntity, {
  foreignKey: { name: 'commentId', allowNull: false },
})
CommentReactionEntity.belongsTo(CommentEntity)

// Comment User Relationship
UserEntity.hasMany(CommentEntity, {
  foreignKey: { name: 'userId', allowNull: false },
})
CommentEntity.belongsTo(UserEntity)

// User - CommentReactionEntity
UserEntity.hasMany(CommentReactionEntity, {
  foreignKey: { name: 'userId', allowNull: false },
})
CommentReactionEntity.belongsTo(UserEntity)

// post -media relationship
PostEntity.hasMany(PostMediaEntity, {
  foreignKey: { name: 'postId', allowNull: false },
})
PostMediaEntity.belongsTo(PostEntity)

// post - comments relationship
PostEntity.hasMany(CommentEntity, {
  foreignKey: { name: 'postId', allowNull: false },
})
CommentEntity.belongsTo(PostEntity)

// post - postReaction relationship
PostEntity.hasMany(PostReactionEntity, {
  foreignKey: { name: 'postId', allowNull: false },
})
PostReactionEntity.belongsTo(PostEntity)

// post User Relationship
UserEntity.hasMany(PostEntity, {
  foreignKey: { name: 'userId', allowNull: false },
})
PostEntity.belongsTo(UserEntity)

UserEntity.sync()
ProfileEntity.sync()

CommentEntity.sync()
CommentReactionEntity.sync()
CommentMediaEntity.sync()

PostEntity.sync()
PostReactionEntity.sync()
PostMediaEntity.sync()

export default CommentEntity
