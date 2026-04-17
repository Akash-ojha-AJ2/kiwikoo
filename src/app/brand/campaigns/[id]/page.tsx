'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useRef, useCallback, useEffect } from 'react'
import {
    ArrowLeft, Download, Edit3, Save, X, Loader2, Trash2, Target, Users,
    DollarSign, Sparkles, FileText, Megaphone, BarChart3, Zap, Layers,
    Send, ChevronDown, ChevronUp, Star, Play,
} from 'lucide-react'
import { toast } from '@/lib/simple-sonner'
import { useCampaign, useUpdateCampaign, useDeleteCampaign } from '@/lib/hooks/useCampaigns'

/* ━━━━━━━━━━━━━ TYPES ━━━━━━━━━━━━━ */
interface ContentAngle { angle: string; score: number; example: string; format: string; funnel_stage: string; why_it_works: string }
interface HookItem { text: string; category: string; platform: string }
interface ScriptItem { title: string; body: string; platform: string; duration: string; framework: string; score: number }
interface ABVariant { label: string; description: string; what_it_tests: string }

/* ━━━━━━━━━━━━━ HELPER — safely extract typed arrays ━━━━━━━━━━━━━ */
function extractAngles(raw: unknown): ContentAngle[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item: unknown) => {
        if (typeof item === 'string') return { angle: item, score: 0, example: '', format: '', funnel_stage: '', why_it_works: '' }
        const o = item as Record<string, unknown>
        return {
            angle: String(o.angle ?? ''), score: Number(o.score ?? 0),
            example: String(o.example ?? ''), format: String(o.format ?? ''),
            funnel_stage: String(o.funnel_stage ?? ''), why_it_works: String(o.why_it_works ?? ''),
        }
    })
}

function extractHooks(raw: unknown): HookItem[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item: unknown) => {
        if (typeof item === 'string') return { text: item, category: '', platform: '' }
        const o = item as Record<string, unknown>
        return { text: String(o.text ?? ''), category: String(o.category ?? ''), platform: String(o.platform ?? '') }
    })
}

function extractScripts(raw: unknown): ScriptItem[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item: unknown) => {
        if (typeof item === 'string') return { title: '', body: item, platform: '', duration: '', framework: '', score: 0 }
        const o = item as Record<string, unknown>
        return {
            title: String(o.title ?? ''), body: String(o.body ?? ''),
            platform: String(o.platform ?? ''), duration: String(o.duration ?? ''),
            framework: String(o.framework ?? ''), score: Number(o.score ?? 0),
        }
    })
}

function extractABVariants(raw: unknown): ABVariant[] {
    if (!Array.isArray(raw)) return []
    return raw.map((item: unknown) => {
        if (typeof item === 'string') return { label: '', description: item, what_it_tests: '' }
        const o = item as Record<string, unknown>
        return { label: String(o.label ?? ''), description: String(o.description ?? ''), what_it_tests: String(o.what_it_tests ?? '') }
    })
}

function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function normalizeFunnelStageClass(value: string): 'tofu' | 'mofu' | 'bofu' | 'default' {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'tofu' || normalized === 'mofu' || normalized === 'bofu') {
        return normalized
    }
    return 'default'
}

/* ━━━━━━━━━━━━━ PDF GENERATION ━━━━━━━━━━━━━ */
function generatePdfHtml(campaign: Record<string, unknown>): string {
    const strategy = (campaign.strategy ?? {}) as Record<string, unknown>
    const audience = (campaign.audience ?? {}) as Record<string, unknown>
    const creative = (campaign.creative ?? {}) as Record<string, unknown>
    const angles = extractAngles(strategy.content_angles)
    const hooks = extractHooks((creative as Record<string, unknown>).hooks ?? strategy.hooks)
    const scripts = extractScripts((creative as Record<string, unknown>).scripts ?? strategy.scripts)
    const platforms: string[] = Array.isArray(strategy.recommended_platforms) ? (strategy.recommended_platforms as string[]).map(String) : []
    const abVariants = extractABVariants(strategy.ab_variants)
    const funnelRaw = (typeof strategy.funnel === 'object' && strategy.funnel !== null ? strategy.funnel : {}) as Record<string, unknown>
    const funnel = {
        awareness: typeof funnelRaw.awareness === 'string' ? funnelRaw.awareness : '',
        consideration: typeof funnelRaw.consideration === 'string' ? funnelRaw.consideration : '',
        conversion: typeof funnelRaw.conversion === 'string' ? funnelRaw.conversion : '',
    }
    const date = campaign.created_at
        ? new Date(campaign.created_at as string).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—'

    // Audience data
    const ageMin = typeof audience.age_min === 'number' ? audience.age_min : null
    const ageMax = typeof audience.age_max === 'number' ? audience.age_max : null
    const gender = typeof audience.gender === 'string' ? audience.gender : ''
    const location = typeof audience.location === 'string' ? audience.location : ''
    const interests: string[] = Array.isArray(audience.interests) ? (audience.interests as string[]).map(String) : []

    // Creative data
    const headline = typeof creative.headline === 'string' ? creative.headline : ''
    const description = typeof creative.description === 'string' ? creative.description : ''
    const ctaText = typeof creative.cta_text === 'string' ? creative.cta_text : ''

    // Budget
    const budget = typeof campaign.budget === 'number' ? campaign.budget : (typeof campaign.budget === 'string' ? Number(campaign.budget) : 0)

    const scoreColor = (s: number) => s >= 8 ? '#4CAF50' : s >= 6 ? '#FF9800' : s >= 4 ? '#FF5722' : '#F44336'

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${escapeHtml(campaign.title || 'Campaign Strategy')} — Kiwikoo</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; padding: 40px; max-width: 820px; margin: 0 auto; font-size: 13px; line-height: 1.6; }
  @media print { body { padding: 20px; } .no-break { page-break-inside: avoid; } }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 16px; margin-bottom: 8px; }
  .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
  .logo-accent { color: #B4F056; }
  .meta { text-align: right; }
  .meta-date { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .meta-status { display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; background: #FFD93D; padding: 2px 10px; border-radius: 4px; margin-top: 4px; letter-spacing: 0.5px; }

  /* Title block */
  .title-block { margin-bottom: 24px; }
  .campaign-title { font-size: 22px; font-weight: 900; line-height: 1.2; margin-bottom: 8px; }
  .brief { font-size: 13px; color: #555; line-height: 1.7; }
  .badges { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  .badge { display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 10px; border: 1.5px solid #111; border-radius: 4px; }
  .badge-green { background: #B4F056; }
  .badge-yellow { background: #FFD93D; }

  /* Sections */
  .section { margin-bottom: 28px; }
  .section-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; gap: 8px; }
  .section-icon { width: 16px; height: 16px; }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

  /* Cards */
  .card { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; padding: 14px; }
  .card-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 3px; }
  .card-value { font-size: 14px; font-weight: 700; }
  .card-sub { font-size: 11px; color: #777; margin-top: 2px; }

  /* Angle cards */
  .angle-card { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 10px; padding: 14px; margin-bottom: 10px; }
  .angle-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .angle-name { font-size: 14px; font-weight: 700; }
  .angle-score { font-size: 12px; font-weight: 900; padding: 2px 8px; border-radius: 4px; color: #fff; }
  .angle-meta { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .angle-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: #f0f0f0; color: #555; }
  .angle-tag-tofu { background: #B4F05630; color: #4a8f10; }
  .angle-tag-mofu { background: #FFD93D30; color: #8a6d00; }
  .angle-tag-bofu { background: #FF6B6B30; color: #cc3333; }
  .angle-example { font-size: 12px; color: #666; margin-top: 6px; font-style: italic; }
  .angle-why { font-size: 11px; color: #888; margin-top: 4px; }

  /* Hooks */
  .hook-item { padding: 8px 12px; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
  .hook-text { font-size: 13px; font-weight: 600; flex: 1; }
  .hook-meta { display: flex; gap: 6px; margin-left: 12px; }

  /* Script blocks */
  .script-card { border: 1px solid #e8e8e8; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
  .script-header { background: #fafafa; padding: 12px 14px; border-bottom: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; }
  .script-title { font-size: 14px; font-weight: 700; }
  .script-meta { display: flex; gap: 6px; }
  .script-body { padding: 14px; font-size: 12px; line-height: 1.7; white-space: pre-wrap; color: #444; }

  /* Funnel */
  .funnel-step { padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; line-height: 1.6; }
  .funnel-awareness { background: #B4F05615; border-left: 4px solid #B4F056; }
  .funnel-consideration { background: #FFD93D15; border-left: 4px solid #FFD93D; }
  .funnel-conversion { background: #FF6B6B15; border-left: 4px solid #FF6B6B; }
  .funnel-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }

  /* AB variants */
  .ab-card { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; }
  .ab-label { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .ab-desc { font-size: 12px; color: #555; }
  .ab-test { font-size: 11px; color: #888; margin-top: 4px; font-style: italic; }

  /* Creative */
  .creative-block { background: linear-gradient(135deg, #f8f9fa 0%, #f0f1f2 100%); border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; }
  .creative-headline { font-size: 18px; font-weight: 900; margin-bottom: 8px; }
  .creative-desc { font-size: 13px; color: #555; line-height: 1.7; margin-bottom: 12px; }
  .creative-cta { display: inline-block; background: #B4F056; font-size: 12px; font-weight: 800; padding: 8px 20px; border-radius: 6px; border: 2px solid #111; }

  .footer { margin-top: 40px; border-top: 2px solid #eee; padding-top: 16px; text-align: center; font-size: 10px; color: #aaa; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
</style></head><body>

  <!-- Header -->
  <div class="header">
    <div class="logo">kiwi<span class="logo-accent">koo</span></div>
    <div class="meta">
      <div class="meta-date">${escapeHtml(date)}</div>
      <div><span class="meta-status">${escapeHtml(campaign.status || 'Draft')}</span></div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-block">
    <h1 class="campaign-title">${escapeHtml(campaign.title || 'Untitled Campaign')}</h1>
    ${campaign.brief ? `<p class="brief">${escapeHtml(campaign.brief)}</p>` : ''}
    <div class="badges">
      ${campaign.goal ? `<span class="badge badge-green">${escapeHtml(campaign.goal)}</span>` : ''}
      ${budget > 0 ? `<span class="badge">₹${budget.toLocaleString('en-IN')}</span>` : ''}
      ${platforms.map(p => `<span class="badge">${escapeHtml(p)}</span>`).join('')}
    </div>
  </div>

  <!-- Positioning -->
  ${typeof strategy.positioning === 'string' && strategy.positioning ? `
  <div class="section no-break">
    <div class="section-title">🎯 Positioning & Messaging</div>
    <p style="font-size: 14px; font-weight: 600; line-height: 1.7; color: #333;">${escapeHtml(strategy.positioning)}</p>
  </div>` : ''}

  <!-- Target Audience -->
  ${(ageMin || gender || location || interests.length > 0) ? `
  <div class="section no-break">
    <div class="section-title">👥 Target Audience</div>
    <div class="grid-2">
      ${(ageMin != null && ageMax != null) ? `<div class="card"><div class="card-label">Age Range</div><div class="card-value">${ageMin}–${ageMax}</div></div>` : ''}
      ${gender ? `<div class="card"><div class="card-label">Gender</div><div class="card-value">${escapeHtml(gender)}</div></div>` : ''}
      ${location ? `<div class="card"><div class="card-label">Location</div><div class="card-value">${escapeHtml(location)}</div></div>` : ''}
      ${interests.length > 0 ? `<div class="card"><div class="card-label">Interests</div><div class="card-value">${escapeHtml(interests.join(', '))}</div></div>` : ''}
    </div>
  </div>` : ''}

  <!-- Content Angles -->
  ${angles.length > 0 ? `
  <div class="section">
    <div class="section-title">💡 Content Angles (${angles.length})</div>
    ${angles.map(a => `<div class="angle-card no-break">
      <div class="angle-header">
        <span class="angle-name">${escapeHtml(a.angle)}</span>
        <span class="angle-score" style="background:${scoreColor(a.score)}">${a.score}/10</span>
      </div>
      ${a.example ? `<div class="angle-example">"${escapeHtml(a.example)}"</div>` : ''}
      ${a.why_it_works ? `<div class="angle-why">↳ ${escapeHtml(a.why_it_works)}</div>` : ''}
      <div class="angle-meta">
        ${a.format ? `<span class="angle-tag">${escapeHtml(a.format)}</span>` : ''}
        ${a.funnel_stage ? `<span class="angle-tag angle-tag-${normalizeFunnelStageClass(a.funnel_stage)}">${escapeHtml(a.funnel_stage)}</span>` : ''}
      </div>
    </div>`).join('')}
  </div>` : ''}

  <!-- Hook Bank -->
  ${hooks.length > 0 ? `
  <div class="section">
    <div class="section-title">🪝 Hook Bank (${hooks.length})</div>
    ${hooks.map(h => `<div class="hook-item no-break">
      <span class="hook-text">${escapeHtml(h.text)}</span>
      <div class="hook-meta">
        ${h.category ? `<span class="angle-tag">${escapeHtml(h.category)}</span>` : ''}
        ${h.platform ? `<span class="angle-tag">${escapeHtml(h.platform)}</span>` : ''}
      </div>
    </div>`).join('')}
  </div>` : ''}

  <!-- Funnel Strategy -->
  ${(funnel.awareness || funnel.consideration || funnel.conversion) ? `
  <div class="section no-break">
    <div class="section-title">🔄 Funnel Strategy</div>
    ${funnel.awareness ? `<div class="funnel-step funnel-awareness"><div class="funnel-label">Awareness (TOFU)</div>${escapeHtml(funnel.awareness)}</div>` : ''}
    ${funnel.consideration ? `<div class="funnel-step funnel-consideration"><div class="funnel-label">Consideration (MOFU)</div>${escapeHtml(funnel.consideration)}</div>` : ''}
    ${funnel.conversion ? `<div class="funnel-step funnel-conversion"><div class="funnel-label">Conversion (BOFU)</div>${escapeHtml(funnel.conversion)}</div>` : ''}
  </div>` : ''}

  <!-- Scripts & Copy -->
  ${scripts.length > 0 ? `
  <div class="section">
    <div class="section-title">📝 Scripts & Copy (${scripts.length})</div>
    ${scripts.map((s, i) => `<div class="script-card no-break">
      <div class="script-header">
        <span class="script-title">${escapeHtml(s.title || `Script ${i + 1}`)}</span>
        <div class="script-meta">
          ${s.platform ? `<span class="angle-tag">${escapeHtml(s.platform)}</span>` : ''}
          ${s.duration ? `<span class="angle-tag">${escapeHtml(s.duration)}</span>` : ''}
          ${s.framework ? `<span class="angle-tag">${escapeHtml(s.framework)}</span>` : ''}
          ${s.score > 0 ? `<span class="angle-score" style="background:${scoreColor(s.score)};font-size:10px;">${s.score}/10</span>` : ''}
        </div>
      </div>
      <div class="script-body">${escapeHtml(s.body)}</div>
    </div>`).join('')}
  </div>` : ''}

  <!-- A/B Test Variants -->
  ${abVariants.length > 0 ? `
  <div class="section">
    <div class="section-title">🧪 A/B Test Variants (${abVariants.length})</div>
    ${abVariants.map(v => `<div class="ab-card no-break">
      <div class="ab-label">${escapeHtml(v.label)}</div>
      <div class="ab-desc">${escapeHtml(v.description)}</div>
      ${v.what_it_tests ? `<div class="ab-test">Hypothesis: ${escapeHtml(v.what_it_tests)}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  <!-- Creative Copy -->
  ${(headline || description || ctaText) ? `
  <div class="section no-break">
    <div class="section-title">🎨 Creative Copy</div>
    <div class="creative-block">
      ${headline ? `<div class="creative-headline">${escapeHtml(headline)}</div>` : ''}
      ${description ? `<p class="creative-desc">${escapeHtml(description)}</p>` : ''}
      ${ctaText ? `<span class="creative-cta">${escapeHtml(ctaText)}</span>` : ''}
    </div>
  </div>` : ''}

  <div class="footer">Generated by Kiwikoo Campaign Strategist · ${escapeHtml(date)}</div>
</body></html>`
}

async function downloadPdf(campaign: Record<string, unknown>) {
    const html = generatePdfHtml(campaign)
    const printWindow = window.open('', '_blank')
    if (!printWindow) { toast.error('Pop-up blocked. Please allow pop-ups.'); return }
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => { setTimeout(() => { printWindow.print() }, 500) }
}

/* ━━━━━━━━━━━━━ ANIMATIONS CSS ━━━━━━━━━━━━━ */
const ANIMATIONS_CSS = `
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulseHighlight { 0% { box-shadow: 0 0 0 0 rgba(180,240,86,0.5); } 70% { box-shadow: 0 0 0 8px rgba(180,240,86,0); } 100% { box-shadow: 0 0 0 0 rgba(180,240,86,0); } }
@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
.animate-slideUp { animation: slideUp 0.4s ease-out both; }
.animate-fadeIn { animation: fadeIn 0.3s ease-out both; }
.animate-pulse-highlight { animation: pulseHighlight 1.5s ease-in-out 2; }
.animate-slideInRight { animation: slideInRight 0.3s ease-out both; }
`

/* ━━━━━━━━━━━━━ SCORE BAR ━━━━━━━━━━━━━ */
function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
    const pct = Math.min(100, Math.max(0, (score / max) * 100))
    const color = score >= 8 ? '#B4F056' : score >= 6 ? '#FFD93D' : score >= 4 ? '#FFA94D' : '#FF6B6B'
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-[11px] font-black tabular-nums" style={{ color }}>{score}/{max}</span>
        </div>
    )
}

/* ━━━━━━━━━━━━━ FORMAT BADGE ━━━━━━━━━━━━━ */
function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'green' | 'yellow' | 'blue' | 'red' }) {
    const colors = {
        default: 'bg-black/[0.05] text-black/60',
        green: 'bg-[#B4F056]/20 text-[#5a8f10]',
        yellow: 'bg-[#FFD93D]/25 text-[#8a6d00]',
        blue: 'bg-blue-100 text-blue-700',
        red: 'bg-red-100 text-red-600',
    }
    return <span className={`inline-flex text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[variant]}`}>{children}</span>
}

/* ━━━━━━━━━━━━━ EDITABLE FIELD ━━━━━━━━━━━━━ */
function EditableField({ label, value, onSave, type = 'text', multiline = false }: {
    label: string; value: string; onSave: (val: string) => void; type?: string; multiline?: boolean
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const handleSave = useCallback(() => { onSave(draft); setEditing(false) }, [draft, onSave])

    if (editing) {
        return (
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-black/40">{label}</p>
                <div className="flex items-start gap-2">
                    {multiline ? (
                        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
                            className="flex-1 px-3 py-2 border border-black/15 rounded-lg text-sm font-medium focus:border-[#B4F056] focus:ring-2 focus:ring-[#B4F056]/30 outline-none resize-none" autoFocus />
                    ) : (
                        <input type={type} value={draft} onChange={(e) => setDraft(e.target.value)}
                            className="flex-1 px-3 py-2 border border-black/15 rounded-lg text-sm font-medium focus:border-[#B4F056] focus:ring-2 focus:ring-[#B4F056]/30 outline-none" autoFocus />
                    )}
                    <button type="button" onClick={handleSave} className="p-2 bg-[#B4F056] rounded-lg hover:bg-[#a3e045] transition-colors"><Save className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                    <button type="button" onClick={() => { setDraft(value); setEditing(false) }} className="p-2 bg-black/5 rounded-lg hover:bg-black/10 transition-colors"><X className="w-3.5 h-3.5" strokeWidth={2.5} /></button>
                </div>
            </div>
        )
    }

    return (
        <div className="group cursor-pointer" onClick={() => setEditing(true)}>
            <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-0.5">{label}</p>
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-black/80">{value || '—'}</span>
                <Edit3 className="w-3 h-3 text-black/20 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
            </div>
        </div>
    )
}

/* ━━━━━━━━━━━━━ SECTION WRAPPER ━━━━━━━━━━━━━ */
function Section({ icon: Icon, title, children, delay = 0, highlighted = false }: {
    icon: React.ElementType; title: string; children: React.ReactNode; delay?: number; highlighted?: boolean
}) {
    return (
        <div
            className={`bg-white border border-black/8 rounded-2xl overflow-hidden animate-slideUp ${highlighted ? 'animate-pulse-highlight' : ''}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="px-5 py-3 border-b border-black/6 flex items-center gap-2">
                <Icon className="w-4 h-4 text-black/40" strokeWidth={2} />
                <h3 className="text-xs font-black uppercase tracking-wider text-black/50">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

/* ━━━━━━━━━━━━━ EXPANDABLE SCRIPT CARD ━━━━━━━━━━━━━ */
function ScriptCard({ script, index }: { script: ScriptItem; index: number }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="bg-black/[0.02] border border-black/6 rounded-xl overflow-hidden">
            <button type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/[0.03] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#B4F056]/20 flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 text-[#5a8f10]" strokeWidth={2.5} />
                    </span>
                    <div className="text-left">
                        <p className="text-sm font-bold text-black">{script.title || `Script ${index + 1}`}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            {script.platform && <Badge variant="blue">{script.platform}</Badge>}
                            {script.duration && <Badge>{script.duration}</Badge>}
                            {script.framework && <Badge variant="yellow">{script.framework}</Badge>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {script.score > 0 && <ScoreBar score={script.score} />}
                    {expanded ? <ChevronUp className="w-4 h-4 text-black/30" /> : <ChevronDown className="w-4 h-4 text-black/30" />}
                </div>
            </button>
            {expanded && (
                <div className="px-4 pb-4 animate-fadeIn">
                    <div className="bg-white border border-black/8 rounded-lg p-4">
                        <p className="text-[13px] font-medium text-black/70 whitespace-pre-wrap leading-relaxed">{script.body}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ━━━━━━━━━━━━━ AI REFINEMENT CHAT PANEL ━━━━━━━━━━━━━ */
interface RefineMessage { role: 'user' | 'assistant'; content: string }

function RefineChatPanel({ campaignId, onStrategyUpdated, onClose }: {
    campaignId: string; onStrategyUpdated: () => void; onClose: () => void
}) {
    const [messages, setMessages] = useState<RefineMessage[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages])

    useEffect(() => { inputRef.current?.focus() }, [])

    const handleSend = useCallback(async () => {
        const msg = input.trim()
        if (!msg || loading) return
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: msg }])
        setLoading(true)

        try {
            const res = await fetch(`/api/campaigns/${campaignId}/refine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
            })
            const data = await res.json()

            if (!res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${data.error || 'Something went wrong'}` }])
                return
            }

            const summary = data.summary || 'Strategy updated!'
            const updates = data.updates || {}
            const updatedFields = Object.keys(updates).filter(k => k !== 'summary')
            const reply = `✅ ${summary}\n\n**Updated:** ${updatedFields.join(', ') || 'strategy'}`

            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
            onStrategyUpdated()
            toast.success('Strategy updated!')
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Network error. Please try again.' }])
        } finally {
            setLoading(false)
        }
    }, [input, loading, campaignId, onStrategyUpdated])

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40 animate-fadeIn" onClick={onClose} />

            <div className="fixed inset-x-3 bottom-3 z-50 flex h-[min(72vh,520px)] w-auto flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl animate-slideInRight sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[320px] sm:h-[480px]">
                <style>{`@keyframes slideInRight { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                    .animate-slideInRight { animation: slideInRight 0.25s ease-out both; }`}</style>

                {/* Header — compact */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/6 bg-[#FAFAF8]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#B4F056] to-[#7dd610] flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-black">AI Refine</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5 text-black/40" strokeWidth={2} />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                    {messages.length === 0 && (
                        <div className="text-center py-6">
                            <p className="text-[11px] font-bold text-black/50 mb-3">Try asking:</p>
                            <div className="space-y-1.5">
                                {['Make hooks more aggressive', 'Add TOFU content angles', 'Rewrite scripts for TikTok', 'Improve funnel strategy'].map((s) => (
                                    <button type="button" key={s} onClick={() => { setInput(s); inputRef.current?.focus() }}
                                        className="block w-full text-left text-[11px] font-medium text-black/50 bg-black/[0.03] hover:bg-[#B4F056]/10 hover:text-black/70 px-3 py-1.5 rounded-lg transition-colors">
                                        ✨ {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`animate-slideUp ${msg.role === 'user' ? 'ml-6' : 'mr-6'}`}
                            style={{ animationDelay: `${i * 40}ms` }}>
                            <div className={`px-3 py-2 rounded-xl text-[12px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-black text-white font-medium rounded-br-sm'
                                : 'bg-[#f5f5f3] text-black/80 font-medium rounded-bl-sm'
                                }`}>{msg.content}</div>
                        </div>
                    ))}
                    {loading && (
                        <div className="mr-6 animate-fadeIn">
                            <div className="bg-[#f5f5f3] rounded-xl px-3 py-2 inline-flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1 h-1 rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1 h-1 rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input — compact */}
                <div className="border-t border-black/6 px-3 py-2.5 bg-[#FAFAF8]">
                    <div className="flex items-center gap-1.5 bg-white border border-black/10 rounded-xl px-3 py-1.5">
                        <input ref={inputRef} type="text" value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                            placeholder="Ask to improve..."
                            className="flex-1 bg-transparent text-[12px] font-medium outline-none placeholder:text-black/30"
                            disabled={loading} />
                        <button type="button" onClick={handleSend} disabled={!input.trim() || loading}
                            className="p-1.5 bg-black rounded-lg text-white disabled:opacity-20 hover:bg-black/80 transition-colors">
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" strokeWidth={2.5} />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

/* ━━━━━━━━━━━━━ MAIN PAGE ━━━━━━━━━━━━━ */
export default function CampaignDetailPage() {
    const params = useParams<{ id: string }>()
    const id = typeof params?.id === 'string' ? params.id : null
    const router = useRouter()
    const { data: campaign, isLoading, error, refetch } = useCampaign(id)
    const updateMutation = useUpdateCampaign(id)
    const deleteMutation = useDeleteCampaign()
    const [deleting, setDeleting] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set())

    const handleFieldSave = useCallback(
        (field: string, value: string | number) => {
            updateMutation.mutate(
                { [field]: value } as Record<string, unknown>,
                { onSuccess: () => toast.success('Updated!'), onError: () => toast.error('Failed to update') },
            )
        },
        [updateMutation],
    )

    const handleDelete = useCallback(async () => {
        if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return
        if (!id) return
        setDeleting(true)
        deleteMutation.mutate(id, {
            onSuccess: () => { toast.success('Campaign deleted'); router.push('/brand/campaigns') },
            onError: () => { toast.error('Failed to delete'); setDeleting(false) },
        })
    }, [deleteMutation, id, router])

    const handleStrategyUpdated = useCallback(() => {
        refetch()
        setHighlightedSections(new Set(['all']))
        setTimeout(() => setHighlightedSections(new Set()), 3000)
    }, [refetch])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black/30" />
            </div>
        )
    }

    if (!id || error || !campaign) {
        return (
            <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center gap-4 px-4">
                <p className="text-black/50 font-medium">Campaign not found</p>
                <Link href="/brand/campaigns" className="text-sm font-bold underline hover:text-black/70">← Back to campaigns</Link>
            </div>
        )
    }

    const strategy = (campaign.strategy ?? {}) as Record<string, unknown>
    const audience = (campaign.audience ?? {}) as Record<string, unknown>
    const creative = (campaign.creative ?? {}) as Record<string, unknown>
    const positioning: string = typeof strategy.positioning === 'string' ? strategy.positioning : ''
    const angles = extractAngles(strategy.content_angles)
    const hooks = extractHooks(creative.hooks ?? strategy.hooks)
    const scripts = extractScripts(creative.scripts ?? strategy.scripts)
    const platforms: string[] = Array.isArray(strategy.recommended_platforms) ? (strategy.recommended_platforms as string[]).map(String) : []
    const abVariants = extractABVariants(strategy.ab_variants)
    const funnelRaw = (typeof strategy.funnel === 'object' && strategy.funnel !== null ? strategy.funnel : {}) as Record<string, unknown>
    const funnel = {
        awareness: typeof funnelRaw.awareness === 'string' ? funnelRaw.awareness : '',
        consideration: typeof funnelRaw.consideration === 'string' ? funnelRaw.consideration : '',
        conversion: typeof funnelRaw.conversion === 'string' ? funnelRaw.conversion : '',
    }
    const audienceGender = typeof audience.gender === 'string' ? audience.gender : ''
    const audienceLocation = typeof audience.location === 'string' ? audience.location : ''
    const audienceAgeMin = typeof audience.age_min === 'number' ? audience.age_min : null
    const audienceAgeMax = typeof audience.age_max === 'number' ? audience.age_max : null
    const audienceInterests: string[] = Array.isArray(audience.interests) ? (audience.interests as string[]).map(String) : []
    const creativeHeadline = typeof creative.headline === 'string' ? creative.headline : ''
    const creativeDescription = typeof creative.description === 'string' ? creative.description : ''
    const creativeCta = typeof creative.cta_text === 'string' ? creative.cta_text : ''

    const statusColors: Record<string, string> = {
        draft: 'bg-[#FFD93D] text-black',
        active: 'bg-[#B4F056] text-black',
        paused: 'bg-black/10 text-black/60',
        completed: 'bg-black text-white',
    }

    const isHighlighted = highlightedSections.has('all')

    return (
        <div className="min-h-screen bg-[#FAFAF8] pb-16">
            <style>{ANIMATIONS_CSS}</style>

            {/* HEADER */}
            <div className="bg-white/90 backdrop-blur-md border-b border-black/8 sticky top-[56px] md:top-[64px] z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-5 py-2.5">
                    {/* Top row: back + title + mobile actions */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link href="/brand/campaigns" className="w-8 h-8 rounded-full border border-black/12 flex items-center justify-center hover:bg-black/5 transition-colors shrink-0">
                                <ArrowLeft className="w-4 h-4 text-black/50" strokeWidth={2} />
                            </Link>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-wider text-black/40">Campaign</p>
                                <h1 className="text-sm font-black text-black leading-tight truncate">{campaign.title}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            <button type="button"
                                onClick={() => setChatOpen(true)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#B4F056] to-[#9be03e] border border-[#8cc92f] rounded-lg text-[11px] font-bold text-black hover:shadow-md transition-all"
                            >
                                <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                                Refine
                            </button>
                            <button type="button" onClick={() => downloadPdf(campaign as unknown as Record<string, unknown>)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-black/12 rounded-lg text-[11px] font-bold hover:bg-black/5 transition-colors">
                                <Download className="w-3 h-3" strokeWidth={2} /> PDF
                            </button>
                            <select value={campaign.status} onChange={(e) => handleFieldSave('status', e.target.value)}
                                className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border border-black/12 cursor-pointer appearance-none ${statusColors[campaign.status] || 'bg-white'}`}>
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                            </select>
                            <button type="button" onClick={handleDelete} disabled={deleting}
                                className="p-1.5 text-red-500/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4">

                {/* HERO CARD */}
                <div className="bg-white border border-black/8 rounded-2xl p-6 animate-slideUp">
                    <EditableField label="Campaign Title" value={campaign.title} onSave={(v) => handleFieldSave('title', v)} />
                    <div className="mt-3">
                        <EditableField label="Brief" value={campaign.brief || ''} onSave={(v) => handleFieldSave('brief', v)} multiline />
                    </div>
                    {positioning && (
                        <div className="mt-4 bg-[#B4F056]/10 border border-[#B4F056]/30 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Positioning</p>
                            <p className="text-sm font-semibold text-black/80">{positioning}</p>
                        </div>
                    )}
                </div>

                {/* DETAILS GRID */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Section icon={Target} title="Goal & Budget" delay={50}>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-0.5">Goal</p>
                                <p className="text-sm font-bold capitalize">{campaign.goal || '—'}</p>
                            </div>
                            <EditableField
                                label={campaign.budget_type === 'daily' ? 'Daily Budget (₹)' : 'Total Budget (₹)'}
                                value={String(campaign.budget_type === 'daily' ? campaign.daily_budget || '' : campaign.total_budget || '')}
                                onSave={(v) => handleFieldSave(campaign.budget_type === 'daily' ? 'daily_budget' : 'total_budget', Number(v))}
                                type="number"
                            />
                            {platforms.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Platforms</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {platforms.map((p, i) => (<Badge key={i} variant="blue">{p}</Badge>))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>

                    <Section icon={Users} title="Target Audience" delay={100}>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-0.5">Age Range</p>
                                    <p className="text-sm font-bold">{audienceAgeMin != null && audienceAgeMax != null ? `${audienceAgeMin}–${audienceAgeMax}` : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-0.5">Gender</p>
                                    <p className="text-sm font-bold">{audienceGender || '—'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-0.5">Location</p>
                                <p className="text-sm font-bold">{audienceLocation || '—'}</p>
                            </div>
                            {audienceInterests.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Interests</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {audienceInterests.map((int, i) => (<Badge key={i} variant="yellow">{int}</Badge>))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>
                </div>

                {/* ━━━ CONTENT ANGLES ━━━ */}
                {angles.length > 0 ? (
                    <Section icon={Sparkles} title={`Content Angles (${angles.length})`} delay={150} highlighted={isHighlighted}>
                        <div className="grid gap-3 md:grid-cols-2">
                            {angles.map((a, i) => (
                                <div key={i} className="bg-[#FAFAF8] border border-black/6 rounded-xl p-4 hover:border-[#B4F056]/40 transition-colors">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <p className="text-sm font-bold text-black leading-snug flex-1">{a.angle}</p>
                                        {a.score > 0 && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Star className="w-3 h-3 text-[#FFD93D]" fill="#FFD93D" />
                                                <span className="text-xs font-black text-black/60">{a.score}</span>
                                            </div>
                                        )}
                                    </div>
                                    {a.score > 0 && <ScoreBar score={a.score} />}
                                    {a.example && (
                                        <p className="text-[12px] text-black/50 mt-2 leading-relaxed">
                                            <span className="font-bold text-black/40">Example:</span> {a.example}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                        {a.format && <Badge variant="blue">{a.format}</Badge>}
                                        {a.funnel_stage && <Badge variant={a.funnel_stage === 'TOFU' ? 'green' : a.funnel_stage === 'MOFU' ? 'yellow' : 'red'}>{a.funnel_stage}</Badge>}
                                    </div>
                                    {a.why_it_works && (
                                        <p className="text-[11px] text-black/40 mt-2 italic">💡 {a.why_it_works}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                ) : null}

                {/* ━━━ HOOK BANK ━━━ */}
                {hooks.length > 0 ? (
                    <Section icon={Zap} title={`Hook Bank (${hooks.length})`} delay={200} highlighted={isHighlighted}>
                        <div className="space-y-2">
                            {hooks.map((h, i) => (
                                <div key={i} className="flex items-start gap-3 bg-[#FAFAF8] border border-black/6 rounded-xl px-4 py-3 hover:border-[#B4F056]/40 transition-colors">
                                    <span className="w-6 h-6 rounded-full bg-[#B4F056]/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-[10px] font-black text-[#5a8f10]">{i + 1}</span>
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-black/80">{h.text}</p>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            {h.category && <Badge variant={h.category === 'urgency' ? 'red' : h.category === 'curiosity' ? 'yellow' : h.category === 'social_proof' ? 'green' : 'default'}>{h.category.replace('_', ' ')}</Badge>}
                                            {h.platform && <Badge variant="blue">{h.platform}</Badge>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                ) : null}

                {/* ━━━ FUNNEL STRATEGY ━━━ */}
                {(funnel.awareness || funnel.consideration || funnel.conversion) ? (
                    <Section icon={Layers} title="Funnel Strategy" delay={250} highlighted={isHighlighted}>
                        <div className="space-y-3">
                            {funnel.awareness && (
                                <div className="bg-[#B4F056]/10 border-l-[3px] border-[#B4F056] rounded-r-lg px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Awareness (TOFU)</p>
                                    <p className="text-[13px] font-medium text-black/75 leading-relaxed">{funnel.awareness}</p>
                                </div>
                            )}
                            {funnel.consideration && (
                                <div className="bg-[#FFD93D]/10 border-l-[3px] border-[#FFD93D] rounded-r-lg px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Consideration (MOFU)</p>
                                    <p className="text-[13px] font-medium text-black/75 leading-relaxed">{funnel.consideration}</p>
                                </div>
                            )}
                            {funnel.conversion && (
                                <div className="bg-[#FF6B6B]/10 border-l-[3px] border-[#FF6B6B] rounded-r-lg px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">Conversion (BOFU)</p>
                                    <p className="text-[13px] font-medium text-black/75 leading-relaxed">{funnel.conversion}</p>
                                </div>
                            )}
                        </div>
                    </Section>
                ) : null}

                {/* ━━━ SCRIPTS ━━━ */}
                {scripts.length > 0 ? (
                    <Section icon={FileText} title={`Scripts & Copy (${scripts.length})`} delay={300} highlighted={isHighlighted}>
                        <div className="space-y-2">
                            {scripts.map((s, i) => (<ScriptCard key={i} script={s} index={i} />))}
                        </div>
                    </Section>
                ) : null}

                {/* ━━━ CREATIVE ━━━ */}
                {(creativeHeadline || creativeDescription) ? (
                    <Section icon={Megaphone} title="Creative" delay={350} highlighted={isHighlighted}>
                        <div className="space-y-3">
                            {creativeHeadline && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-0.5">Headline</p>
                                    <p className="text-base font-black text-black">{creativeHeadline}</p>
                                </div>
                            )}
                            {creativeDescription && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-0.5">Description</p>
                                    <p className="text-sm font-medium text-black/70 leading-relaxed">{creativeDescription}</p>
                                </div>
                            )}
                            {creativeCta && (
                                <div className="inline-block bg-[#B4F056] border-2 border-black px-4 py-2 rounded-lg font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {creativeCta}
                                </div>
                            )}
                        </div>
                    </Section>
                ) : null}

                {/* ━━━ A/B VARIANTS ━━━ */}
                {abVariants.length > 0 ? (
                    <Section icon={BarChart3} title={`A/B Test Variants (${abVariants.length})`} delay={400} highlighted={isHighlighted}>
                        <div className="space-y-3">
                            {abVariants.map((v, i) => (
                                <div key={i} className="bg-[#FAFAF8] border border-black/6 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs font-black bg-black text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                                            {v.label ? v.label.charAt(v.label.length - 1) : String.fromCharCode(65 + i)}
                                        </span>
                                        <p className="text-sm font-bold text-black">{v.label || `Variant ${String.fromCharCode(65 + i)}`}</p>
                                    </div>
                                    <p className="text-[13px] font-medium text-black/70 leading-relaxed">{v.description}</p>
                                    {v.what_it_tests && (
                                        <p className="text-[11px] text-black/40 mt-2 italic">
                                            🧪 <span className="font-bold">Tests:</span> {v.what_it_tests}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                ) : null}

                {/* ━━━ METRICS ━━━ */}
                {(campaign.impressions > 0 || campaign.clicks > 0 || campaign.spend > 0) && (
                    <Section icon={DollarSign} title="Performance Metrics" delay={450}>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Impressions', value: campaign.impressions?.toLocaleString() || '0' },
                                { label: 'Clicks', value: campaign.clicks?.toLocaleString() || '0' },
                                { label: 'Conversions', value: campaign.conversions?.toLocaleString() || '0' },
                                { label: 'Spend', value: `₹${campaign.spend?.toLocaleString() || '0'}` },
                            ].map((m, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-black/40 mb-1">{m.label}</p>
                                    <p className="text-lg font-black">{m.value}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>

            {/* AI CHAT PANEL */}
            {chatOpen && (
                <RefineChatPanel
                    campaignId={id}
                    onStrategyUpdated={handleStrategyUpdated}
                    onClose={() => setChatOpen(false)}
                />
            )}
        </div>
    )
}
