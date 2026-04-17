'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowRight, CheckCircle2, MessageSquare, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useCollaborations, useUpdateCollaborationStatus } from '@/lib/react-query/collaborations'
import { BrutalLoader } from '@/components/ui/BrutalLoader'

function BrutalCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] ${className}`}
    >
      {children}
    </div>
  )
}

function BrutalTag({
  label,
  color = 'bg-white',
  textColor = 'text-black',
}: {
  label: string
  color?: string
  textColor?: string
}) {
  return (
    <span
      className={`px-3 py-1 text-xs font-black border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide ${color} ${textColor}`}
    >
      {label}
    </span>
  )
}

interface Collaboration {
  id: string
  message: string
  status: string
  createdAt: string
  brand: {
    id: string
    name?: string | null
    brandProfile?: {
      companyName?: string
    } | null
  } | null
  proposalDetails?: {
    budget?: number
    timeline?: string
    goals?: string[]
    notes?: string
    productId?: string
  }
}

export default function InfluencerCollaborationsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    collabId: string | null
    status: 'accepted' | 'declined' | null
  }>({
    open: false,
    collabId: null,
    status: null,
  })

  const { data: collaborationsData, isLoading: loading } = useCollaborations('received')
  const updateStatusMutation = useUpdateCollaborationStatus()
  const collaborations: Collaboration[] = collaborationsData || []

  const handleStatusChange = (collabId: string, status: 'accepted' | 'declined') => {
    setConfirmDialog({ open: true, collabId, status })
  }

  const confirmStatusChange = () => {
    if (!confirmDialog.collabId || !confirmDialog.status) return
    updateStatusMutation.mutate({
      id: confirmDialog.collabId,
      status: confirmDialog.status,
    })
    setConfirmDialog({ open: false, collabId: null, status: null })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <BrutalTag label="Accepted" color="bg-[#BAFCA2]" />
      case 'declined':
        return <BrutalTag label="Declined" color="bg-[#FFABAB]" />
      case 'pending':
        return <BrutalTag label="Pending" color="bg-[#FFD93D]" />
      default:
        return <BrutalTag label={status} />
    }
  }

  const filteredCollaborations = collaborations.filter((collab) => {
    if (filter === 'all') return true
    return collab.status === filter
  })

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-6xl font-black text-black uppercase leading-none mb-4">Collaborations</h1>
          <p className="text-xl font-bold text-black/60 border-l-[4px] border-[#90E8FF] pl-4 max-w-2xl">
            Manage requests, seal deals, and track your brand partnerships.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          {[
            { id: 'all', label: 'All', count: collaborations.length },
            { id: 'pending', label: 'Pending', count: collaborations.filter((c) => c.status === 'pending').length },
            { id: 'accepted', label: 'Accepted', count: collaborations.filter((c) => c.status === 'accepted').length },
            { id: 'declined', label: 'Declined', count: collaborations.filter((c) => c.status === 'declined').length },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-5 py-2 font-black uppercase tracking-wider border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-translate-y-1 ${
                filter === tab.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <BrutalLoader size="lg" tone="influencer" label="Loading collaborations" />
          </div>
        ) : filteredCollaborations.length === 0 ? (
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
            <div className="w-20 h-20 bg-[#FDFBF7] border-[3px] border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
              <MessageSquare className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">No Collaborations Found</h3>
            <p className="font-bold text-black/60 uppercase tracking-wide max-w-md mx-auto">
              {filter === 'all'
                ? "You haven't received any collaboration requests yet."
                : `No ${filter} collaborations found.`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <AnimatePresence>
              {filteredCollaborations.map((collab) => (
                <motion.div
                  key={collab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <BrutalCard className="h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6 gap-3">
                      <div>
                        <h3 className="text-2xl font-black uppercase leading-tight">
                          {collab.brand?.brandProfile?.companyName || collab.brand?.name || 'Brand'}
                        </h3>
                        <p className="text-xs font-bold text-black/50 uppercase tracking-widest mt-1">
                          Received {new Date(collab.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(collab.status)}
                    </div>

                    <div className="mb-6 flex-grow">
                      <p className="text-lg font-medium leading-relaxed border-l-[2px] border-black pl-4 py-1 mb-4 bg-gray-50">
                        {`"${collab.message}"`}
                      </p>

                      {collab.proposalDetails ? (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {collab.proposalDetails.budget ? (
                            <div className="border-[2px] border-black p-3 bg-[#FFD93D]/20">
                              <p className="text-xs font-black uppercase">Budget</p>
                              <p className="text-xl font-bold">Rs. {collab.proposalDetails.budget.toLocaleString()}</p>
                            </div>
                          ) : null}
                          {collab.proposalDetails.timeline ? (
                            <div className="border-[2px] border-black p-3 bg-[#90E8FF]/20">
                              <p className="text-xs font-black uppercase">Timeline</p>
                              <p className="text-xl font-bold">{collab.proposalDetails.timeline}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-3 mt-auto pt-6 border-t-[2px] border-black border-dashed">
                      {collab.status === 'pending' ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(collab.id, 'accepted')}
                            disabled={updateStatusMutation.isPending}
                            className="flex-1 bg-[#BAFCA2] border-[2px] border-black font-black uppercase py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(collab.id, 'declined')}
                            disabled={updateStatusMutation.isPending}
                            className="flex-1 bg-[#FFABAB] border-[2px] border-black font-black uppercase py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" /> Decline
                          </button>
                        </div>
                      ) : null}

                      {collab.proposalDetails?.productId ? (
                        <Link
                          href={`/marketplace/${collab.proposalDetails.productId}`}
                          className="block w-full text-center bg-black text-white border-[2px] border-black font-black uppercase py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          View Product Details <ArrowRight className="inline w-4 h-4 ml-1" />
                        </Link>
                      ) : null}
                    </div>
                  </BrutalCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, collabId: null, status: null })}>
          <DialogContent className="overflow-hidden rounded-[24px] border-[3px] border-black bg-white p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:max-w-[460px]">
            <DialogHeader className="border-b-[3px] border-black bg-[#FDFBF7] px-5 py-5 sm:px-6">
              <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase sm:text-2xl">
                {confirmDialog.status === 'accepted' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                Confirm {confirmDialog.status === 'accepted' ? 'Acceptance' : 'Decline'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-semibold leading-relaxed text-black/70">
                Are you sure you want to {confirmDialog.status === 'accepted' ? 'accept' : 'decline'} this collaboration?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 px-5 py-5 sm:px-6">
              <button
                type="button"
                onClick={() => setConfirmDialog({ open: false, collabId: null, status: null })}
                className="px-4 py-2 bg-white border-[2px] border-black font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                className={`px-4 py-2 border-[2px] border-black font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none text-black ${
                  confirmDialog.status === 'accepted' ? 'bg-[#BAFCA2]' : 'bg-[#FFABAB]'
                }`}
              >
                {confirmDialog.status === 'accepted' ? 'Yes, Accept' : 'Yes, Decline'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
