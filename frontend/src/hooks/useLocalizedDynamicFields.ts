import { useEffect, useMemo, useState } from 'react'
import { translateBatch } from '../api/translation'
import { useTranslation } from './useTranslation'
import { detectLikelyLanguage, sanitizeCommercialNames } from '../utils/language'

type FieldMap = Record<string, string | null | undefined>

const cache = new Map<string, string>()

export function useLocalizedDynamicFields<T extends FieldMap>(source: T): Record<keyof T, string> {
  const { language } = useTranslation()
  const [localized, setLocalized] = useState<Record<keyof T, string>>(() => {
    const init = {} as Record<keyof T, string>
    for (const key of Object.keys(source) as Array<keyof T>) {
      init[key] = sanitizeCommercialNames((source[key] || '').trim())
    }
    return init
  })

  const entries = useMemo(() => {
    return (Object.keys(source) as Array<keyof T>).map((key) => {
      const raw = sanitizeCommercialNames((source[key] || '').trim())
      return { key, raw }
    })
  }, [source])

  useEffect(() => {
    let cancelled = false

    const initial = {} as Record<keyof T, string>
    const toTranslate: Array<{ key: keyof T; text: string }> = []

    for (const entry of entries) {
      initial[entry.key] = entry.raw
      if (!entry.raw) continue

      const detected = detectLikelyLanguage(` ${entry.raw.toLowerCase()} `)
      const cacheKey = `${language}::${entry.raw}`

      if (cache.has(cacheKey)) {
        initial[entry.key] = cache.get(cacheKey) || entry.raw
      } else if (detected !== language) {
        toTranslate.push({ key: entry.key, text: entry.raw })
      }
    }

    setLocalized(initial)

    if (toTranslate.length === 0) return

    translateBatch({
      items: toTranslate.map((x) => x.text),
      target_language: language,
      source_language: 'unknown',
    })
      .then((res) => {
        if (cancelled) return
        const next = { ...initial }
        toTranslate.forEach((item, idx) => {
          const translated = sanitizeCommercialNames((res.items[idx] || item.text).trim())
          const cacheKey = `${language}::${item.text}`
          cache.set(cacheKey, translated)
          next[item.key] = translated
        })
        setLocalized(next)
      })
      .catch(() => {
        if (!cancelled) {
          setLocalized(initial)
        }
      })

    return () => {
      cancelled = true
    }
  }, [entries, language])

  return localized
}
