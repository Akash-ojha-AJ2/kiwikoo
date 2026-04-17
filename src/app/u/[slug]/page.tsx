import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Instagram, Youtube, Facebook, BadgeCheck, Users, TrendingUp } from 'lucide-react'
import { AppImage } from '@/components/ui/AppImage'
import { createServiceClient } from '@/lib/auth'
import { getGenerationTagFromDob, normalizeDateOfBirth } from '@/lib/profile-demographics'

export const dynamic = 'force-dynamic'

type SocialKey = 'instagram' | 'youtube' | 'facebook' | 'snapchat'

const SOCIAL_LABELS: Record<SocialKey, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  snapchat: 'Snapchat',
}

function normalizeSlug(value: string) {
  return decodeURIComponent(value).trim().toLowerCase()
}

function buildSocialUrl(platform: SocialKey, rawValue: string) {
  const value = rawValue.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value

  const clean = value.replace(/^@/, '')
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${clean}`
    case 'youtube':
      return `https://youtube.com/@${clean}`
    case 'facebook':
      return `https://facebook.com/${clean}`
    case 'snapchat':
      return `https://snapchat.com/add/${clean}`
    default:
      return null
  }
}

function formatPercent(value: unknown) {
  const num = Number(value || 0)
  return `${Number.isFinite(num) ? num : 0}%`
}

function formatFollowers(value: unknown) {
  const num = Number(value || 0)
  if (!Number.isFinite(num)) return '0'
  return new Intl.NumberFormat('en-IN').format(num)
}

export default async function PublicInfluencerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  if (!normalizedSlug) {
    notFound()
  }

  const service = createServiceClient()
  const { data: candidates, error } = await service
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, approval_status, onboarding_completed')
    .ilike('email', `${normalizedSlug}@%`)
    .limit(5)

  if (error || !Array.isArray(candidates)) {
    notFound()
  }

  const profile = candidates.find((candidate) => {
    const email = String(candidate.email || '').toLowerCase()
    const localPart = email.split('@')[0]
    return localPart === normalizedSlug
  })

  if (
    !profile ||
    String(profile.role || '').toLowerCase() !== 'influencer' ||
    String(profile.approval_status || '').toLowerCase() !== 'approved' ||
    !profile.onboarding_completed
  ) {
    notFound()
  }

  const { data: influencerProfile } = await service
    .from('influencer_profiles')
    .select('bio, niches, socials, followers, engagement_rate, audience_rate, badge_tier, badge_score')
    .eq('user_id', profile.id)
    .maybeSingle()

  let dateOfBirth: string | null = null
  let generationTag: string | null = null
  try {
    const { data: authLookup, error: authLookupError } = await service.auth.admin.getUserById(profile.id)
    if (authLookupError) {
      console.warn('Public profile demographics lookup failed:', authLookupError.message)
    } else {
      dateOfBirth = normalizeDateOfBirth(authLookup.user?.user_metadata?.date_of_birth)
      generationTag = getGenerationTagFromDob(dateOfBirth)
    }
  } catch (error) {
    console.warn('Public profile demographics lookup failed:', error)
  }

  const socials = (influencerProfile?.socials || {}) as Partial<Record<SocialKey, string>>
  const socialEntries = (Object.entries(socials) as Array<[SocialKey, string]>)
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([platform, value]) => ({
      platform,
      label: SOCIAL_LABELS[platform],
      href: buildSocialUrl(platform, value),
      value,
    }))
    .filter((entry) => Boolean(entry.href))

  const displayName = profile.full_name || normalizedSlug
  const avatarFallback = displayName.charAt(0).toUpperCase()
  const niches = Array.isArray(influencerProfile?.niches) ? influencerProfile.niches : []

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-[3px] border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="border-[4px] border-black bg-white p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative h-36 w-36 shrink-0 overflow-hidden border-[4px] border-black bg-[#FFD93D] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {profile.avatar_url ? (
                  <AppImage src={profile.avatar_url} alt={displayName} className="object-cover" sizes="144px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-black text-black/70">
                    {avatarFallback}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-2 border-[3px] border-black bg-[#FFD93D] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <BadgeCheck className="h-4 w-4" />
                  Public Profile
                </div>
                <h1 className="mt-4 text-4xl font-black uppercase tracking-tight text-black sm:text-5xl">
                  {displayName}
                </h1>
                <p className="mt-3 max-w-2xl border-l-[4px] border-[#FF8C69] pl-4 text-base font-bold text-black/65 sm:text-lg">
                  {influencerProfile?.bio || 'Kiwikoo creator profile.'}
                </p>

                {niches.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {niches.map((niche) => (
                      <span
                        key={niche}
                        className="border-[2px] border-black bg-[#FFF3E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {String(niche)}
                      </span>
                    ))}
                  </div>
                )}

                {generationTag && (
                  <div className="mt-4">
                    <span className="inline-flex border-[2px] border-black bg-[#B4F056] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      {generationTag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="border-[3px] border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#FFD93D] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black text-black">{formatFollowers(influencerProfile?.followers)}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-black/55">Followers</div>
              </div>

              <div className="border-[3px] border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#FF8C69] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black text-black">{formatPercent(influencerProfile?.engagement_rate)}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-black/55">Engagement</div>
              </div>

              <div className="border-[3px] border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center border-[3px] border-black bg-[#FFF1B8] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div className="text-3xl font-black text-black">{Number(influencerProfile?.badge_score || 0)}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-black/55">
                  {String(influencerProfile?.badge_tier || 'Creator')}
                </div>
              </div>
            </div>

            {socialEntries.length > 0 && (
              <div className="border-[3px] border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-black/55">Social Links</h2>
                <div className="space-y-3">
                  {socialEntries.map((entry) => {
                    const Icon =
                      entry.platform === 'instagram'
                        ? Instagram
                        : entry.platform === 'youtube'
                          ? Youtube
                          : entry.platform === 'facebook'
                            ? Facebook
                            : ExternalLink

                    return (
                      <a
                        key={entry.platform}
                        href={entry.href || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 border-[2px] border-black bg-[#F8F6F0] px-4 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                      >
                        <span className="inline-flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-black uppercase">{entry.label}</span>
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
