import { Sequelize } from 'sequelize'
import { Logger } from '../middlewares/logger'

const dataSourceLogger = new Logger('DataSourceLogger')

/**
 * Define datasources used throughout the application
 */
class DataSource {
  private static instance: DataSource

  private sequelizeClients: any = { '1': null, '2': null, '3': null, 'GLOBAL': null }

  private constructor() {
    DataSource.instance = this
  }

  public static getInstance() {
    if (!DataSource.instance) {
      return new DataSource()
    }
    return DataSource.instance
  }

  private createSequelizeClient(host: string = 'localhost', password: string = '', port: string = '3306') {
    return new Sequelize(
      process.env.RELATIONAL_DATASOURCE || '',
      process.env.RELATIONAL_DATASOURCE_USERNAME || '',
      password,

      {
        // TODO
        // replication: {
        //   read: [
        //     {
        //       host: '8.8',
        //       username: 'user',
        //       password: 'passsword'
        //     }
        //   ],
        //   write: [
        //     {
        //       host: '8.8',
        //       username: 'user',
        //       password: 'passsword'
        //     }
        //   ]
        // },
        host,
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

  public createSequelizeClients(maxRetries = 10) {
    return this._createSequelizeClients(0, maxRetries)
  }

  public _createSequelizeClients(attempts: number, maxRetries = 10) {

    if (attempts > maxRetries) {
      dataSourceLogger.error('Maximum retries exceeded')
      return
    }

    if (this._allConnected() || (attempts > maxRetries)) {
      return this.sequelizeClients
    }

    console.log(`attempt: ${attempts}`)

    Object.keys(this.sequelizeClients).forEach(

      key => {
        let host = `RELATIONAL_DATASOURCE_HOST_SHARD_${key}`
        let password = `RELATIONAL_DATASOURCE_PASSWORD_SHARD_${key}`
        let port = `RELATIONAL_DATASOURCE_PORT_SHARD_${key}`

        if (!this.sequelizeClients[key]) {
          this.sequelizeClients[key] = this.createSequelizeClient(process.env[host], process.env[password], process.env[port])





          this.sequelizeClients[key].authenticate()
            .then((key: any) => { dataSourceLogger.log(`${key}, connected ok`) })
            .catch((error: any) => {
              this.sequelizeClients[key] = null
              dataSourceLogger.error(`${error}, ${process.env[host]}, ${process.env[password]} ${process.env[port]}`)
              setTimeout(() => this._createSequelizeClients(attempts++, maxRetries), attempts * 60000)

            })
        }
      })

    return this.sequelizeClients
  }

  _allConnected = (): true => {
    let isAllClientsConnected = true;

    Object.keys(this.sequelizeClients).map(
      (key) => isAllClientsConnected = isAllClientsConnected && (this.sequelizeClients[key] != null))

    return isAllClientsConnected
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

