'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/simple-sonner'

export function useCollaborations(type: 'sent' | 'received') {
  return useQuery({
    queryKey: ['collaborations', type],
    queryFn: async () => {
      const res = await fetch(`/api/collaborations?type=${type}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to fetch collaborations')
      return res.json()
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useUpdateCollaborationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'declined' }) => {
      const res = await fetch('/api/collaborations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || `Failed to ${status} collaboration`)
      }

      return res.json()
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['collaborations'] })
      const previousCollaborations = queryClient.getQueryData(['collaborations', 'received'])

      queryClient.setQueryData(['collaborations', 'received'], (old: any[] | undefined) => {
        if (!old) return old
        return old.map((collab: any) => (collab.id === id ? { ...collab, status } : collab))
      })

      return { previousCollaborations }
    },
    onError: (error, variables, context) => {
      if (context?.previousCollaborations) {
        queryClient.setQueryData(['collaborations', 'received'], context.previousCollaborations)
      }

      toast.error(error instanceof Error ? error.message : `Failed to ${variables.status} collaboration`)
    },
    onSuccess: (_data, variables) => {
      toast.success(`Collaboration ${variables.status} successfully.`, {
        duration: 3000,
        position: 'top-center',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborations'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
