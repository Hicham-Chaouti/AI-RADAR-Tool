import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { LANGUAGE_STORAGE_KEY } from './config'

export type Language = 'en' | 'fr'

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)

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
    if (i18n.language !== language) {
      void i18n.changeLanguage(language)
    }
  }, [language])

  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      const next: Language = lng.startsWith('fr') ? 'fr' : 'en'
      setLanguage(next)
    }
    i18n.on('languageChanged', onLanguageChanged)
    return () => {
      i18n.off('languageChanged', onLanguageChanged)
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>, fallback?: string) => {
    const value = i18n.t(key, { ...params, defaultValue: fallback ?? key })
    return typeof value === 'string' ? value : fallback ?? key
  }, [])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    </I18nextProvider>
  )
}
