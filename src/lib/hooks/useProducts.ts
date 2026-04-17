'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Product {
  id: string
  name: string
  description?: string
  category?: string
  price?: number
  discount?: number
  stock?: number
  sku?: string
  try_on_compatible?: boolean
  link?: string
  tags?: string[]
  audience?: string
  cover_image?: string
  tryon_image?: string
  images?: string[]
  active: boolean
  created_at: string
  updated_at?: string
}

async function getProducts(): Promise<Product[]> {
  const res = await fetch('/api/brand/products', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch products')
  const data = await res.json()
  return data.products ?? data ?? []
}

export function useProducts() {
  return useQuery({
    queryKey: ['brand', 'products'],
    queryFn: getProducts,
    staleTime: 60 * 1000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const res = await fetch('/api/brand/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error?.details ? JSON.stringify(data.error.details) : data.error || 'Failed to create product')
      }
      const data = await res.json()
      return data.product ?? data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand', 'products'] })
    },
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const res = await fetch(`/api/brand/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update product')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand', 'products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/brand/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete product')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand', 'products'] })
    },
  })
}
