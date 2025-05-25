import { LogLevels } from '../constants/LogLevel'

export const logger = (req: any, res: any, next: Function) => {
  const oldResponseJSON = res.json
  const requestStart = new Date()

  res.json = (body: any) => {
    const log = {
      start: requestStart,
      end: new Date(),
      addresss: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      responseCode: `${res.statusCode}`,
    }

    const logger = new Logger('Route Logger')

    logger.log(JSON.stringify(log))

    oldResponseJSON.call(res, body)
  }

  next()
}

export class Logger {
  className: string
  level: string

  constructor(className: string) {
    console.log(process.env.LOGGING_LEVEL)
    this.className = className
    this.level = process.env.LOGGING_LEVEL || LogLevels.INFO
  }

  log(message: string) {
    console.log(`INFO: ${this.className}: ${new Date()}: ${message}`)
  }

  warn(message: string) {
    if (this.level == LogLevels.ERROR || this.level == LogLevels.WARN) {
      console.warn(`WARN: ${this.className}: ${new Date()}: ${message}`)
    }
  }

  error(message: string) {
    if (this.level == LogLevels.ERROR) {
      console.error(`ERROR: ${this.className}: ${new Date()}: ${message}`)
    }
  }
}
