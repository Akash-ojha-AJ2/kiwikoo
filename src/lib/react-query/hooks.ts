'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { safeParseResponse } from '@/lib/api-utils'

// User data hook - optimized for auth-aware navigation
export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (!res.ok) {
        // If 401, user is not authenticated - return null instead of throwing
        if (res.status === 401) {
          return null
        }
        throw new Error('Failed to fetch user')
      }
      const data = await safeParseResponse(res, 'auth')
      if (!data.user) {
        return null
      }

      return {
        ...data.user,
        profile: data.profile ?? null,
        onboardingCompleted:
          data.user.onboardingCompleted ?? Boolean(data.profile?.onboarding_completed),
        approvalStatus:
          data.user.approvalStatus ?? data.profile?.approval_status ?? 'none',
        avatarUrl: data.user.avatarUrl ?? data.profile?.avatar_url ?? null,
      }
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds (for navigation)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: false, // Don't retry on 401 errors
    refetchOnMount: false, // Reuse fresh auth data across route transitions
    refetchOnWindowFocus: false, // Avoid auth flicker when switching tabs
    refetchOnReconnect: true, // Refetch when network reconnects
  })
}


// Notifications hook
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', {
        cache: 'no-store',
        next: { revalidate: 10 }, // Revalidate every 10 seconds
      })
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return safeParseResponse(res, 'notifications')
    },
    staleTime: Infinity, // Rely on Realtime invalidation or manual refetch
    queryKeyHashFn: JSON.stringify, // Stable key hashing
    refetchOnWindowFocus: true, // Refetch when window regains focus (good backup)
  })
}

// Mark notification as read mutation
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark as read')
      return safeParseResponse(res, 'notifications')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Mark all notifications as read mutation
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to mark all as read')
      return safeParseResponse(res, 'notifications')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Products hook with filters
export function useProducts(filters?: { brandId?: string; category?: string; search?: string }) {
  const params = new URLSearchParams()
  if (filters?.brandId) params.set('brandId', filters.brandId)
  if (filters?.category) params.set('category', filters.category)
  if (filters?.search) params.set('search', filters.search)

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await safeParseResponse(res, 'products')
      return data.data || data
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

// Single product hook
export function useProduct(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null
      const res = await fetch(`/api/products?id=${productId}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      return safeParseResponse(res, 'product')
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Product recommendations hook
export function useProductRecommendations(productId: string | null) {
  return useQuery({
    queryKey: ['product-recommendations', productId],
    queryFn: async () => {
      if (!productId) return []
      const res = await fetch(`/api/products/recommend?productId=${productId}`)
      if (!res.ok) return []
      return safeParseResponse(res, 'recommendations')
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations don't change often
  })
}

// Profile stats hook
export function useProfileStats() {
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const res = await fetch('/api/profile/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return safeParseResponse(res, 'profile-stats')
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Favorites hook
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites', {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to fetch favorites')
      return safeParseResponse(res, 'favorites')
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Toggle favorite mutation with optimistic updates
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, isFavorited }: { productId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        const res = await fetch(`/api/favorites?productId=${productId}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to remove favorite')
        return safeParseResponse(res, 'favorites')
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (!res.ok) throw new Error('Failed to add favorite')
        return safeParseResponse(res, 'favorites')
      }
    },
    onMutate: async ({ productId, isFavorited }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['favorites'] })

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData(['favorites'])

      // Optimistically update UI immediately
      queryClient.setQueryData(['favorites'], (old: any[] = []) => {
        if (isFavorited) {
          // Remove from favorites
          return old.filter((product: any) => (product?.id || product?.product_id) !== productId)
        } else {
          // Optimistically add a minimal item so Save toggles instantly
          if (old.some((product: any) => (product?.id || product?.product_id) === productId)) {
            return old
          }
          return [...old, { id: productId, product_id: productId }]
        }
      })

      return { previousFavorites }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate to refetch and get accurate data
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

// Generations hook - fetch all user's try-on generations
export function useGenerations() {
  return useQuery({
    queryKey: ['generations'],
    queryFn: async () => {
      const res = await fetch('/api/generations', {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401) return []
        throw new Error('Failed to fetch generations')
      }
      const data = await safeParseResponse(res, 'generations')
      return data.generations || []
    },
    staleTime: Infinity, // Rely on Realtime invalidation
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    queryKeyHashFn: JSON.stringify,
  })
}

export function useDeleteGeneration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/generations/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as any)?.error || 'Failed to delete generation')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] })
    },
  })
}
