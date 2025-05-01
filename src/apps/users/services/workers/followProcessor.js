'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const UserService_1 = require('../../../../../dist/apps/users/services/UserService')
const insertFollow = async (job) => {
  const { followFrom, followTo } = job.data
  await UserService_1.userService.persistUserFollow(followFrom, followTo)
}
exports.default = insertFollow
