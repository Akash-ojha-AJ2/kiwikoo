import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/auth'
import {
  BUILTIN_PRESET_RESEARCH_OVERRIDES,
  clearResearchOverrideCache,
  listEffectiveResearchProfiles,
} from '@/lib/tryon/research-profile-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const upsertSchema = z
  .object({
    presetId: z.string().trim().min(1).max(120),
    mode: z.enum(['off', 'low', 'balanced', 'deep']).optional(),
    timeoutMs: z.number().int().min(600).max(8000).optional(),
    maxSnippets: z.number().int().min(1).max(8).optional(),
    maxContextChars: z.number().int().min(180).max(2000).optional(),
    focusTerms: z.array(z.string().trim().min(1).max(160)).max(10).optional(),
    enabled: z.boolean().optional(),
  })
  .strict()

const deleteSchema = z
  .object({
    presetId: z.string().trim().min(1).max(120),
  })
  .strict()

async function requireAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const service = createServiceClient()
  const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
  if ((profile?.role || '').toLowerCase() !== 'admin') {
    return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, error: null }
}

export async function GET(request: Request) {
  const auth = await requireAdminUser()
  if (auth.error) return auth.error

  try {
    const service = createServiceClient()
    const includeEffective = new URL(request.url).searchParams.get('effective') !== '0'
    const { data, error } = await service
      .from('tryon_research_profiles')
      .select('preset_id, mode, timeout_ms, max_snippets, max_context_chars, focus_terms, enabled, updated_by, updated_at')
      .order('preset_id', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message, hint: 'Run migration create_tryon_research_profiles.sql' }, { status: 500 })
    }

    const response: Record<string, unknown> = {
      overrides: data || [],
      builtinOverrides: BUILTIN_PRESET_RESEARCH_OVERRIDES,
    }
    if (includeEffective) {
      response.effectiveProfiles = await listEffectiveResearchProfiles()
    }
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminUser()
  if (auth.error) return auth.error

  try {
    const parsed = upsertSchema.parse(await request.json())
    const service = createServiceClient()

    const payload = {
      preset_id: parsed.presetId.toLowerCase(),
      mode: parsed.mode ?? 'balanced',
      timeout_ms: parsed.timeoutMs ?? 1800,
      max_snippets: parsed.maxSnippets ?? 3,
      max_context_chars: parsed.maxContextChars ?? 760,
      focus_terms: parsed.focusTerms ?? [],
      enabled: parsed.enabled ?? true,
      updated_by: auth.user!.id,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await service
      .from('tryon_research_profiles')
      .upsert(payload, { onConflict: 'preset_id' })
      .select('preset_id, mode, timeout_ms, max_snippets, max_context_chars, focus_terms, enabled, updated_by, updated_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    clearResearchOverrideCache()
    return NextResponse.json({ success: true, profile: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminUser()
  if (auth.error) return auth.error

  try {
    const parsed = deleteSchema.parse(await request.json())
    const service = createServiceClient()
    const { error } = await service
      .from('tryon_research_profiles')
      .delete()
      .eq('preset_id', parsed.presetId.toLowerCase())

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    clearResearchOverrideCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Error' }, { status: 500 })
  }
}
