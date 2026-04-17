import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
import { z } from 'zod'

const socialsSchema = z.object({
  instagram: z.string().trim().max(80).optional(),
  tiktok: z.string().trim().max(80).optional(),
  youtube: z.string().trim().max(80).optional(),
  twitter: z.string().trim().max(80).optional(),
  facebook: z.string().trim().max(80).optional(),
  linkedin: z.string().trim().max(80).optional(),
  pinterest: z.string().trim().max(80).optional(),
  snapchat: z.string().trim().max(80).optional(),
}).strict()

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('influencer_profiles(socials)')
      .eq('id', authUser.id)
      .single()

    const influencerProfile = Array.isArray(profile?.influencer_profiles)
      ? profile.influencer_profiles[0]
      : profile?.influencer_profiles
    const socials = (influencerProfile?.socials as Record<string, string>) || {}

    return NextResponse.json({ socials })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const socials = socialsSchema.parse(body)

    const cleanedSocials: Record<string, string> = {}
    for (const [platform, value] of Object.entries(socials)) {
      if (value && value.trim()) {
        cleanedSocials[platform] = value.trim().replace(/^@/, '')
      }
    }

    const { data: updated, error } = await supabase
      .from('influencer_profiles')
      .update({ socials: cleanedSocials })
      .eq('id', authUser.id)
      .select('socials')
      .single()

    if (error) throw error

    return NextResponse.json({ socials: updated.socials })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
