import { useEffect, useMemo, useState } from 'react'
import { translateDescription } from '../api/translation'
import { useTranslation } from './useTranslation'
import { detectLikelyLanguage, sanitizeCommercialNames } from '../utils/language'

const cache = new Map<string, string>()

export function useLocalizedDynamicText(sourceText: string | null | undefined) {
  const { language } = useTranslation()
  const [text, setText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  const safeInput = useMemo(() => sanitizeCommercialNames((sourceText || '').trim()), [sourceText])

  useEffect(() => {
    let cancelled = false

    if (!safeInput) {
      setText('')
      return
    }

    const detected = detectLikelyLanguage(` ${safeInput.toLowerCase()} `)
    const cacheKey = `${language}::${safeInput}`

    if (cache.has(cacheKey)) {
      setText(cache.get(cacheKey) || safeInput)
      return
    }

    if (detected === language) {
      cache.set(cacheKey, safeInput)
      setText(safeInput)
      return
    }

    setIsTranslating(true)
    translateDescription({
      text: safeInput,
      target_language: language,
      source_language: detected,
    })
      .then((res) => {
        if (cancelled) return
        cache.set(cacheKey, res.text)
        setText(res.text)
      })
      .catch(() => {
        if (!cancelled) {
          setText(safeInput)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsTranslating(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [language, safeInput])

  return { text: text || safeInput, isTranslating }
}
