'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Campaign, CampaignCreateInput, CampaignSummary } from '@/lib/campaigns/types'

async function getCampaigns(): Promise<Campaign[]> {
  const res = await fetch('/api/campaigns', { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch campaigns')
  return res.json()
}

async function getCampaignSummary(): Promise<CampaignSummary> {
  const res = await fetch('/api/campaigns?summary=true', { credentials: 'include' })
  if (!res.ok) return { total_spend: 0, active_campaigns: 0, total_impressions: 0, total_conversions: 0 }
  return res.json()
}

async function getCampaign(id: string): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch campaign')
  return res.json()
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
    staleTime: 5 * 1000, // 5 seconds — short so new campaigns appear quickly
    refetchOnMount: 'always', // Always refetch when component mounts
  })
}

export function useCampaignSummary() {
  return useQuery({
    queryKey: ['campaigns', 'summary'],
    queryFn: getCampaignSummary,
    staleTime: 60 * 1000,
  })
}

export function useCampaign(id: string | null) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => getCampaign(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CampaignCreateInput) => {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create campaign')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.refetchQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useUpdateCampaign(id: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Campaign> & { audience?: Record<string, unknown>; creative?: Record<string, unknown> }) => {
      if (!id) throw new Error('Campaign ID is required')
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update campaign')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete campaign')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
