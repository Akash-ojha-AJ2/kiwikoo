/**
 * BRAND ONBOARDING API
 *
 * Source of truth: profiles.brand_data JSONB.
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { z } from 'zod'

const onboardingSchema = z
  .object({
    companyName: z.string().trim().max(120).optional(),
    brandType: z.string().trim().max(80).optional(),
    targetAudience: z.array(z.string().trim().max(80)).max(20).optional(),
    productTypes: z.array(z.string().trim().max(80)).max(50).optional(),
    website: z.string().trim().url().max(2048).optional().or(z.literal('')),
    vertical: z.string().trim().max(120).optional(),
    budgetRange: z.string().trim().max(80).optional(),
    description: z.string().trim().max(4000).optional(),
    contactEmail: z.string().trim().email().max(320).optional(),
    contactPhone: z.string().trim().max(40).optional(),
    socialLinks: z
      .object({
        instagram: z.string().trim().max(200).optional(),
        twitter: z.string().trim().max(200).optional(),
        linkedin: z.string().trim().max(200).optional(),
      })
      .optional(),
  })
  .strict()

async function getProfileClient() {
  const supabase = await createClient()

  try {
    const service = createServiceClient()
    return { supabase, profileClient: service }
  } catch (serviceError) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set for onboarding; using session client fallback:', serviceError)
    return { supabase, profileClient: supabase }
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, profileClient } = await getProfileClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await profileClient
      .from('profiles')
      .select('id, email, role, onboarding_completed, brand_data')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Profile not found in database' }, { status: 404 })
    }

    if ((profile.role || '').toLowerCase() !== 'brand') {
      return NextResponse.json({ error: 'Not a brand account' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const data = onboardingSchema.parse(body)

    const isCompleted = Boolean(data.companyName && data.companyName.trim() !== '')

    const existingData = (profile.brand_data as Record<string, unknown>) || {}
    const newBrandData = {
      ...existingData,
      ...(data.companyName && { companyName: data.companyName }),
      ...(data.brandType && { brandType: data.brandType }),
      ...(data.targetAudience && { targetAudience: data.targetAudience }),
      ...(data.productTypes && { productTypes: data.productTypes }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.vertical && { vertical: data.vertical }),
      ...(data.budgetRange && { budgetRange: data.budgetRange }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
      ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
      ...(data.socialLinks !== undefined && {
        socialLinks: {
          ...((existingData.socialLinks as Record<string, unknown>) || {}),
          ...data.socialLinks,
        },
      }),
    }

    const updateData: Record<string, unknown> = {
      brand_data: newBrandData,
    }

    if (isCompleted && !profile.onboarding_completed) {
      updateData.onboarding_completed = true
      updateData.approval_status = 'approved'
    }

    const { error: updateError } = await profileClient
      .from('profiles')
      .update(updateData)
      .eq('id', authUser.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to save brand data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      onboardingCompleted: isCompleted,
      redirectTo: isCompleted ? '/dashboard' : null,
    })
  } catch (error) {
    console.error('Onboarding error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { supabase, profileClient } = await getProfileClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await profileClient
      .from('profiles')
      .select('email, role, onboarding_completed, brand_data')
      .eq('id', authUser.id)
      .single()

    if (!profile) {
      return NextResponse.json({ onboardingCompleted: false })
    }

    if ((profile.role || '').toLowerCase() !== 'brand') {
      return NextResponse.json({ error: 'Not a brand account' }, { status: 403 })
    }

    const brandData = (profile.brand_data as Record<string, unknown>) || {}

    return NextResponse.json({
      onboardingCompleted: profile.onboarding_completed || false,
      profile: {
        companyName: brandData.companyName || '',
        brandType: brandData.brandType || '',
        targetAudience: brandData.targetAudience || [],
        productTypes: brandData.productTypes || [],
        website: brandData.website || '',
        vertical: brandData.vertical || '',
        budgetRange: brandData.budgetRange || '',
        description: brandData.description || '',
        contactEmail: brandData.contactEmail || profile.email || '',
        contactPhone: brandData.contactPhone || '',
        socialLinks: {
          instagram: (brandData.socialLinks as Record<string, unknown>)?.instagram || '',
          twitter: (brandData.socialLinks as Record<string, unknown>)?.twitter || '',
          linkedin: (brandData.socialLinks as Record<string, unknown>)?.linkedin || '',
        },
      },
    })
  } catch (error) {
    console.error('Onboarding check error:', error)
    return NextResponse.json({ onboardingCompleted: false })
  }
}
