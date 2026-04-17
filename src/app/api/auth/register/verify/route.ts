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
    // We use service role to ensure it bypasses RLS
    const { error: profileError } = await service
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email,
          role: normalizedRole,
          name: username,
          onboarding_completed: false,
          approval_status: normalizedRole === 'brand' ? 'approved' : 'pending',
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('Profile upsert failed during verify:', profileError)
    }

    if (normalizedRole === 'influencer') {
      const { error: influencerProfileError } = await service
        .from('InfluencerProfile')
        .upsert(
          {
            userId: user.id,
            niches: [],
            socials: {},
          },
          { onConflict: 'userId' }
        )

      if (influencerProfileError) {
        console.error('Influencer profile scaffold failed during verify:', influencerProfileError)
      }
    }


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
