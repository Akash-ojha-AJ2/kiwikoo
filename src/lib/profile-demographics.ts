export function normalizeDateOfBirth(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!isoMatch) return null

  const parsed = new Date(`${trimmed}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return null

  return trimmed
}

export function getGenerationTagFromDob(dateOfBirth: string | null | undefined): string | null {
  const normalized = normalizeDateOfBirth(dateOfBirth)
  if (!normalized) return null

  const year = Number(normalized.slice(0, 4))
  if (!Number.isFinite(year)) return null

  if (year >= 2013) return 'Gen Alpha'
  if (year >= 1997) return 'Gen Z'
  if (year >= 1981) return 'Millennial'
  if (year >= 1965) return 'Gen X'
  if (year >= 1946) return 'Baby Boomer'
  return 'Traditionalist'
}

export function formatDateOfBirth(dateOfBirth: string | null | undefined): string | null {
  const normalized = normalizeDateOfBirth(dateOfBirth)
  if (!normalized) return null

  const parsed = new Date(`${normalized}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}
