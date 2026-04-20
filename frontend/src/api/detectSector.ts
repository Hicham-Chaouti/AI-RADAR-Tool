import client from './client'

export interface DetectSectorResult {
  sector_label: string
  confidence: string
  reasoning: string
}

export async function detectSector(clientName: string): Promise<DetectSectorResult> {
  const response = await client.post('/detect-sector', {
    client_name: clientName,
  })
  return response.data
}
