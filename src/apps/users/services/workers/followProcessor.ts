import { Job } from 'bullmq'
import { userService } from '../UserService'

const batch: any[] = []
const BATCH_SIZE = 5
const FLUSH_INTERVAL = 60000

// const

const insertFollow = async (job: Job) => {
  batch.push(job.data)
  // flushes to db if batch has more items than BATCH SIZE
  if (batch.length > BATCH_SIZE) {
    const shard = batch[0].shard
    await userService.persistUserFollowAll(batch.splice(0, BATCH_SIZE), shard)
  }
}

setInterval(async () => {
  if (batch.length) {
    const shard = batch[0].shard
    await userService.persistUserFollowAll(batch.splice(0, BATCH_SIZE), shard)
  }
}, FLUSH_INTERVAL)

export default insertFollow
