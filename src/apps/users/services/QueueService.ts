import { Queue, Worker } from 'bullmq'
import { pathToFileURL } from 'node:url'
import { Logger } from '../../../middlewares/logger'

const queueServiceLogger = new Logger('QueueServiceLogger')

class QueueService {
  queue: Queue
  worker: Worker
  private static instance: any

  private constructor() {
    const connection = {
      host: process.env.REDIS_HOST,
      port: 6379,
      password: process.env.REDIS_PASSWORD,
    }

    this.queue = new Queue('userFollowQueue', { connection })
    this.worker = new Worker(
      'userFollowQueue',
      pathToFileURL(__dirname + '/workers/followProcessor.js'),
      {
        // this.worker = new Worker('userFollowWorker', `${__dirname}/workers/followProcessor.js`, {
        connection,
        removeOnComplete: { age: 30 * 60, count: 100 }, // keep up to 100 jobs for 30 mins
        removeOnFail: { count: 500 },
        concurrency: 10,
        useWorkerThreads: true,
      },
    )

    this.worker.on('error', this.errorHandler)
    this.worker.on('completed', this.successHandler)
    this.worker.on('progress', this.errorHandler)

    QueueService.instance = this
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService()
    }
    return QueueService.instance
  }

  errorHandler(error: any) {
    queueServiceLogger.error(error + '')
  }

  successHandler() {
    queueServiceLogger.log('Job completed successfully')
  }

  progressHandler(processFn: Function) {
    processFn()
  }
}

export const queueService = QueueService.getInstance()
