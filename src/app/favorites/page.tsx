import { createClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppImage } from '@/components/ui/AppImage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart } from 'lucide-react'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Fetch favorites joining products using Supabase
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      created_at,
      product:product_id (
        id, name, description, category,
        brand:brand_id (
          id, full_name, brand_data
        ),
        images, cover_image, imagePath
      )
    `)
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Favorites</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Products you&apos;ve saved for later
        </p>
      </div>

      {!favorites || favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="text-zinc-600 dark:text-zinc-400">
            No favorites yet. Start exploring the marketplace!
          </p>
          <Link
            href="/marketplace"
            className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite: any) => {
            const product = favorite.product
            if (!product) return null

            // Handle image logic
            let coverImage = product.cover_image
            if (!coverImage && product.images && product.images.length > 0) {
              coverImage = product.images[0]
            }
            // Fallback for legacy data if needed (imagePath) - rarely used now but good for safety
            if (!coverImage && product.imagePath) coverImage = product.imagePath

            // Brand Name
            const brandData = product.brand?.brand_data || {}
            const brandName = brandData.companyName || product.brand?.full_name || 'Brand'

            return (
              <Link key={product.id} href={`/marketplace/${product.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 overflow-hidden">
                      {coverImage ? (
                        <AppImage
                          src={coverImage}
                          alt={product.name}
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        {product.category || 'Uncategorized'}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        by {brandName}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
