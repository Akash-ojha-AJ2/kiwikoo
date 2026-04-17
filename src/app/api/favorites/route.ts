import { NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', authUser.id)

    if (error) throw error

    // Identify favorited product IDs
    const favoritedIds = favorites.map(f => f.product_id)

    // Optionally fetch full product details if needed by hook
    // But the hook just returns what? `useFavorites` checks if product is in list?
    // The previous implementation returned `favorite` objects which contained `product`.

    // Let's return full products for compatibility
    if (favoritedIds.length === 0) return NextResponse.json([])

    const { data: products } = await supabase
      .from('products')
      .select('*, brand:brand_id(*)')
      .in('id', favoritedIds)

    return NextResponse.json(products || [], {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { productId } = body

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: authUser.id, product_id: productId })

    if (error) {
      // Ignore duplicate error
      if (error.code === '23505') return NextResponse.json({ success: true })
      throw error
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', authUser.id)
      .eq('product_id', productId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
