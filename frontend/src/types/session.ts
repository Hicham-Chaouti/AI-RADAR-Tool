/** Session types matching the backend Pydantic schemas. */

export interface SessionCreate {
    sector: string
    client_name: string
    relationship_level?: string
    business_proximity?: string
    capabilities?: string[]
    data_maturity?: string
    strategic_objectives?: string[]
}

export interface SessionRead extends SessionCreate {
    id: string
    created_at: string
}
