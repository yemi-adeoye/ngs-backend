import { Shards } from '../../../constants/Shards'

export function* ShardResolver() {
  let i = 0
  while (true) {
    if (i >= 3) {
      i = 1
    } else {
      i++
    }
    yield i
  }
}

export function getShardFromUserId(userId: number | string): number | null {
  userId = Number(userId)

  if (userId >= Shards.SHARD_ONE_START && userId < Shards.SHARD_TWO_START) {
    return Shards.ONE
  } else if (
    userId >= Shards.SHARD_TWO_START &&
    userId < Shards.SHARD_THREE_START
  ) {
    return Shards.TWO
  } else if (userId >= Shards.SHARD_THREE_START && userId <= Shards.SHARD_MAX) {
    return Shards.THREE
  } else {
    console.error(
      'Cannot determine shard, inavlid user id supplied. id should be betweeen 1 and 10m',
    )
    return null
  }
}
