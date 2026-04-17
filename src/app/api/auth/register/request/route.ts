import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'
import { normalizeUsername } from '@/lib/auth-username'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid signup data' }, { status: 400 })
    }

    const { username: rawUsername, email, password, role } = parsed.data
    const username = normalizeUsername(rawUsername)
    const normalizedRole = role.toLowerCase() === 'brand' ? 'brand' : 'influencer'
    
    const supabase = await createClient()
    const service = createServiceClient()

    // 1. Check if Username OR Email already exists in profiles table
    const { data: existingUser } = await service
      .from('profiles')
      .select('id, email, name')
      .or(`name.eq.${username},email.eq.${email}`)
      .maybeSingle()

    if (existingUser) {
      const isEmailMatch = existingUser.email?.toLowerCase() === email.toLowerCase()
      const errorMsg = isEmailMatch 
        ? 'This email is already registered. Please sign in.' 
        : 'This username is already taken. Please choose another one.'
      
      return NextResponse.json({ error: errorMsg }, { status: 409 })
    }

    // 2. Extra Safety: Check Supabase Auth directly (if not in profiles)
    const { data: authUser } = await service.auth.admin.listUsers()
    const emailExistsInAuth = authUser.users.some(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (emailExistsInAuth) {
      return NextResponse.json(
        { error: 'This email is already registered. Please sign in.' },
        { status: 409 }
      )
    }




    // 2. Step 1: Sign up with Supabase
    // This will send an OTP/Confirmation email if configured in Supabase Auth settings
    console.log('--- Signup Attempt ---')
    console.log('Username:', username)
    console.log('Email:', email)

    const origin = request.headers.get('origin') || ''
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?role=${normalizedRole}`,
        data: {
          username,
          role: normalizedRole,
          name: username,
        },
      },
    })

    if (error) {
      console.error('Supabase SignUP Error Detail:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Signup Successful, OTP sent.')


    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      user: data.user,
    })
  } catch (error) {
    console.error('Register request error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
