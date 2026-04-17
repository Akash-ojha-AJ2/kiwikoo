import { redirect } from 'next/navigation'
import { createClient } from '@/lib/auth'
import ProductsClient, { Product } from '@/components/brand/ProductsClient'

export const dynamic = 'force-dynamic'

export default async function BrandProductsPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login?from=brand')
  }

  // Double check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role || '').toLowerCase() !== 'brand') {
    redirect('/dashboard')
  }

  // Fetch products using Standard Client (RLS Enforced)
  // No "brand_id" filter needed if RLS is correct, but adding it doesn't hurt for clarity
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      category,
      price,
      discount,
      stock,
      sku,
      try_on_compatible,
      link,
      tags,
      audience,
      cover_image,
      tryon_image,
      images,
      active,
      created_at
    `)
    .eq('brand_id', user.id) // Redundant but explicit
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch products:', error)
    // We could show an error state, but empty list is safer fallback
  }

  return <ProductsClient initialProducts={(products as Product[]) || []} />
}
