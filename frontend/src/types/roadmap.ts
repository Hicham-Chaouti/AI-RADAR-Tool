export interface RoadmapPhase {
  phase: string
  description: string
  charge_jours: number
  budget_phase: string
  profils: string[]
  key_actions: string[]
  livrables: string[]
}

export interface RiskMitigation {
  risk: string
  mitigation: string
}

export interface Roadmap {
  use_case_title: string
  objective: string
  business_value: string[]
  budget_total?: string
  equipe_recommandee?: string
  roadmap: RoadmapPhase[]
  estimated_timeline: string
  risks_and_mitigations: RiskMitigation[]
}
