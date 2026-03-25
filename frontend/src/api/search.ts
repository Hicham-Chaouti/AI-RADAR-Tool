import client from './client'

export interface SearchResult {
    use_case_id: string
    title: string
    sector_normalized: string
    archetype: string | null
    weighted_score: number
    radar_score?: number | null
    score_breakdown?: {
        trend_strength: number
        client_relevance: number
        capability_match: number
        market_momentum: number
    }
    quick_win: boolean
    company_example?: string | null
    source_name?: string | null
    similarity_score: number
    source_url: string | null
}

export interface SearchResponse {
    query: string
    results: SearchResult[]
    total: number
}

/** Search use cases with optional filters. */
export async function searchUseCases(params: {
    q: string
    session_id?: string
    sector?: string
    function?: string
    limit?: number
}): Promise<SearchResponse> {
    const response = await client.get<SearchResponse>('/search', { params })
    return response.data
}
