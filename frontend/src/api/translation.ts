import client from './client'
import type { Language } from '../i18n/I18nProvider'

interface TranslateRequest {
  text: string
  target_language: Language
  source_language?: Language | 'unknown'
}

interface TranslateResponse {
  text: string
  detected_language: string
  translated: boolean
}

interface TranslateBatchRequest {
  items: string[]
  target_language: Language
  source_language?: Language | 'unknown'
}

interface TranslateBatchResponse {
  items: string[]
  detected_language: string
  translated_count: number
}

export async function translateDescription(payload: TranslateRequest): Promise<TranslateResponse> {
  const response = await client.post<TranslateResponse>('/translate/description', payload)
  return response.data
}

export async function translateBatch(payload: TranslateBatchRequest): Promise<TranslateBatchResponse> {
  const response = await client.post<TranslateBatchResponse>('/translate/batch', payload)
  return response.data
}
