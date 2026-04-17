import { createClient } from '@/lib/auth'
import BadgeDisplay, { type BadgeTier } from '@/components/influencer/BadgeDisplay'

export const dynamic = 'force-dynamic'

export default async function InfluencerRankingsPage() {
  const supabase = await createClient()

  const { data: influencers } = await supabase
    .from('influencer_profiles')
    .select(`
       *,
       user:id ( id, full_name, email )
    `)
    .order('badge_score', { ascending: false })
    .order('followers', { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-cream pt-24 pb-10">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Influencer Rankings</h1>
        <p className="text-charcoal/60 mb-8">Ranked by badge score and engagement metrics.</p>

        <div className="bg-white rounded-2xl border border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream/60 text-charcoal/70">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Influencer</th>
                  <th className="px-5 py-3">Badge</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Followers</th>
                  <th className="px-5 py-3">Engagement</th>
                  <th className="px-5 py-3">Growth</th>
                  <th className="px-5 py-3">Retention</th>
                </tr>
              </thead>
              <tbody>
                {(!influencers || influencers.length === 0) ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-charcoal/60">No influencers ranked yet.</td></tr>
                ) : (
                  influencers.map((inf: any, index: number) => (
                    <tr key={index} className="border-t border-subtle/60">
                      <td className="px-5 py-3 font-medium">{index + 1}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-charcoal">{inf.user?.full_name || 'Influencer'}</div>
                        <div className="text-xs text-charcoal/60">{inf.user?.email}</div>
                      </td>
                      <td className="px-5 py-3"><BadgeDisplay tier={inf.badge_tier as BadgeTier} /></td>
                      <td className="px-5 py-3">{inf.badge_score ? Number(inf.badge_score).toFixed(2) : '—'}</td>
                      <td className="px-5 py-3">{inf.followers || '—'}</td>
                      <td className="px-5 py-3">{inf.engagement_rate ? `${(Number(inf.engagement_rate) * 100).toFixed(2)}%` : '—'}</td>
                      <td className="px-5 py-3">{inf.audience_rate ? `${Number(inf.audience_rate).toFixed(1)}%` : '—'}</td>
                      <td className="px-5 py-3">{inf.retention_rate ? `${Number(inf.retention_rate).toFixed(1)}%` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
