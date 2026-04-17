import 'dotenv/config'
import { Job, Worker } from 'bullmq'
import { createServiceClient } from '@/lib/auth'
import { getTryOnPresetV3 } from '@/lib/tryon/presets'
import { normalizeBase64 } from '@/lib/image-processing'
import { saveUpload } from '@/lib/storage'
import { runHybridTryOnPipeline } from '@/lib/tryon/hybrid-tryon-pipeline'
import { GeminiRateLimitError } from '@/lib/gemini/executor'
import { TRYON_QUEUE_NAME, type TryOnQueueJobData } from '@/lib/queue/tryon-queue'
import { getRedisConnection } from '@/lib/queue/redis'

interface GenerationJobRow {
  id: string
  user_id: string
  inputs: {
    personImage?: string
    clothingImage?: string
    backgroundImage?: string
    editType?: string
  }
  settings: {
    stylePreset?: string
    userRequest?: string
    background?: string
    lighting?: string
    aspectRatio?: '1:1' | '4:5' | '3:4' | '9:16'
    resolution?: '1K' | '2K' | '4K'
  }
}

function ensureHasValue(value: string | undefined, message: string): string {
  if (!value) throw new Error(message)
  return value
}

async function fetchGenerationJob(jobId: string): Promise<GenerationJobRow> {
  const service = createServiceClient()
  const { data, error } = await service
    .from('generation_jobs')
    .select('id, user_id, inputs, settings')
    .eq('id', jobId)
    .single()

  if (error || !data) {
    throw new Error(`Generation job ${jobId} not found`)
  }

  return data as unknown as GenerationJobRow
}

async function markJobStatus(jobId: string, patch: Record<string, unknown>) {
  const service = createServiceClient()
  const { error } = await service
    .from('generation_jobs')
    .update(patch)
    .eq('id', jobId)

  if (error) {
    throw new Error(`Failed updating generation job ${jobId}: ${error.message}`)
  }
}

async function processTryOnJob(queueJob: Job<TryOnQueueJobData>): Promise<void> {
  const { jobId } = queueJob.data
  await markJobStatus(jobId, {
    status: 'processing',
    error_message: null,
  })

  const generationJob = await fetchGenerationJob(jobId)
  const { inputs, settings } = generationJob

  const personImage = ensureHasValue(inputs.personImage, 'Missing person image in job inputs')
  const clothingImage = ensureHasValue(inputs.clothingImage, 'Missing clothing image in job inputs')

  const normalizedPerson = normalizeBase64(personImage)
  const normalizedClothing = normalizeBase64(clothingImage)

  const presetV3 = settings.stylePreset ? getTryOnPresetV3(settings.stylePreset) : undefined
  const preset = presetV3
    ? {
        id: presetV3.id,
        background_name: presetV3.background_name,
        lighting_name: presetV3.lighting_name,
      }
    : {
        id: undefined,
        background_name: settings.background ?? 'keep the original background',
        lighting_name: settings.lighting ?? 'match the original photo lighting',
      }

  const pipelineResult = await runHybridTryOnPipeline({
    personImageBase64: normalizedPerson,
    clothingImageBase64: normalizedClothing,
    aspectRatio: settings.aspectRatio ?? '1:1',
    preset,
    userRequest: settings.userRequest || undefined,
    productId: null,
  })

  const imagePath = `tryon/${generationJob.user_id}/${jobId}.png`
  let imageUrl: string | null = null

  try {
    if (pipelineResult.image) {
      imageUrl = await saveUpload(pipelineResult.image, imagePath, 'try-ons')
    }
  } catch (saveError) {
    console.warn(`Try-on worker storage save failed for ${jobId}:`, saveError)
  }

  await markJobStatus(jobId, {
    status: 'completed',
    output_image_path: imageUrl || `base64://${pipelineResult.image}`,
    settings: {
      ...(settings || {}),
      outcome: {
        pipeline: 'nano-banana-pro-worker',
        status: pipelineResult.status,
        totalTimeMs: pipelineResult.debug.totalTimeMs,
        promptLength: pipelineResult.debug.promptUsed?.length || 0,
        warnings: pipelineResult.warnings,
      },
    },
  })
}

const worker = new Worker<TryOnQueueJobData>(
  TRYON_QUEUE_NAME,
  async (job) => {
    try {
      await processTryOnJob(job)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (error instanceof GeminiRateLimitError) {
        // Let BullMQ retry with delayed backoff (configured on queue)
        throw error
      }

      await markJobStatus(job.data.jobId, {
        status: 'failed',
        error_message: message,
      })
      throw error
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 4,
  }
)

worker.on('completed', (job) => {
  console.log(`✅ Try-on worker completed job ${job.id}`)
})

worker.on('failed', async (job, err) => {
  if (!job) return
  const message = err instanceof Error ? err.message : String(err)
  const attempts = job.opts.attempts ?? 1
  const exhausted = job.attemptsMade >= attempts

  if (exhausted) {
    try {
      await markJobStatus(job.data.jobId, {
        status: 'failed',
        error_message: message,
      })
    } catch (updateError) {
      console.error(`Failed to mark job ${job.data.jobId} as failed:`, updateError)
    }
  } else if (err instanceof GeminiRateLimitError) {
    try {
      await markJobStatus(job.data.jobId, {
        status: 'pending',
        error_message: `Rate limited by Gemini. Auto-retrying (attempt ${job.attemptsMade + 1}/${attempts}).`,
      })
    } catch (updateError) {
      console.error(`Failed to mark job ${job.data.jobId} as pending retry:`, updateError)
    }
  }
})

const shutdown = async () => {
  console.log('🛑 Shutting down try-on worker...')
  await worker.close()
  await getRedisConnection().quit()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

console.log(`👷 Try-on worker online. Queue=${TRYON_QUEUE_NAME}`)
