import { Sequelize } from 'sequelize'
import { OPEN_CREATE, OPEN_FULLMUTEX, OPEN_READWRITE } from 'sqlite3'
import { createClient } from 'redis'
import { Logger } from '../middlewares/logger'

const dataSourceLogger = new Logger('DataSource')

/**
 * Define datasources used throughout the application
 */
class DataSource {
  static sequelize: any = null

  constructor() {
    if (DataSource.sequelize) {
      return DataSource.sequelize
    }
    return DataSource.sequelize
  }

  connectMySQL() {
    DataSource.sequelize = new Sequelize(
      process.env.RELATIONAL_DATASOURCE || '',
      process.env.RELATIONAL_DATASOURCE_USERNAME || '',
      process.env.RELATIONAL_DATASOURCE_PASSWORD || '',
      {
        host: 'localhost',
        port: 3306,
        dialect: 'mysql',
        retry: {
          match: [/Deadlock/i],
          max: 3,
          backoffBase: 1000,
          backoffExponent: 1.5,
        },
      },
    )

    return DataSource.sequelize
  }

  connectRds() {
    DataSource.sequelize = new Sequelize('db_ngs', 'username', 'password', {
      dialect: 'sqlite',
      storage: 'src/db/db_ngs.sqlite',
      dialectOptions: {
        mode: OPEN_READWRITE | OPEN_CREATE | OPEN_FULLMUTEX,
      },
    })

    return DataSource.sequelize
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

  async testConnection() {
    try {
      await DataSource.sequelize.authenticate()
      dataSourceLogger.log('Database Connection established')
    } catch (error) {
      dataSourceLogger.error(`Error connecting to database ${error}`)
    }
  }
}
const dataSource = new DataSource()
export const sequelize = dataSource.connectMySQL()
export const redisConnection = dataSource.connectRedis()
