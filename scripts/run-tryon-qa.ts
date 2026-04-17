import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createRequire } from 'module'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const productId = process.env.TRYON_QA_PRODUCT_ID || '9f3baf62-c36e-433f-8d07-c11bea31482d'
const userId = process.env.TRYON_QA_USER_ID || '378fe55c-7b45-4b64-9a03-ba4ea8eb7a55'
const personUrl =
  process.env.TRYON_QA_PERSON_URL ||
  'https://twrqlnyhbowrmoybmyfv.supabase.co/storage/v1/object/public/identity-images/378fe55c-7b45-4b64-9a03-ba4ea8eb7a55/body_front-1773056565611.jpg'
const presetIds = (process.env.TRYON_QA_PRESETS || 'bw_studio_portrait,nyc_nightlife')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase env vars for QA script')
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      apikey: serviceKey!,
      Authorization: `Bearer ${serviceKey!}`,
    },
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${await response.text()}`)
  }
  return response.json() as Promise<T>
}

async function main() {
  const require = createRequire(import.meta.url)
  const serverOnlyPath = require.resolve('server-only')
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as NodeModule

  const [{ runHybridTryOnPipeline }, { getTryOnPresetV3 }] = await Promise.all([
    import('@/lib/tryon/hybrid-tryon-pipeline'),
    import('@/lib/tryon/presets'),
  ])

  const products = await fetchJson<Array<{
    id: string
    name: string
    tryon_image: string | null
    cover_image: string | null
  }>>(`${supabaseUrl}/rest/v1/products?id=eq.${productId}&select=id,name,tryon_image,cover_image`)

  const product = products[0]
  if (!product?.tryon_image) {
    throw new Error(`No try-on image found for product ${productId}`)
  }

  const personResp = await fetch(personUrl)
  if (!personResp.ok) {
    throw new Error(`Person image fetch failed: ${personResp.status}`)
  }

  const personBuffer = Buffer.from(await personResp.arrayBuffer())
  const personImageBase64 = `data:image/jpeg;base64,${personBuffer.toString('base64')}`

  const outputDir = path.join(process.cwd(), 'artifacts', 'qa')
  fs.mkdirSync(outputDir, { recursive: true })

  const summaries: Array<Record<string, unknown>> = []
  for (const presetId of presetIds) {
    const preset = getTryOnPresetV3(presetId)
    if (!preset) {
      summaries.push({ presetId, ok: false, error: 'Preset not found' })
      continue
    }

    const started = Date.now()
    try {
      const result = await runHybridTryOnPipeline({
        userId,
        personImageBase64,
        clothingImageBase64: product.tryon_image,
        aspectRatio: '4:5',
        preset: {
          id: preset.id,
          background_name: preset.background_name,
          lighting_name: preset.lighting_name,
        },
        productId,
      })

      const outPath = path.join(outputDir, `${presetId}.png`)
      const cleanBase64 = String(result.image || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')
      fs.writeFileSync(outPath, Buffer.from(cleanBase64, 'base64'))

      const rendererDebug = result.debug?.rendererDebug || {}
      summaries.push({
        presetId,
        ok: result.success,
        elapsedMs: Date.now() - started,
        outputPath: outPath,
        warnings: result.warnings || [],
        microDrift: rendererDebug.microDrift?.driftPercent ?? null,
        driftStatus: rendererDebug.microDrift?.status ?? null,
        driftReason: rendererDebug.driftAssessment?.reason ?? null,
        faceRestore: rendererDebug.faceRestoreResult ?? null,
        faceGate: rendererDebug.faceConsistencyGate ?? null,
        deterministicFaceLock: rendererDebug.deterministicFaceLock ?? null,
        model: rendererDebug.model ?? null,
        preferredModel: rendererDebug.preferredModel ?? null,
        renderFallbackReason: rendererDebug.renderFallbackReason ?? null,
      })
    } catch (error) {
      summaries.push({
        presetId,
        ok: false,
        elapsedMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  console.log(
    JSON.stringify(
      {
        userId,
        productId,
        productName: product.name,
        personUrl,
        summaries,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
