import client from './client'

export interface ScoreResponse {
    session_id: string
    sector: string
    processing_time_ms: number
    top_10: Array<{
        use_case_id: string
        title: string
        rank: number
        radar_score: number
        score_breakdown: {
            trend_strength: number
            client_relevance: number
            capability_match: number
            market_momentum: number
        }
        justification: string | null
        quick_win: boolean
        archetype: string | null
        company_example: string | null
    }>
    generated_at: string
}

export async function scoreSession(sessionId: string): Promise<ScoreResponse> {
    const response = await client.post<ScoreResponse>('/score', { session_id: sessionId })
    return response.data
}
