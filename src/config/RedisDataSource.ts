import { createClient } from 'redis'
import { Logger } from '../middlewares/logger'
import { Shards } from '../constants/Shards'

const dataSourceLogger = new Logger('DataSource')

/**
 * Define datasources used throughout the application
 */
class RedisDataSource {
  private static instance: RedisDataSource

  private constructor() {
    RedisDataSource.instance = this
  }

  createConnection(
    password: string | undefined,
    host: string | undefined,
    port: string | undefined,
  ) {
    return createClient({
      url: `redis://default:${password}@${host}:${port}`,
    })
      .on('error', (error) => dataSourceLogger.error(error + ''))
      .on('connect', () => dataSourceLogger.log('Redis connected successfully'))
      .connect()
  }

  createConnections() {
    const redisShards: any = {}

    for (let i of Shards.SHARD_ARRAY) {
      const password: string = `REDIS_SHARD_${i}_PASSWORD`
      const host: string = `REDIS_SHARD_${i}_HOST`
      const port: string = `REDIS_PORT_SHARD_${i}`

      redisShards[i] = this.createConnection(
        process.env[password],
        process.env[host],
        process.env[port],
      )
    }

    return redisShards
  }

  public static getRedisInstance() {
    if (!RedisDataSource.instance) {
      return new RedisDataSource()
    }
    return RedisDataSource.instance
  }
}
const redisDataSource = RedisDataSource.getRedisInstance()
export const redisShards = redisDataSource.createConnections()
