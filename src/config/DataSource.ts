import { Sequelize } from 'sequelize'
import { OPEN_CREATE, OPEN_FULLMUTEX, OPEN_READWRITE } from 'sqlite3'

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

  async testConnection() {
    try {
      await DataSource.sequelize.authenticate()
      console.log('Database Connection established')
    } catch (error) {
      console.log(`Error connecting to database ${error}`)
    }
  }
}

export const sequelize = new DataSource().connectRds()
