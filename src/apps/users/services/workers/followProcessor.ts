import { Job } from 'bullmq'
import { userService } from '../UserService'

const insertFollow = async (job: Job) => {
  const { followFrom, followTo } = job.data
  await userService.persistUserFollow(followFrom, followTo)
}

export default insertFollow
