/**
 * GENERATIONS API - SUPABASE ONLY
 * 
 * GET - Fetch user's try-on generations
 */
import { createClient, createServiceClient } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function normalizeGenerationImagePath(path: string | null): string | null {
    if (!path) return null
    if (path.startsWith('base64://')) {
        return `data:image/png;base64,${path.replace('base64://', '')}`
    }
    return path
}

export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const service = createServiceClient()

        // Fetch generations from Supabase
        const { data: generations, error } = await service
            .from('generation_jobs')
            .select('id, status, output_image_path, settings, created_at, updated_at')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) {
            console.error('Error fetching generations:', error)
            return NextResponse.json(
                { error: 'Failed to fetch generations' },
                { status: 500 }
            )
        }

        // Transform to match frontend expectations (camelCase)
        const transformedGenerations = (generations || []).map(g => ({
            id: g.id,
            status: g.status,
            outputImagePath: normalizeGenerationImagePath(g.output_image_path),
            settings: g.settings,
            createdAt: g.created_at,
            updatedAt: g.updated_at,
        }))

        return NextResponse.json({ generations: transformedGenerations })
    } catch (error) {
        console.error('Error fetching generations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch generations' },
            { status: 500 }
        )
    }
}
