import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/auth'
import { generateAdCopy, rateAdCreative } from '@/lib/openai'
import { editImageWithGemini } from '@/lib/gemini/image-edit'
import { saveUpload } from '@/lib/storage'

const adEditSchema = z.object({
  imageBase64: z.string().min(1).max(30_000_000).optional(),
  imageUrl: z.string().url().max(4096).optional(),
  maskBase64: z.string().max(30_000_000).optional(),
  prompt: z.string().trim().min(3).max(2000),
  referenceImageBase64: z.string().min(1).max(30_000_000).optional(),
  scope: z.enum(['auto', 'local', 'subject', 'full_frame']).optional(),
  task: z.enum(['auto', 'hold_product', 'wear_accessory', 'pose_change', 'text_edit', 'remove_object', 'stylized_effect', 'replace_region', 'add_object', 'scene_edit', 'general_edit']).optional(),
  expansionOverride: z.object({
    left: z.number().min(0).max(1),
    top: z.number().min(0).max(1),
    width: z.number().gt(0).max(1),
    height: z.number().gt(0).max(1),
  }).optional(),
  sourceAdId: z.string().trim().max(100).optional(),
  preset: z.string().trim().max(120).optional(),
}).strict().refine((value) => Boolean(value.imageBase64 || value.imageUrl), {
  message: 'Either imageBase64 or imageUrl is required',
  path: ['imageBase64'],
})

function getSupabaseHost(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  if (!raw) return null

  try {
    return new URL(raw).hostname.toLowerCase()
  } catch {
    return null
  }
}

async function resolveInputImageDataUrl(imageBase64?: string, imageUrl?: string) {
  if (imageBase64) return imageBase64
  if (!imageUrl) {
    throw new Error('No image provided for edit')
  }

  let target: URL
  try {
    target = new URL(imageUrl)
  } catch {
    throw new Error('Invalid image URL')
  }

  const supabaseHost = getSupabaseHost()
  if (!supabaseHost || target.hostname.toLowerCase() !== supabaseHost) {
    throw new Error('Only stored creative images can be edited')
  }

  if (!target.pathname.includes('/storage/v1/object/public/ads/')) {
    throw new Error('Unsupported creative image source')
  }

  const response = await fetch(target.toString(), {
    headers: { Accept: 'image/*' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load creative image (${response.status})`)
  }

  const contentType = response.headers.get('content-type') || 'image/png'
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Creative image source is not an image')
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  return `data:${contentType};base64,${buffer.toString('base64')}`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('role, brand_data, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role || '').toLowerCase() !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized - Brand access required' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const parsed = adEditSchema.parse(body)
    const inputImageDataUrl = await resolveInputImageDataUrl(parsed.imageBase64, parsed.imageUrl)

    let sourceCreative: {
      title: string | null
      campaign_id: string | null
      platform: string | null
    } | null = null

    if (parsed.sourceAdId) {
      const { data } = await service
        .from('ad_creatives')
        .select('title, campaign_id, platform, brand_id')
        .eq('id', parsed.sourceAdId)
        .maybeSingle()

      if (data && data.brand_id === user.id) {
        sourceCreative = {
          title: data.title,
          campaign_id: data.campaign_id,
          platform: data.platform,
        }
      }
    }

    const editResult = await editImageWithGemini({
      imageBase64: inputImageDataUrl,
      maskBase64: parsed.maskBase64,
      prompt: parsed.prompt,
      referenceImageBase64: parsed.referenceImageBase64,
      scope: parsed.scope,
      task: parsed.task,
      expansionOverride: parsed.expansionOverride,
    })

    const editedImage = editResult.image

    const rating = await rateAdCreative(editedImage).catch(() => ({ score: 78 }))
    const qualityScore = Number((rating as any)?.score || 78)

    const brandData = (profile.brand_data as Record<string, unknown> | null) || null
    const brandName = (brandData?.companyName as string | undefined) || profile.full_name || undefined
    const copyVariants = await generateAdCopy(editedImage, {
      productName: sourceCreative?.title || parsed.preset || 'fashion product',
      brandName,
      niche: parsed.preset || 'edited-ad',
    }).catch(() => [])

    const imagePath = `${user.id}/${Date.now()}-edited.png`
    const imageUrl = await saveUpload(editedImage, imagePath, 'ads', 'image/png')

    const titleBase = sourceCreative?.title || parsed.preset || 'Ad Creative'
    const metadataTags = [
      parsed.sourceAdId ? `[source:${parsed.sourceAdId}]` : '',
      (parsed.task || editResult.task) ? `[task:${parsed.task || editResult.task}]` : '',
      (parsed.scope || editResult.scope) ? `[scope:${parsed.scope || editResult.scope}]` : '',
      editResult.model ? `[model:${editResult.model}]` : '',
    ].filter(Boolean).join('')
    const lineagePrompt = metadataTags
      ? `INPAINT EDIT ${metadataTags}: ${parsed.prompt}`
      : `INPAINT EDIT: ${parsed.prompt}`

    const { data: createdCreative, error: insertError } = await service
      .from('ad_creatives')
      .insert({
        brand_id: user.id,
        image_url: imageUrl,
        title: `Edited ${titleBase}`,
        prompt: lineagePrompt,
        campaign_id: sourceCreative?.campaign_id || null,
        platform: sourceCreative?.platform || 'instagram',
        status: 'generated',
        rating: qualityScore,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Ad edit insert error:', insertError)
    }

    return NextResponse.json({
      id: createdCreative?.id || crypto.randomUUID(),
      imageUrl,
      imageBase64: editedImage,
      copy: copyVariants,
      rating,
      qualityScore,
      preset: parsed.preset || 'edited',
      sourceAdId: parsed.sourceAdId || null,
      promptUsed: `${editResult.model}-edit`,
      editTask: editResult.task,
      editScope: editResult.scope,
      editModel: editResult.model,
    })
  } catch (error) {
    console.error('Ad edit error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid edit input', details: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
