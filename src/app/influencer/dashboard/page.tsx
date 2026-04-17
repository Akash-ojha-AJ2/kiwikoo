'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Camera,
  ShoppingBag,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star,
  X,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useGenerations, useProfileStats, useUser } from '@/lib/react-query/hooks'
import { ShareModal } from '@/components/tryon/ShareModal'
import { PortalModal } from '@/components/ui/PortalModal'
import { toast } from '@/lib/simple-sonner'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
}

export default function InfluencerDashboard() {
  const router = useRouter()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: profileStats, isLoading: statsLoading } = useProfileStats()
  const { data: generations, isLoading: generationsLoading } = useGenerations()

  // NOTE: hooks must be declared unconditionally (before any early returns)
  const [selectedGeneration, setSelectedGeneration] = useState<any>(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null)
  const [shareImageBase64, setShareImageBase64] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (user.role !== 'INFLUENCER') {
      router.replace('/brand/dashboard')
      return
    }

    if (!user.onboardingCompleted) {
      router.replace('/onboarding/influencer')
      return
    }

    if (user.approvalStatus === 'rejected') {
      router.replace('/onboarding/influencer?mode=resubmit')
      return
    }

    if (user.approvalStatus !== 'approved') {
      router.replace('/influencer/pending')
    }
  }, [router, user, userLoading])

  const isDashboardBootstrapping =
    userLoading ||
    !user ||
    user.role !== 'INFLUENCER' ||
    !user.onboardingCompleted ||
    user.approvalStatus !== 'approved'

  // Show loading while auth or approval state is still resolving
  if (isDashboardBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-peach border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal/60">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const completedGenerations = generations?.filter((g: any) => g.outputImagePath) || []
  const statsAreReady = !statsLoading && !!profileStats
  const dashboardStats = {
    generations: statsAreReady ? profileStats.generations : generationsLoading ? '...' : completedGenerations.length,
    portfolioItems: statsAreReady ? profileStats.portfolioItems : '...',
    collaborations: statsAreReady ? profileStats.collaborations : '...',
    level: statsAreReady ? profileStats.level : '...',
  }

  // Stats data
  const stats = [
    { label: 'Try-Ons Generated', value: dashboardStats.generations, icon: Sparkles, color: 'bg-peach/20 text-peach' },
    { label: 'Portfolio Items', value: dashboardStats.portfolioItems, icon: Camera, color: 'bg-blue-100 text-blue-600' },
    { label: 'Collaborations', value: dashboardStats.collaborations, icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Creator Level', value: dashboardStats.level, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ]

  // Quick Actions
  const quickActions = [
    {
      title: 'Try-On Studio',
      description: 'Create stunning virtual try-ons with AI',
      icon: Camera,
      href: '/influencer/try-on',
    },
    {
      title: 'Browse Marketplace',
      description: 'Discover products from top brands',
      icon: ShoppingBag,
      href: '/marketplace',
    },
    {
      title: 'View Portfolio',
      description: 'Manage your creative portfolio',
      icon: Star,
      href: '/profile',
    },
    {
      title: 'Collaborations',
      description: 'Check brand collaboration requests',
      icon: Users,
      href: '/influencer/collaborations',
    },
  ]

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tria-generation-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Image downloaded!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  const handleShare = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Failed to load image')
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        setShareImageBase64(reader.result as string)
        setShareImageUrl(imageUrl)
        setShareModalOpen(true)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      toast.error('Failed to prepare image for sharing')
    }
  }

  // Get all variants for a generation (main + variants if available) 
  const getGenerationVariants = (generation: any) => {
    const variants: { url: string; label: string }[] = []
    const mainUrl = generation.outputImagePath

    if (!mainUrl) return [{ url: '', label: 'Result' }]

    // Check if the URL follows the variant pattern (_vA.png, _vB.png, _vC.png)
    // Storage pattern: .../{jobId}_vA.png, .../{jobId}_vB.png, .../{jobId}_vC.png
    if (mainUrl.includes('_vA.')) {
      // This is variant A - derive B and C
      const baseUrl = mainUrl.replace('_vA.', '_vX.')
      variants.push({ url: mainUrl, label: 'Option 1' })
      variants.push({ url: baseUrl.replace('_vX.', '_vB.'), label: 'Option 2' })
      variants.push({ url: baseUrl.replace('_vX.', '_vC.'), label: 'Option 3' })
    } else if (mainUrl.includes('_vB.')) {
      const baseUrl = mainUrl.replace('_vB.', '_vX.')
      variants.push({ url: baseUrl.replace('_vX.', '_vA.'), label: 'Option 1' })
      variants.push({ url: mainUrl, label: 'Option 2' })
      variants.push({ url: baseUrl.replace('_vX.', '_vC.'), label: 'Option 3' })
    } else if (mainUrl.includes('_vC.')) {
      const baseUrl = mainUrl.replace('_vC.', '_vX.')
      variants.push({ url: baseUrl.replace('_vX.', '_vA.'), label: 'Option 1' })
      variants.push({ url: baseUrl.replace('_vX.', '_vB.'), label: 'Option 2' })
      variants.push({ url: mainUrl, label: 'Option 3' })
    } else {
      // Not a variant pattern - just show the single image
      variants.push({ url: mainUrl, label: 'Result' })

      // Check for variants in settings.variants (legacy support)
      const settings = generation.settings as any
      if (settings?.variants && Array.isArray(settings.variants)) {
        settings.variants.forEach((v: any) => {
          const variantUrl = v.imageUrl || v.outputImagePath || v.url
          if (variantUrl && variantUrl !== mainUrl) {
            variants.push({ url: variantUrl, label: `Option ${variants.length + 1}` })
          }
        })
      }
    }

    return variants
  }

  const openVariantViewer = (generation: any) => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      router.push('/influencer/generations')
      return
    }

    setSelectedGeneration(generation)
    setSelectedVariantIndex(0)
  }

  const closeVariantViewer = () => {
    setSelectedGeneration(null)
    setSelectedVariantIndex(0)
  }

  const navigateVariant = (direction: 'prev' | 'next') => {
    if (!selectedGeneration) return
    const variants = getGenerationVariants(selectedGeneration)
    if (direction === 'prev') {
      setSelectedVariantIndex((prev) => (prev > 0 ? prev - 1 : variants.length - 1))
    } else {
      setSelectedVariantIndex((prev) => (prev < variants.length - 1 ? prev + 1 : 0))
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] pt-20 sm:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mb-10 sm:mb-12 border-b-[3px] border-black pb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="w-full text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-3 tracking-tight">
                Welcome Back, <span className="text-black/70">{user?.name || 'Creator'}</span>
              </h1>
              <p className="text-base sm:text-lg text-black font-medium">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            // Neo-Brutal colors for stats
            const bgColors = ['bg-[#FFD93D]', 'bg-[#FF8C69]', 'bg-[#B4F056]', 'bg-[#6EC1E4]']
            const bgColor = bgColors[index % bgColors.length]

            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-xl p-6 sm:p-8 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 relative overflow-hidden group`}
              >
                <div className={`w-12 h-12 rounded-lg ${bgColor} border-[2px] border-black flex items-center justify-center mb-6`}>
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <p className="text-4xl sm:text-5xl font-bold text-black mb-2 tracking-tight">{stat.value}</p>
                <p className="text-sm text-black font-bold uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden sm:block mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 uppercase tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.href}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={action.href}
                    className="group relative block overflow-hidden rounded-xl p-5 sm:p-6 transition-all duration-300 h-full border-[3px] border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border-[2px] border-black flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-1">{action.title}</h3>
                    <p className="text-xs sm:text-sm font-medium opacity-80 line-clamp-2">
                      {action.description}
                    </p>
                    <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 sm:w-5 sm:h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Generations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black uppercase tracking-tight">Recent Creations</h2>
            <Link
              href="/influencer/generations"
              className="text-sm font-bold text-black hover:underline flex items-center gap-1.5 transition-colors group px-4 py-2 rounded-lg border-[2px] border-transparent hover:border-black hover:bg-white"
            >
              View gallery
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {completedGenerations.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {completedGenerations.slice(0, 4).map((job: any) => (
                <motion.div
                  key={job.id}
                  variants={cardVariants}
                  whileHover={{ y: -6 }}
                  className="group bg-white rounded-xl overflow-hidden border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => openVariantViewer(job)}
                >
                  {/* Image Container */}
                  <div className="aspect-[3/4] overflow-hidden relative bg-gray-100 border-b-[3px] border-black">
                    <motion.img
                      src={job.outputImagePath}
                      alt={`Generation ${job.id.slice(0, 8)}`}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    />

                    {/* View Label */}
                    {/* View Label */}
                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="bg-black text-white font-bold text-sm px-4 py-2 rounded-lg border-[2px] border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">View Result</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 sm:p-5 flex items-center justify-between bg-white">
                    <div>
                      <p className="text-xs font-mono font-bold text-black/60 mb-1">
                        #{job.id.slice(0, 6)}
                      </p>
                      <p className="text-sm font-bold text-black">
                        {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    {/* Status Dot */}
                    <div className={`w-3 h-3 rounded-none border border-black ${job.status?.toLowerCase() === 'completed' || job.status?.toLowerCase() === 'complete' ? 'bg-[#98FB98]' : 'bg-[#FFE4B5]'}`} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#FFD93D] rounded-lg border-[3px] border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2 uppercase">Build your portfolio</h3>
              <p className="text-black font-medium mb-8">Create your first virtual try-on to start seeing results here.</p>
              <Link
                href="/influencer/try-on"
                className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-none font-bold hover:bg-[#B4F056] hover:text-black border-[3px] border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <Camera className="w-5 h-5" />
                Start Creating
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Variant Viewer Modal - Moved to Portal */}
      <PortalModal isOpen={!!selectedGeneration} onClose={closeVariantViewer}>
        {selectedGeneration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/85 p-2 backdrop-blur-md sm:p-4"
            onClick={closeVariantViewer}
          >
            <div className="relative flex h-[min(92dvh,960px)] w-full max-w-[min(96vw,1240px)] flex-col overflow-hidden rounded-[28px] border-[3px] border-black bg-[#171717] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <motion.button
                onClick={closeVariantViewer}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 left-4 z-[10000] flex items-center gap-2 rounded-xl border-[3px] border-black bg-white px-4 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="sr-only">Back</span>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-[200] flex items-center justify-between border-b border-white/10 bg-[#111111] px-4 py-4 sm:px-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    onClick={closeVariantViewer}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-lg border-[2px] border-black bg-white px-4 py-2.5 text-sm font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>
                  <motion.button
                    onClick={() => handleDownload(getGenerationVariants(selectedGeneration)[selectedVariantIndex]?.url)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-lg border-[2px] border-black bg-white px-4 py-2.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                  <motion.button
                    onClick={() => handleShare(getGenerationVariants(selectedGeneration)[selectedVariantIndex]?.url)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 rounded-lg border-[2px] border-black bg-[#FF8C69] px-4 py-2.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                </div>

                <div className="text-center">
                  <span className="text-xs font-mono text-white/60">Generation</span>
                  <p className="text-sm font-mono text-white">#{selectedGeneration.id.slice(0, 8)}</p>
                </div>

                <motion.button
                  onClick={closeVariantViewer}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="rounded-lg border-[2px] border-black bg-white p-2.5 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>

              <div className="relative z-[100] flex min-h-0 flex-1 p-2 sm:p-4" onClick={(e) => e.stopPropagation()}>
                {getGenerationVariants(selectedGeneration).length > 1 && (
                  <>
                    <motion.button
                      onClick={() => navigateVariant('prev')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-[2px] border-black bg-white p-3 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:left-8"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      onClick={() => navigateVariant('next')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-[2px] border-black bg-white p-3 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:right-8"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                  </>
                )}

                <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_rgba(255,255,255,0.04)_38%,_rgba(0,0,0,0.22)_100%)] px-4 py-5 sm:px-10 sm:py-8">
                  <motion.img
                    key={selectedVariantIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    src={getGenerationVariants(selectedGeneration)[selectedVariantIndex]?.url}
                    alt="Generated image"
                    className="block h-auto max-h-full w-auto max-w-full rounded-[20px] border-[3px] border-black/70 object-contain shadow-[0_20px_40px_rgba(0,0,0,0.38)]"
                    draggable={false}
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </PortalModal>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false)
          setShareImageUrl(null)
          setShareImageBase64(undefined)
        }}
        imageUrl={shareImageUrl || ''}
        imageBase64={shareImageBase64}
      />
    </div>
  )
}

