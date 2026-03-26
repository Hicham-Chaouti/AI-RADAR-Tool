import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import en from './locales/en.json'
import fr from './locales/fr.json'

export type Language = 'en' | 'fr'

type Dictionary = Record<string, unknown>

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string
}

export const LANGUAGE_STORAGE_KEY = 'ai-radar-language'

const dictionaries: Record<Language, Dictionary> = { en, fr }

export const I18nContext = createContext<I18nContextValue | null>(null)

function getByPath(obj: Dictionary, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (typeof acc === 'object' && acc !== null && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

function applyParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.split(`{{${key}}}`).join(String(value))
  }, text)
}

function getInitialLanguage(): Language {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'en' || stored === 'fr') {
    return stored
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const t = useCallback((key: string, params?: Record<string, string | number>, fallback?: string) => {
    const value = getByPath(dictionaries[language], key)
    if (typeof value === 'string') {
      return applyParams(value, params)
    }

    const fallbackValue = getByPath(dictionaries.en, key)
    if (typeof fallbackValue === 'string') {
      return applyParams(fallbackValue, params)
    }

    return fallback ?? key
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
