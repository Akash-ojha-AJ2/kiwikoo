/**
 * PRODUCT BY ID API
 * 
 * PUT - Update product
 * DELETE - Delete product
 * 
 * DEPRECATED: GET (Use Server Components)
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
    name: z.string().min(1).optional(),
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
    active: z.boolean().optional(),
})


interface Params {
    params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        const parsed = updateSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid data', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        // Update using Standard Client (RLS Enforced)
        const { data: product, error } = await supabase
            .from('products')
            .update({
                ...parsed.data,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('brand_id', user.id) // RLS should enforce this, but explicit check is good
            .select()
            .single()

        if (error) {
            console.error('Product update error:', error)
            return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
        }

        // Clear Cache
        revalidatePath('/brand/products')
        revalidatePath('/brand/dashboard')

        return NextResponse.json({ product })
    } catch (error) {
        console.error('Product PUT error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Delete using Standard Client (RLS Enforced)
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('brand_id', user.id)

        if (error) {
            console.error('Product delete error:', error)
            return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
        }

        // Clear Cache
        revalidatePath('/brand/products')
        revalidatePath('/brand/dashboard')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Product DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
