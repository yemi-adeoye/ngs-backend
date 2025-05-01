import { redisConnection } from '../../../config/DataSource'

/**
 * ngs-graph-follows
 */

// const FOLLOW_GRAPH_KEY: string = 'ngs:graph:follows'
const USERS = 'users'
const FOLLOWERS = 'followers'
const FOLLOWINGS = 'followings'
const FOLLOWER_COUNT = 'followerCount'
const FOLLOWINGS_COUNT = 'followingCount'

export class GraphService {
  async createFollow(fromUserId: number | string, toUserId: number | string) {
    const now = () => Math.floor(Date.now() / 1000)

    ;(await redisConnection)
      .multi()
      .zAdd(`${USERS}:${fromUserId}:${FOLLOWINGS}`, [
        { score: now(), value: `${toUserId}` },
      ])
      .zAdd(`${USERS}:${toUserId}:${FOLLOWERS}`, [
        { score: now(), value: `${fromUserId}` },
      ])
      .hIncrBy(`${USERS}:${toUserId}`, `${FOLLOWER_COUNT}`, 1)
      .hIncrBy(`${USERS}:${fromUserId}`, `${FOLLOWINGS_COUNT}`, 1)
      .exec()
  }

  deleteFollow() {}

  getFollow() {}
}

export const graph = new GraphService()
