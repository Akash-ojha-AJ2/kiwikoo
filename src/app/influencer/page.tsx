/**
 * INFLUENCER BASE ROUTE
 * 
 * Redirects to /influencer/dashboard
 */
import { redirect } from 'next/navigation'

export default function InfluencerPage() {
    redirect('/influencer/dashboard')
}
