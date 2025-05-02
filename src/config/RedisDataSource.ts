import { createClient } from 'redis'
import { Sequelize } from 'sequelize'
import { Logger } from '../middlewares/logger'

const dataSourceLogger = new Logger('DataSource')

interface SequelizeObject {
  [key: string]: Sequelize
}

/**
 * Define datasources used throughout the application
 */
class RedisDataSource {
  private static sequelizeClient: SequelizeObject = {}
  private static instance: RedisDataSource

  private constructor() {
    RedisDataSource.instance = this
  }

  public static getRedisInstance() {
    if (!RedisDataSource.instance) {
      return new RedisDataSource()
    }
    return RedisDataSource.instance
  }

  connectRedis(): Promise<any> {
    const client = createClient({
      password: process.env.REDIS_PASSWORD,
    })
      .on('error', (error) => dataSourceLogger.error(error + ''))
      .on('connect', () => dataSourceLogger.log('Redis connected successfully'))
      .connect()

    return client
  }
}
const redisDataSource = RedisDataSource.getRedisInstance()
export const redisConnection = redisDataSource.connectRedis()
