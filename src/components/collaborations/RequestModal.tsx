'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/lib/simple-sonner'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  influencerId?: string
  productId?: string
  brandName?: string
  productName?: string
  brandId?: string
}

export default function RequestModal({
  isOpen,
  onClose,
  influencerId,
  productId,
  brandName,
  productName,
  brandId,
}: RequestModalProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    budget: '',
    timeline: '',
    goals: '',
    notes: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Immediate visual feedback - show loading state instantly
    setLoading(true)

    try {
      // API route handles productId and fetches brandId server-side
      // No need for extra API call - this eliminates the 1-second delay!
      const response = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(influencerId && { influencerId }),
          ...(brandId && { brandId }),
          ...(productId && { productId }), // API will handle getting brandId from product
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          timeline: formData.timeline,
          goals: formData.goals.split(',').map((g) => g.trim()).filter(Boolean),
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send collaboration request')
      }

      // Immediate success feedback
      toast.success('Collaboration request sent!', {
        duration: 3000,
      })
      onClose()
      setFormData({
        budget: '',
        timeline: '',
        goals: '',
        notes: '',
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-black/60 p-3 py-[max(0.75rem,3vh)] backdrop-blur-sm sm:p-5"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="my-auto w-full max-w-[min(92vw,760px)]"
        >
      <Card className="w-full overflow-hidden rounded-[28px] border-[3px] border-black bg-[#FFFDF8] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="border-b-[3px] border-black bg-[#FFF4D9] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-wide text-black sm:text-2xl">Request Collaboration</CardTitle>
              <CardDescription className="mt-1 text-sm font-semibold text-black/70">
                {influencerId
                  ? `Send a collaboration request to this influencer`
                  : `Request collaboration for ${productName}`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 shrink-0 rounded-xl border-[2px] border-black bg-white hover:bg-[#FFD93D]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[min(72dvh,680px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {brandName && (
              <div>
                <Label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-black">Brand</Label>
                <Input value={brandName} disabled className="border-[2px] border-black bg-white/80" />
              </div>
            )}
            {productName && (
              <div>
                <Label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-black">Product</Label>
                <Input value={productName} disabled className="border-[2px] border-black bg-white/80" />
              </div>
            )}
            <div>
              <Label htmlFor="budget" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-black">Budget (INR)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="5000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="border-[2px] border-black bg-white"
              />
            </div>
            <div>
              <Label htmlFor="timeline" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-black">Timeline</Label>
              <Input
                id="timeline"
                placeholder="e.g., 2 weeks, 1 month"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="border-[2px] border-black bg-white"
              />
            </div>
            <div>
              <Label htmlFor="goals" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-black">Goals (comma-separated)</Label>
              <Input
                id="goals"
                placeholder="e.g., brand awareness, sales, engagement"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="border-[2px] border-black bg-white"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-black">Message</Label>
              <textarea
                id="notes"
                className="min-h-[120px] w-full rounded-xl border-[2px] border-black bg-white px-3 py-3 text-sm font-medium text-black outline-none transition focus:ring-2 focus:ring-black/10"
                placeholder="Tell the influencer about your collaboration proposal..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col-reverse justify-end gap-2 border-t-[2px] border-dashed border-black/25 pt-2 sm:flex-row sm:pt-3">
              <Button type="button" variant="outline" onClick={onClose} className="border-[2px] border-black">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="border-[2px] border-black bg-black text-white hover:bg-black/90">
                {loading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    ,
    document.body
  )
}
