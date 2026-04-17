'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/simple-sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

// Neo-Brutal Components
import { OnboardingCard } from '@/components/brutal/onboarding/OnboardingCard'
import { ChoiceChip } from '@/components/brutal/onboarding/ChoiceChip'
import { BrutalInput } from '@/components/brutal/onboarding/BrutalInput'
import { DecorativeShapes } from '@/components/brutal/onboarding/DecorativeShapes'

const BRAND_TYPE_OPTIONS = ['Fast Fashion', 'Luxury', 'Sustainable', 'Streetwear', 'Vintage', 'Athleisure', 'Minimalist', 'Bohemian']
const AUDIENCE_OPTIONS = ['Men', 'Women', 'Unisex', 'Kids']
const PRODUCT_TYPE_OPTIONS = ['Clothing', 'Accessories', 'Footwear', 'Beauty', 'Lifestyle', 'Jewelry']
const VERTICAL_OPTIONS = ['Fashion', 'Tech', 'Lifestyle', 'Sports', 'Entertainment', 'Other']
const BUDGET_RANGES = ['$0-1k', '$1k-5k', '$5k-10k', '$10k-25k', '$25k+']
const TOTAL_STEPS = 7

export default function BrandOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    brandType: '',
    targetAudience: [] as string[],
    productTypes: [] as string[],
    website: '',
    vertical: '',
    budgetRange: '',
  })

  // Load existing onboarding data from Supabase
  useEffect(() => {
    fetch('/api/onboarding/brand')
      .then((res) => res.json())
      .then((data) => {
        if (data.onboardingCompleted) {
          router.replace('/brand/dashboard')
        } else if (data.profile) {
          setFormData({
            companyName: data.profile.companyName || '',
            brandType: data.profile.brandType || '',
            targetAudience: (data.profile.targetAudience as string[]) || [],
            productTypes: (data.profile.productTypes as string[]) || [],
            website: data.profile.website ?? '',
            vertical: data.profile.vertical || '',
            budgetRange: data.profile.budgetRange || '',
          })
        }
      })
      .catch((err) => console.error('Error loading brand data:', err))
  }, [router])

  // Save progress to Supabase
  const saveProgress = async () => {
    try {
      await fetch('/api/onboarding/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      await saveProgress()
      setStep(step + 1)
    } else {
      await handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      if (data.onboardingCompleted) {
        toast.success('Brand profile ready! Choose your first action to get started.', {
          style: { background: '#B4F056', border: '2px solid black', color: 'black', fontWeight: 'bold' }
        })
        router.replace('/brand/dashboard?welcome=1')
      } else {
        toast.error('Please fill all required fields')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (field: 'targetAudience' | 'productTypes', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Company Name'
      case 2: return 'Brand Type'
      case 3: return 'Target Audience'
      case 4: return 'Product Types'
      case 5: return 'Website'
      case 6: return 'Industry Vertical'
      case 7: return 'Budget Range'
      default: return 'Setup'
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Company Name
        return (
          <div className="space-y-4">
            <BrutalInput
              label="What's your brand called?"
              placeholder="e.g. Acme Fashion Co."
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
        )

      case 2: // Brand Type
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BRAND_TYPE_OPTIONS.map((type) => (
              <ChoiceChip
                key={type}
                label={type}
                selected={formData.brandType === type}
                onClick={() => setFormData({ ...formData, brandType: type })}
              />
            ))}
          </div>
        )

      case 3: // Audience
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AUDIENCE_OPTIONS.map((audience) => (
              <ChoiceChip
                key={audience}
                label={audience}
                selected={formData.targetAudience.includes(audience)}
                onClick={() => toggleSelection('targetAudience', audience)}
                icon={audience === 'Men' ? 'M' : audience === 'Women' ? 'W' : audience === 'Kids' ? 'K' : 'U'}
              />
            ))}
          </div>
        )

      case 4: // Products
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRODUCT_TYPE_OPTIONS.map((type) => (
              <ChoiceChip
                key={type}
                label={type}
                selected={formData.productTypes.includes(type)}
                onClick={() => toggleSelection('productTypes', type)}
              />
            ))}
          </div>
        )

      case 5: // Website
        return (
          <BrutalInput
            label="Your brand's website"
            type="url"
            placeholder="https://yourbrand.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        )

      case 6: // Vertical
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VERTICAL_OPTIONS.map((v) => (
              <ChoiceChip
                key={v}
                label={v}
                selected={formData.vertical === v}
                onClick={() => setFormData({ ...formData, vertical: v })}
              />
            ))}
          </div>
        )

      case 7: // Budget
        return (
          <div className="space-y-4">
            <p className="text-sm text-black/60 font-medium mb-2">
              What&apos;s your typical budget for influencer collaborations?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUDGET_RANGES.map((range) => (
                <ChoiceChip
                  key={range}
                  label={range}
                  selected={formData.budgetRange === range}
                  onClick={() => setFormData({ ...formData, budgetRange: range })}
                  icon="$"
                />
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-[#1a1a1a] p-4 lg:p-8 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 opacity-50"
        style={{
          backgroundImage: "url('/assets/login-brand-background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a1a]/60 via-transparent to-black/70 z-[1]" />

      <DecorativeShapes />

      <div className="w-full max-w-2xl relative z-20 py-8 sm:py-12">
        <OnboardingCard
          title="Setup Brand Profile"
          step={step}
          totalSteps={TOTAL_STEPS}
          stepTitle={getStepTitle()}
        >
          <div className="mb-5 rounded-2xl border-[3px] border-black bg-[#EEF8D8] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-black">What happens next</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-black/70">
              Once this setup is done, we will send you straight into your brand dashboard so you can add a product or launch your first campaign.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-black/10 gap-3">
            <motion.button
              whileHover={{ scale: step === 1 ? 1 : 1.05 }}
              whileTap={{ scale: step === 1 ? 1 : 0.95 }}
              onClick={handleBack}
              disabled={step === 1}
              className={`
                px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-sm sm:text-base flex items-center gap-2 transition-all border-[3px]
                ${step === 1
                  ? 'opacity-0 pointer-events-none border-transparent'
                  : 'border-black/20 hover:border-black hover:bg-white text-black/60 hover:text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
                }
              `}
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={3} />
              Back
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              disabled={loading}
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 bg-[#B4F056] border-[3px] border-black rounded-xl font-black text-sm sm:text-base text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : step === TOTAL_STEPS ? (
                <>
                  Launch Portal
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" strokeWidth={3} />
                </>
              )}
            </motion.button>
          </div>
        </OnboardingCard>
      </div>
    </div>
  )
}
