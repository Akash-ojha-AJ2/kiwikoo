const DEFAULT_SYNTHETIC_DOMAIN = 'users.kiwikoo.local'

function getSyntheticDomain(): string {
  return (process.env.USERNAME_EMAIL_DOMAIN || DEFAULT_SYNTHETIC_DOMAIN).trim().toLowerCase()
}

export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase()
}

export function isEmailIdentifier(value: string): boolean {
  return value.includes('@')
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export function usernameToSyntheticEmail(username: string): string {
  const clean = normalizeUsername(username)
  return `${clean}@${getSyntheticDomain()}`
}

export function isSyntheticEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.trim().toLowerCase().endsWith(`@${getSyntheticDomain()}`)
}

export function emailLocalPart(email: string): string {
  return email.split('@')[0]?.toLowerCase() || email.toLowerCase()
}
