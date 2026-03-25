import client from './client'

export type DecisionStatus = 'approve' | 'defer' | 'reject'
export type DecisionConfidence = 'low' | 'medium' | 'high'
export type TimeToValue = 'lt_3m' | 'm3_6' | 'm6_12' | 'gt_12m'
export type RiskIncidents = 'none' | 'minor' | 'major'

export interface FeedbackItem {
    id?: string
    session_id: string
    use_case_id: string
    decision_status: DecisionStatus
    confidence: DecisionConfidence
    strategic_fit: number
    business_value: number
    feasibility: number
    time_to_value: TimeToValue
    blockers?: string[]
    rationale: string
    owner?: string | null
    next_step_date?: string | null

    implemented?: boolean | null
    kpi_name?: string | null
    baseline_value?: number | null
    current_value?: number | null
    adoption_percent?: number | null
    satisfaction?: number | null
    delivery_difficulty?: number | null
    risk_incidents?: RiskIncidents | null
    outcome_comment?: string | null

    updated_by?: string | null
    created_at?: string
    updated_at?: string
}

export interface FeedbackListResponse {
    session_id: string
    items: FeedbackItem[]
}

export async function listFeedback(sessionId: string): Promise<FeedbackListResponse> {
    const response = await client.get<FeedbackListResponse>('/feedback', {
        params: { session_id: sessionId },
    })
    return response.data
}

export async function saveFeedback(payload: FeedbackItem): Promise<FeedbackItem> {
    const response = await client.post<FeedbackItem>('/feedback', payload)
    return response.data
}
