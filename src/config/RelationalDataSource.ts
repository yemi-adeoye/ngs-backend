import { Sequelize } from 'sequelize'
import { Logger } from '../middlewares/logger'

const dataSourceLogger = new Logger('DataSource')

interface SequelizeObject {
  [key: string]: Sequelize
}

/**
 * Define datasources used throughout the application
 */
class DataSource {
  private static instance: DataSource

  private sequelizeClients: SequelizeObject = {}

  private constructor() {
    DataSource.instance = this
  }

  public static getInstance() {
    if (!DataSource.instance) {
      return new DataSource()
    }
    return DataSource.instance
  }

  private createSequelizeClient(password: string = '', port: string = '3306') {
    return new Sequelize(
      process.env.RELATIONAL_DATASOURCE || '',
      process.env.RELATIONAL_DATASOURCE_USERNAME || '',
      password,
      {
        host: process.env.RELATIONAL_DATASOURCE_HOST || 'localhost',
        port: Number(port),
        dialect: 'mysql',
        retry: {
          match: [/Deadlock/i],
          max: 3,
          backoffBase: 1000,
          backoffExponent: 1.5,
        },
      },
    )
  }

  public createSequelizeClients() {
    this.sequelizeClients = {
      '1': this.createSequelizeClient(
        process.env.RELATIONAL_DATASOURCE_PASSWORD_SHARD_1,
        process.env.RELATIONAL_DATASOURCE_PORT_SHARD_1,
      ),
      '2': this.createSequelizeClient(
        process.env.RELATIONAL_DATASOURCE_PASSWORD_SHARD_2,
        process.env.RELATIONAL_DATASOURCE_PORT_SHARD_2,
      ),
      '3': this.createSequelizeClient(
        process.env.RELATIONAL_DATASOURCE_PASSWORD_SHARD_3,
        process.env.RELATIONAL_DATASOURCE_PORT_SHARD_3,
      ),
      GLOBAL: this.createSequelizeClient(
        process.env.MYSQL_ROOT_PASSWORD_GLOBAL,
        process.env.RELATIONAL_DATASOURCE_PORT_GLOBAL,
      ),
    }

    return this.sequelizeClients
  }

  async testConnection() {
    try {
      Object.keys(this.sequelizeClients).forEach(async (client) => {
        await this.sequelizeClients[client].authenticate()
        dataSourceLogger.log(`Connection to shard ${client} established`)
      })
    } catch (error) {
      dataSourceLogger.error(`Error connecting to database ${error}`)
    }
  }
}

export const sequelize = DataSource.getInstance().createSequelizeClients()
DataSource.getInstance()
  .testConnection()
  .then(() => console.log('ok'))
