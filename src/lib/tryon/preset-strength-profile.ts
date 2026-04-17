import 'server-only'

export interface PresetStrengthProfile {
  // 0..1 weights
  framingDiscipline: number
  colorCleanliness: number
  moodIntensity: number
  grainTexture: number
  iphoneRealism: number
  poseFreedom: number
  identityRigidity: number
  stylizationAllowance: number
}

const DEFAULT_PROFILE: PresetStrengthProfile = {
  framingDiscipline: 0.72,
  colorCleanliness: 0.7,
  moodIntensity: 0.62,
  grainTexture: 0.35,
  iphoneRealism: 0.65,
  poseFreedom: 0.45,
  identityRigidity: 0.92,
  stylizationAllowance: 0.35,
}

function clamp01(v: number): number {
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}

function merge(base: PresetStrengthProfile, patch: Partial<PresetStrengthProfile>): PresetStrengthProfile {
  return {
    framingDiscipline: clamp01(patch.framingDiscipline ?? base.framingDiscipline),
    colorCleanliness: clamp01(patch.colorCleanliness ?? base.colorCleanliness),
    moodIntensity: clamp01(patch.moodIntensity ?? base.moodIntensity),
    grainTexture: clamp01(patch.grainTexture ?? base.grainTexture),
    iphoneRealism: clamp01(patch.iphoneRealism ?? base.iphoneRealism),
    poseFreedom: clamp01(patch.poseFreedom ?? base.poseFreedom),
    identityRigidity: clamp01(patch.identityRigidity ?? base.identityRigidity),
    stylizationAllowance: clamp01(patch.stylizationAllowance ?? base.stylizationAllowance),
  }
}

export function getPresetStrengthProfile(params: {
  presetId?: string
  category?: string
}): PresetStrengthProfile {
  const id = (params.presetId || '').toLowerCase()
  const category = (params.category || '').toLowerCase()

  let profile = { ...DEFAULT_PROFILE }

  if (id.startsWith('studio_')) {
    profile = merge(profile, {
      framingDiscipline: 0.94,
      colorCleanliness: 0.92,
      moodIntensity: 0.58,
      grainTexture: 0.2,
      iphoneRealism: 0.35,
      poseFreedom: 0.22,
      identityRigidity: 0.97,
      stylizationAllowance: 0.4,
    })
  } else if (id.startsWith('street_') || category === 'street') {
    profile = merge(profile, {
      framingDiscipline: 0.75,
      colorCleanliness: 0.72,
      moodIntensity: 0.9,
      grainTexture: 0.78,
      iphoneRealism: 0.82,
      poseFreedom: 0.68,
      identityRigidity: 0.95,
      stylizationAllowance: 0.62,
    })
  } else if (
    id.startsWith('casual_') ||
    id.includes('selfie') ||
    category === 'home'
  ) {
    profile = merge(profile, {
      framingDiscipline: 0.62,
      colorCleanliness: 0.66,
      moodIntensity: 0.55,
      grainTexture: 0.52,
      iphoneRealism: 0.96,
      poseFreedom: 0.74,
      identityRigidity: 0.95,
      stylizationAllowance: 0.24,
    })
  } else if (category === 'travel') {
    profile = merge(profile, {
      framingDiscipline: 0.72,
      colorCleanliness: 0.78,
      moodIntensity: 0.66,
      grainTexture: 0.42,
      iphoneRealism: 0.86,
      poseFreedom: 0.63,
      identityRigidity: 0.95,
      stylizationAllowance: 0.38,
    })
  } else if (category === 'outdoor') {
    profile = merge(profile, {
      framingDiscipline: 0.7,
      colorCleanliness: 0.76,
      moodIntensity: 0.72,
      grainTexture: 0.46,
      iphoneRealism: 0.8,
      poseFreedom: 0.62,
      identityRigidity: 0.95,
      stylizationAllowance: 0.42,
    })
  }

  // Special-case high-style presets
  if (
    id.includes('noir') ||
    id.includes('mafia') ||
    id.includes('flash') ||
    id.includes('fisheye') ||
    id.includes('gas_station_night')
  ) {
    profile = merge(profile, {
      moodIntensity: Math.max(profile.moodIntensity, 0.9),
      grainTexture: Math.max(profile.grainTexture, 0.62),
      stylizationAllowance: Math.max(profile.stylizationAllowance, 0.58),
      identityRigidity: Math.max(profile.identityRigidity, 0.95),
    })
  }

  // Night realism presets: keep moody environment, but do not sacrifice face identity
  // or garment color integrity for stylization.
  if (id.includes('gas_station_night') || id.includes('mcdonalds_bmw_night')) {
    profile = merge(profile, {
      framingDiscipline: Math.max(profile.framingDiscipline, 0.84),
      colorCleanliness: Math.max(profile.colorCleanliness, 0.88),
      moodIntensity: Math.max(profile.moodIntensity, 0.86),
      grainTexture: Math.min(profile.grainTexture, 0.5),
      iphoneRealism: Math.max(profile.iphoneRealism, 0.82),
      poseFreedom: Math.min(profile.poseFreedom, 0.56),
      identityRigidity: Math.max(profile.identityRigidity, 0.98),
      stylizationAllowance: Math.min(profile.stylizationAllowance, 0.28),
    })
  }

  // Low-key + blind-shadow presets can over-style faces if unrestricted.
  if (id === 'studio_crimson_noir' || id === 'golden_hour_bedroom') {
    profile = merge(profile, {
      framingDiscipline: Math.max(profile.framingDiscipline, 0.86),
      colorCleanliness: Math.max(profile.colorCleanliness, 0.9),
      moodIntensity: Math.max(profile.moodIntensity, 0.82),
      grainTexture: Math.min(profile.grainTexture, 0.42),
      iphoneRealism: Math.max(profile.iphoneRealism, 0.78),
      poseFreedom: Math.min(profile.poseFreedom, 0.5),
      identityRigidity: Math.max(profile.identityRigidity, 0.985),
      stylizationAllowance: Math.min(profile.stylizationAllowance, 0.24),
    })
  }

  // Production safety floor: face consistency must remain stable across ALL presets.
  profile = merge(profile, {
    colorCleanliness: Math.max(profile.colorCleanliness, 0.82),
    grainTexture: Math.min(profile.grainTexture, 0.48),
    poseFreedom: Math.max(Math.min(profile.poseFreedom, 0.55), 0.35),
    identityRigidity: Math.max(profile.identityRigidity, 0.99),
    stylizationAllowance: Math.min(profile.stylizationAllowance, 0.22),
  })

  return profile
}

