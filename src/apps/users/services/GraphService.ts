import { redisShards } from '../../../config/RedisDataSource'
import { getShardFromUserId } from './ShardService'

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
    // enusre the following doesnt exist
    let followExist = await this.followExist(fromUserId, toUserId)

    if (!followExist) {
      const followFromShard = getShardFromUserId(fromUserId)
      const followToShard = getShardFromUserId(toUserId)

      if (followFromShard == followToShard) {
        await this.handleFollowFromAndFollowTo(
          fromUserId,
          toUserId,
          followFromShard,
        )
      } else {
        await this.handleFollowFrom(fromUserId, toUserId, followFromShard)
        await this.handleFollowTo(fromUserId, toUserId, followToShard)
      }
      return true
    }
    return false
  }

  async handleFollowFromAndFollowTo(
    fromUserId: number | string,
    toUserId: number | string,
    shard: any,
  ) {
    const now = () => Math.floor(Date.now() / 1000)
    ;(await redisShards[shard])
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

  async handleFollowFrom(
    fromUserId: number | string,
    toUserId: number | string,
    shard: any,
  ) {
    try {
      const now = () => Math.floor(Date.now() / 1000)

      ;(await redisShards[shard])
        .multi()
        .zAdd(`${USERS}:${fromUserId}:${FOLLOWINGS}`, [
          { score: now(), value: `${toUserId}` },
        ])
        .hIncrBy(`${USERS}:${fromUserId}`, `${FOLLOWINGS_COUNT}`, 1)
        .exec()
    } catch (error) {
      console.log(error)
    }
  }

  async handleFollowTo(
    fromUserId: number | string,
    toUserId: number | string,
    shard: any,
  ) {
    try {
      const now = () => Math.floor(Date.now() / 1000)
      ;(await redisShards[shard])
        .multi()
        .zAdd(`${USERS}:${toUserId}:${FOLLOWERS}`, [
          { score: now(), value: `${fromUserId}` },
        ])
        .hIncrBy(`${USERS}:${toUserId}`, `${FOLLOWER_COUNT}`, 1)

        .exec()
    } catch (error) {
      console.log(error)
    }
  }

  async followExist(fromUserId: string | number, toUserId: string | number) {
    // check toUser followers to see if fromUserId exists
    const followFromShard = getShardFromUserId(toUserId) || 1
    const rank = await (
      await redisShards[followFromShard]
    ).ZRANK(`${USERS}:${toUserId}:${FOLLOWERS}`, `${fromUserId}`)
    return rank === null ? false : true
  }

  deleteFollow() {}

  getFollow() {}
}

export const graph = new GraphService()
