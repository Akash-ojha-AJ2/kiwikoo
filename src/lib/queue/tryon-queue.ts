import 'server-only'
import { Queue } from 'bullmq'
import { getRedisConnection, isQueueAvailable } from './redis'

export const TRYON_QUEUE_NAME = 'tryon-generation-v1'

export interface TryOnQueueJobData {
  jobId: string
  userId: string
}

let tryOnQueue: Queue<TryOnQueueJobData> | null = null

export function getTryOnQueue(): Queue<TryOnQueueJobData> {
  if (!tryOnQueue) {
    if (!isQueueAvailable()) throw new Error('Queue not available: Redis URL not set')
    tryOnQueue = new Queue<TryOnQueueJobData>(TRYON_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 6,
        removeOnComplete: 200,
        removeOnFail: 500,
        backoff: {
          type: 'exponential',
          delay: 8000,
        },
      },
    })
  }
  return tryOnQueue
}

export async function enqueueTryOnJob(data: TryOnQueueJobData): Promise<void> {
  if (!isQueueAvailable()) throw new Error('Queue not available')
  await getTryOnQueue().add('tryon-generate', data, {
    jobId: data.jobId,
  })
}
