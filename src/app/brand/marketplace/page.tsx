/**
 * MARKETPLACE REDIRECT
 * 
 * Redirects to /brand/influencers which is the new Supabase-based page
 */
import { redirect } from 'next/navigation'

export default function BrandMarketplacePage() {
  redirect('/brand/influencers')
}
