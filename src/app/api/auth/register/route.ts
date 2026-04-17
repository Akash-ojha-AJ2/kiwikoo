import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'
import { normalizeUsername, usernameToSyntheticEmail } from '@/lib/auth-username'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid signup data' }, { status: 400 })
    }

    const { username: rawUsername, password, role } = parsed.data
    const username = normalizeUsername(rawUsername)
    const email = usernameToSyntheticEmail(username)
    const normalizedRole = role.toLowerCase() === 'brand' ? 'brand' : 'influencer'
    const supabase = await createClient()

    let createdUserId: string | null = null

    const ensureRoleScaffolding = async (userId: string) => {
      const profilePayload = {
        id: userId,
        email,
        role: normalizedRole,
        full_name: username,
        onboarding_completed: false,
        approval_status: normalizedRole === 'brand' ? 'approved' : 'pending',
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })

      if (profileError) {
        console.warn('Profile upsert failed during register fallback:', profileError)
      }

      if (normalizedRole === 'influencer') {
        const { error: influencerProfileError } = await supabase
          .from('influencer_profiles')
          .upsert(
            {
              user_id: userId,
              niches: [],
              socials: {},
            },
            { onConflict: 'user_id' }
          )

        if (influencerProfileError) {
          console.warn('Influencer profile scaffold failed during register:', influencerProfileError)
        }
      }
    }

    try {
      const service = createServiceClient()

      const { data: createdUser, error: createUserError } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: normalizedRole,
          username,
          name: username,
        },
      })

      if (createUserError) {
        const lowerMessage = (createUserError.message || '').toLowerCase()
        if (lowerMessage.includes('already') || lowerMessage.includes('exists')) {
          return NextResponse.json(
            { error: 'Username already exists. Please sign in.' },
            { status: 409 }
          )
        }

        return NextResponse.json(
          { error: createUserError.message || 'Failed to create account' },
          { status: 400 }
        )
      }

      if (!createdUser.user) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }

      createdUserId = createdUser.user.id

      const { error: profileError } = await service
        .from('profiles')
        .upsert(
          {
            id: createdUser.user.id,
            email,
            role: normalizedRole,
            full_name: username,
            onboarding_completed: false,
            approval_status: normalizedRole === 'brand' ? 'approved' : 'pending',
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        console.warn('Profile upsert failed during register:', profileError)
      }

      if (normalizedRole === 'influencer') {
        const { error: influencerProfileError } = await service
          .from('influencer_profiles')
          .upsert(
            {
              user_id: createdUser.user.id,
              niches: [],
              socials: {},
            },
            { onConflict: 'user_id' }
          )

        if (influencerProfileError) {
          console.warn('Influencer profile scaffold failed during register:', influencerProfileError)
        }
      }
    } catch (serviceError) {
      console.warn('Service role unavailable; falling back to standard sign-up flow:', serviceError)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: normalizedRole,
            username,
            name: username,
          },
        },
      })

      if (signUpError) {
        const lowerMessage = (signUpError.message || '').toLowerCase()
        if (lowerMessage.includes('already') || lowerMessage.includes('exists')) {
          return NextResponse.json(
            { error: 'Username already exists. Please sign in.' },
            { status: 409 }
          )
        }

        return NextResponse.json(
          { error: signUpError.message || 'Failed to create account' },
          { status: 400 }
        )
      }

      if (!signUpData.user) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }

      createdUserId = signUpData.user.id
    }

    if (createdUserId) {
      await ensureRoleScaffolding(createdUserId)
    }

    const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signedIn.user) {
      return NextResponse.json(
        {
          success: true,
          requiresManualLogin: true,
          message: 'Account created. Please sign in.',
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: signedIn.user.id,
        username,
        role: normalizedRole.toUpperCase(),
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
