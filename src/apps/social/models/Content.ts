import { Media } from './Media'

export interface Content {
  text: string
  comments: Content[]
  likeCount: number
  madCount: number
  shockCount: number
  media: Media[]
  sharedPost: Content
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
}
