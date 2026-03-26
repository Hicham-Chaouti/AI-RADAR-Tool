import { useContext } from 'react'
import { I18nContext } from '../i18n/I18nProvider'

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useTranslation must be used inside I18nProvider')
  }
  return ctx
}
