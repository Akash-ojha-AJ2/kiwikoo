import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(6).max(8), // Handle both 6 and 8 digit tokens
  role: z.enum(['INFLUENCER', 'BRAND']),
  username: z.string().min(3),
})


export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = verifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid verification data' }, { status: 400 })
    }

    const { email, token, role, username } = parsed.data
    const normalizedRole = role.toLowerCase() === 'brand' ? 'brand' : 'influencer'
    
    const supabase = await createClient()
    const service = createServiceClient()

    // 1. Verify OTP
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })

    if (verifyError) {
      return NextResponse.json({ error: verifyError.message }, { status: 400 })
    }

    const user = verifyData.user
    if (!user) {
      return NextResponse.json({ error: 'Verification failed - user not found' }, { status: 400 })
    }

    // 2. Perform Scaffolding (Profile creation)
    console.log('--- Scaffolding Profile for User:', user.id, '---')
    
    const now = new Date().toISOString()
    const profilePayload = {
      id: user.id,
      email,
      role: normalizedRole.toUpperCase(),
      name: username,
      approval_status: normalizedRole === 'brand' ? 'APPROVED' : 'PENDING',
      createdAt: now,
      updatedAt: now,
    }



    const { data: existingProfile } = await service
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    let profileError = null
    if (existingProfile) {
      console.log('Profile already exists, updating...')
      const { error } = await service.from('profiles').update(profilePayload).eq('id', user.id)
      profileError = error
    } else {
      console.log('Creating new profile...')
      const { error } = await service.from('profiles').insert(profilePayload)
      profileError = error
    }

    if (profileError) {
      console.error('CRITICAL: Profile creation failed:', profileError)
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    // 3. Create Role-Specific Profile
    if (normalizedRole === 'influencer') {
      console.log('Scaffolding InfluencerProfile...')
      const { error: influencerProfileError } = await service
        .from('InfluencerProfile')
        .upsert({
          id: user.id,
          userId: user.id,
          niches: [],
          socials: {},
          onboardingCompleted: false,
          createdAt: now,
          updatedAt: now,
        }, { onConflict: 'userId' })

      if (influencerProfileError) {
        console.error('CRITICAL: InfluencerProfile failed:', influencerProfileError)
        throw new Error(`Role profile creation failed: ${influencerProfileError.message}`)
      }
    } else if (normalizedRole === 'brand') {
      console.log('Scaffolding BrandProfile...')
      const { error: brandProfileError } = await service
        .from('BrandProfile')
        .upsert({
          id: user.id,
          userId: user.id,
          companyName: username,
          onboardingCompleted: false,
          createdAt: now,
          updatedAt: now,
        }, { onConflict: 'userId' })

      if (brandProfileError) {
        console.error('CRITICAL: BrandProfile failed:', brandProfileError)
        throw new Error(`Role profile creation failed: ${brandProfileError.message}`)
      }
    }


    console.log('Scaffolding completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Email verified and account created!',
      user: {
        id: user.id,
        username,
        role: role,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

