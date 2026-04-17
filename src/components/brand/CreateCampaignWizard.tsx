'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/simple-sonner'
import {
  Target,
  Users,
  Image,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { useCreateCampaign } from '@/lib/hooks/useCampaigns'
import { useProducts } from '@/lib/hooks/useProducts'
import type { CampaignCreateInput, CampaignGoal, BudgetType } from '@/lib/campaigns/types'

const STEPS = [
  { id: 1, title: 'Goal', icon: Target },
  { id: 2, title: 'Audience', icon: Users },
  { id: 3, title: 'Creative', icon: Image },
  { id: 4, title: 'Budget', icon: Wallet },
  { id: 5, title: 'Review', icon: CheckCircle2 },
] as const

const GOALS: { value: CampaignGoal; label: string }[] = [
  { value: 'sales', label: 'Sales' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'launch', label: 'Launch' },
  { value: 'traffic', label: 'Traffic' },
]

const GENDERS = ['Any', 'Male', 'Female', 'Non-binary', 'Other']

const defaultForm = {
  goal: 'awareness' as CampaignGoal,
  title: '',
  audience: {
    age_min: undefined as number | undefined,
    age_max: undefined as number | undefined,
    gender: '',
    location: '',
    interests: [] as string[],
  },
  creative: {
    product_id: '',
    headline: '',
    description: '',
    cta_text: 'Shop Now',
    creative_assets: [] as string[],
  },
  budget: {
    budget_type: 'daily' as BudgetType,
    daily_budget: undefined as number | undefined,
    total_budget: undefined as number | undefined,
    start_date: '',
    end_date: '',
  },
}

export default function CreateCampaignWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(defaultForm)
  const [interestsInput, setInterestsInput] = useState('')
  const [assetsInput, setAssetsInput] = useState('')

  const { data: products = [], isLoading: productsLoading } = useProducts()
  const createCampaign = useCreateCampaign()

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateAudience = (key: keyof typeof form.audience, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      audience: { ...prev.audience, [key]: value },
    }))
  }

  const updateCreative = (key: keyof typeof form.creative, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      creative: { ...prev.creative, [key]: value },
    }))
  }

  const updateBudget = (key: keyof typeof form.budget, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      budget: { ...prev.budget, [key]: value },
    }))
  }

  const addInterests = () => {
    const list = interestsInput
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (list.length) {
      updateAudience('interests', [...form.audience.interests, ...list])
      setInterestsInput('')
    }
  }

  const removeInterest = (index: number) => {
    updateAudience(
      'interests',
      form.audience.interests.filter((_, i) => i !== index)
    )
  }

  const setCreativeAssetsFromInput = () => {
    const urls = assetsInput
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    updateCreative('creative_assets', urls)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Campaign title is required')
      return
    }
    const payload: CampaignCreateInput = {
      goal: form.goal,
      title: form.title.trim(),
      audience: {
        age_min: form.audience.age_min,
        age_max: form.audience.age_max,
        gender: form.audience.gender || undefined,
        location: form.audience.location.trim() || undefined,
        interests: form.audience.interests.length ? form.audience.interests : undefined,
      },
      creative: {
        product_id: form.creative.product_id || undefined,
        headline: form.creative.headline.trim() || undefined,
        description: form.creative.description.trim() || undefined,
        cta_text: form.creative.cta_text.trim() || undefined,
        creative_assets: form.creative.creative_assets.length ? form.creative.creative_assets : undefined,
      },
      budget: {
        budget_type: form.budget.budget_type,
        daily_budget: form.budget.daily_budget,
        total_budget: form.budget.total_budget,
        start_date: form.budget.start_date || undefined,
        end_date: form.budget.end_date || undefined,
      },
    }
    try {
      await createCampaign.mutateAsync(payload)
      toast.success('Campaign created')
      router.push('/brand/campaigns')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create campaign')
    }
  }

  const canNext =
    (step === 1 && form.title.trim()) ||
    step === 2 ||
    step === 3 ||
    step === 4 ||
    step === 5

  const goNext = () => {
    if (step === 3) {
      const urls = assetsInput
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      updateCreative('creative_assets', urls)
    }
    setStep((s) => s + 1)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <div className="mb-8">
        <Link
          href="/brand/campaigns"
          className="text-sm font-bold uppercase tracking-wider text-black/60 hover:text-black"
        >
          Back to campaigns
        </Link>
        <h1 className="text-3xl font-black text-black mt-2">Create campaign</h1>
        <p className="text-black/60 font-medium mt-1">Set goal, audience, creative, and budget.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-[3px] border-black p-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon
          const active = step === s.id
          const done = step > s.id
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 px-3 py-2 font-black text-xs uppercase shrink-0 ${
                active ? 'bg-[#FFD93D]' : done ? 'bg-[#B4F056]' : 'bg-gray-100'
              } border-2 border-black`}
            >
              <StepIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          )
        })}
      </div>

      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Campaign title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                placeholder="e.g. Summer Sale 2024"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-3">
                Goal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => updateForm('goal', g.value)}
                    className={`px-4 py-3 border-2 border-black font-bold uppercase text-sm text-left transition-all ${
                      form.goal === g.value
                        ? 'bg-[#B4F056] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Age min
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.audience.age_min ?? ''}
                  onChange={(e) =>
                    updateAudience('age_min', e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Age max
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.audience.age_max ?? ''}
                  onChange={(e) =>
                    updateAudience('age_max', e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                  placeholder="65"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                value={form.audience.gender}
                onChange={(e) => updateAudience('gender', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-bold bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g === 'Any' ? '' : g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                value={form.audience.location}
                onChange={(e) => updateAudience('location', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                placeholder="e.g. India, Mumbai"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Interests (add one or comma-separated)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterests())}
                  className="flex-1 px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                  placeholder="Fashion, Sports"
                />
                <button
                  type="button"
                  onClick={addInterests}
                  className="w-full sm:w-auto px-4 py-3 bg-black text-white font-black uppercase text-sm border-2 border-black"
                >
                  Add
                </button>
              </div>
              {form.audience.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.audience.interests.map((interest, i) => (
                    <span
                      key={`${interest}-${i}`}
                      className="inline-flex items-center gap-1 bg-[#FFD93D] border-2 border-black px-2 py-1 text-sm font-bold"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(i)}
                        className="hover:bg-black/10 rounded"
                        aria-label="Remove"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Creative */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Product (optional)
              </label>
              <select
                value={form.creative.product_id}
                onChange={(e) => updateCreative('product_id', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-bold bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
              >
                <option value="">None</option>
                {productsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.price != null ? `(Rs. ${p.price})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Headline
              </label>
              <input
                type="text"
                value={form.creative.headline}
                onChange={(e) => updateCreative('headline', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                placeholder="Catchy headline for your ad"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={form.creative.description}
                onChange={(e) => updateCreative('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none resize-none"
                placeholder="Ad copy or short description"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                CTA button text
              </label>
              <input
                type="text"
                value={form.creative.cta_text}
                onChange={(e) => updateCreative('cta_text', e.target.value)}
                className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Image or video URLs (one per line)
              </label>
              <textarea
                value={assetsInput}
                onChange={(e) => setAssetsInput(e.target.value)}
                onBlur={setCreativeAssetsFromInput}
                rows={3}
                className="w-full px-4 py-3 border-2 border-black font-medium focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none resize-none"
                placeholder="https://..."
              />
              {form.creative.creative_assets.length > 0 && (
                <p className="text-xs text-black/60 mt-1">
                  {form.creative.creative_assets.length} asset(s) added
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-3">
                Budget type
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => updateBudget('budget_type', 'daily')}
                  className={`px-4 py-3 border-2 border-black font-bold uppercase text-sm ${
                    form.budget.budget_type === 'daily'
                      ? 'bg-[#B4F056] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => updateBudget('budget_type', 'lifetime')}
                  className={`px-4 py-3 border-2 border-black font-bold uppercase text-sm ${
                    form.budget.budget_type === 'lifetime'
                      ? 'bg-[#B4F056] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Lifetime
                </button>
              </div>
            </div>
            {form.budget.budget_type === 'daily' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Daily budget (Rs.)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={form.budget.daily_budget ?? ''}
                  onChange={(e) =>
                    updateBudget('daily_budget', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                  placeholder="500"
                />
              </div>
            )}
            {form.budget.budget_type === 'lifetime' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Total budget (Rs.)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={form.budget.total_budget ?? ''}
                  onChange={(e) =>
                    updateBudget('total_budget', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                  placeholder="10000"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Start date
                </label>
                <input
                  type="date"
                  value={form.budget.start_date}
                  onChange={(e) => updateBudget('start_date', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  End date
                </label>
                <input
                  type="date"
                  value={form.budget.end_date}
                  onChange={(e) => updateBudget('end_date', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-2 border-black p-4 bg-gray-50">
              <h3 className="text-sm font-black uppercase text-black/60 mb-3">Summary</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-bold text-black/60">Title</dt>
                  <dd className="font-black">{form.title || '-'}</dd>
                </div>
                <div>
                  <dt className="font-bold text-black/60">Goal</dt>
                  <dd className="font-black capitalize">{form.goal}</dd>
                </div>
                <div>
                  <dt className="font-bold text-black/60">Audience</dt>
                  <dd className="font-medium">
                    Age {form.audience.age_min ?? '-'}-{form.audience.age_max ?? '-'}
                    {form.audience.gender && ` | ${form.audience.gender}`}
                    {form.audience.location && ` | ${form.audience.location}`}
                    {form.audience.interests.length > 0 &&
                      ` | ${form.audience.interests.join(', ')}`}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-black/60">Creative</dt>
                  <dd className="font-medium">
                    {form.creative.product_id
                      ? products.find((p) => p.id === form.creative.product_id)?.name ?? 'Product'
                      : 'No product'}
                    {form.creative.headline && ` | "${form.creative.headline}"`}
                    {form.creative.creative_assets.length > 0 &&
                      ` | ${form.creative.creative_assets.length} asset(s)`}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-black/60">Budget</dt>
                  <dd className="font-medium">
                    {form.budget.budget_type === 'daily'
                      ? `Rs. ${form.budget.daily_budget ?? 0}/day`
                      : `Rs. ${form.budget.total_budget ?? 0} total`}
                    {form.budget.start_date && ` from ${form.budget.start_date}`}
                    {form.budget.end_date && ` to ${form.budget.end_date}`}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="text-sm text-black/60">
              Campaign will be created as draft. You can activate it from the campaigns list.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between mt-8 pt-6 border-t-2 border-black gap-3">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-3 border-2 border-black font-bold uppercase text-sm hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <Link
                href="/brand/campaigns"
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-3 border-2 border-black font-bold uppercase text-sm hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </Link>
            )}
          </div>
          <div>
            {step < 5 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canNext}
                className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-3 bg-[#B4F056] border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createCampaign.isPending}
                className="flex items-center gap-2 px-4 py-3 bg-[#B4F056] border-2 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCampaign.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    Launch campaign
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
