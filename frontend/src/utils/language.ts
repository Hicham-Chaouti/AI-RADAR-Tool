const ENGLISH_HINTS = ['the', 'and', 'for', 'with', 'use', 'using', 'build', 'improve', 'customer', 'data']
const FRENCH_HINTS = ['le', 'la', 'les', 'des', 'pour', 'avec', 'utilise', 'donnees', 'client', 'entreprise']

const COMMERCIAL_NAME_PATTERNS = [
  /\bgoogle\b/gi,
  /\bspotify\b/gi,
  /\bwhatsapp\b/gi,
  /\bsalesforce\b/gi,
  /\bamazon\b/gi,
  /\bmicrosoft\b/gi,
  /\bmeta\b/gi,
  /\bapple\b/gi,
]

export function sanitizeCommercialNames(text: string): string {
  return COMMERCIAL_NAME_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, 'organization'), text)
}

export function detectLikelyLanguage(text: string): 'en' | 'fr' | 'unknown' {
  const normalized = text.toLowerCase()
  const enScore = ENGLISH_HINTS.reduce((score, token) => score + (normalized.includes(` ${token} `) ? 1 : 0), 0)
  const frScore = FRENCH_HINTS.reduce((score, token) => score + (normalized.includes(` ${token} `) ? 1 : 0), 0)

  if (enScore >= frScore + 1) return 'en'
  if (frScore >= enScore + 1) return 'fr'
  return 'unknown'
}
