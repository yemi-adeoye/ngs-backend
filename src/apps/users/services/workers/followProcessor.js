'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const UserService_1 = require('../UserService')
const batch = []
const BATCH_SIZE = 5
const FLUSH_INTERVAL = 1000
const insertFollow = async (job) => {
  batch.push(job)
  // flushes to db if batch has more items than BATCH SIZE
  if (batch.length > BATCH_SIZE) {
    console.log(
      'flushing to the MYSQL persistence layer after batch size reached',
    )
    await UserService_1.userService.persistUserFollowAll(
      batch.splice(0, BATCH_SIZE),
      1,
    )
  }
}
setInterval(async () => {
  if (batch.length > 0) {
    console.log(
      'flushing to the MYSQL persistence layer after ',
      FLUSH_INTERVAL,
      ' seconds',
    )

    await UserService_1.userService.persistUserFollowAll(
      batch.splice(0, BATCH_SIZE),
      1,
    )
  }
}, FLUSH_INTERVAL)
exports.default = insertFollow
