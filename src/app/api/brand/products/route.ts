/**
 * PRODUCTS API
 *
 * GET - List products for authenticated brand (for client hooks)
 * POST - Create new product
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/auth'
import { z } from 'zod'

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().optional(),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    sku: z.string().max(100).optional(),
    try_on_compatible: z.boolean().optional(),
    link: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    audience: z.string().optional(),
    cover_image: z.string().optional(),
    tryon_image: z.string().optional(),
    images: z.array(z.string()).optional(),
})

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (!profile || (profile.role || '').toLowerCase() !== 'brand') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('brand_id', user.id)
            .order('created_at', { ascending: false })
        if (error) {
            console.error('Products GET error:', error)
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
        }
        return NextResponse.json({ products: products || [] })
    } catch (error) {
        console.error('Products GET error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get brand profile using Standard Client (RLS)
        // If RLS prevents reading own profile, this will fail (as it should if not owner)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role || '').toLowerCase() !== 'brand') {
            return NextResponse.json({ error: 'Only brands can create products' }, { status: 403 })
        }

        let body: unknown
        try {
            body = await request.json()
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Invalid request payload. Try smaller images or fewer uploads.' },
                { status: 413 }
            )
        }
        const parsed = productSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid product data', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const productData = {
            brand_id: user.id,
            name: parsed.data.name,
            description: parsed.data.description || null,
            category: parsed.data.category || null,
            price: parsed.data.price || null,
            discount: parsed.data.discount ?? null,
            stock: parsed.data.stock ?? null,
            sku: parsed.data.sku || null,
            try_on_compatible: parsed.data.try_on_compatible ?? false,
            link: parsed.data.link || null,
            tags: parsed.data.tags || [],
            audience: parsed.data.audience || null,
            cover_image: parsed.data.cover_image || null,
            tryon_image: parsed.data.tryon_image || null,
            images: parsed.data.images || [],
            active: true,
        }

        // Insert using Standard Client (RLS Enforced)
        const { data: product, error: insertError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()

        if (insertError) {
            console.error('Product insert error:', insertError)
            return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
        }

        // Clear Server Component Cache
        revalidatePath('/brand/products')
        revalidatePath('/brand/dashboard')

        return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
        console.error('Products API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
