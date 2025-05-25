import { Queue, QueueOptions, Worker } from 'bullmq'
import { pathToFileURL } from 'node:url'
import { Logger } from '../../../middlewares/logger'
import { Shards } from '../../../constants/Shards'

const queueServiceLogger = new Logger('QueueServiceLogger')

class QueueService {
  queue: { [Shards.ONE]: Queue; [Shards.TWO]: Queue; [Shards.THREE]: Queue }
  worker: { [Shards.ONE]: Worker; [Shards.TWO]: Worker; [Shards.THREE]: Worker }
  private static instance: any

  private constructor() {
    // const connection = {
    //   host: process.env.REDIS_HOST,
    //   port: 6379,
    //   password: process.env.REDIS_PASSWORD,

    // }

    // this.queue = new Queue('userFollowQueue', { connection })
    // this.worker = new Worker(
    //   'userFollowQueue',
    //   // pathToFileURL(__dirname + '../workers/followProcessor.js'),
    //   pathToFileURL(process.cwd() + '/dist/apps/users/services/workers/followProcessor.js'),
    //   {
    //     connection,
    //     removeOnComplete: { age: 30 * 60, count: 100 }, // keep up to 100 jobs for 30 mins
    //     removeOnFail: { count: 500 },
    //     concurrency: 1,
    //     useWorkerThreads: true,
    //   },
    // )

    // this.worker.on('error', this.errorHandler)
    // this.worker.on('completed', this.successHandler)
    // this.worker.on('progress', this.errorHandler)

    ;[this.queue, this.worker] = this.buildQueueAndWorker('userFollowQueue')

    QueueService.instance = this
  }

  private buildQueueAndWorker = (queueName: string) => {
    const processorPath =
      process.cwd() + '/dist/apps/users/services/workers/followProcessor.js'

    const queue: any = {}
    const worker: any = {}

    for (let i of Shards.SHARD_ARRAY) {
      const password: string = `REDIS_SHARD_${i}_PASSWORD`
      const host: string = `REDIS_SHARD_${i}_HOST`
      const port: string = `REDIS_PORT_SHARD_${i}`

      const connection = this.createConnectionObject(
        process.env[host],
        process.env[port],
        process.env[password],
      )
      queue[i] = this.createQueue(queueName, connection)
      worker[i] = this.createWorker(queueName, processorPath, connection)

      worker[i].on('error', this.errorHandler)
      worker[i].on('completed', this.successHandler)
      worker[i].on('progress', this.errorHandler)
    }

    return [queue, worker]
  }

  private createQueue = (queueName: string, connection: QueueOptions) => {
    return new Queue(queueName, { connection })
  }

  private createWorker = (
    queueName: string,
    processorPath: string,
    connection: QueueOptions,
  ) => {
    return new Worker(queueName, pathToFileURL(processorPath), {
      connection,
      removeOnComplete: { age: 30 * 60, count: 100 },
      removeOnFail: { count: 500 },
      concurrency: 1,
      useWorkerThreads: true,
    })
  }

  private createConnectionObject = (
    host: string | undefined,
    port: string | undefined,
    password: string | undefined,
  ): any => {
    return {
      host,
      port,
      password,
    }
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
