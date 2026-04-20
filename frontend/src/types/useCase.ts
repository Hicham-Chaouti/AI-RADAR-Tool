/** Use case types matching the backend Pydantic schemas. */

export interface UseCase {
    id: string
    title: string
    description: string
    sector: string | null
    sector_normalized: string
    functions: string[] | null
    agent_type: string | null
    company_example: string | null
    business_challenge: string | null
    ai_solution: string | null
    measurable_benefit: string | null
    tech_keywords: string[] | null
    source_url: string
    source_name: string
    scrape_date: string
}

/** Shape returned by POST /score top_10 items. */
export interface UseCaseScored {
    use_case_id: string
    id?: string
    title: string
    rank: number
    radar_score: number
    score_breakdown: {
        trend_strength: number
        client_relevance: number
        capability_match: number
        market_momentum: number
    }
    radar_axes?: {
        roi_potential: number
        technical_complexity: number
        market_maturity: number
        regulatory_risk: number
        quick_win_potential: number
    }
    justification: string | null
    quick_win: boolean
    archetype: string | null
    company_example: string | null
    sector?: string
    sector_normalized?: string
    source_url?: string
    source_name?: string
}
