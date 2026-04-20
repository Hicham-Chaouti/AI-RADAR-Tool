export interface RoadmapPhase {
  phase: string
  description: string
  charge_jours: number
  charge_avec_buffer?: number
  budget_phase: string
  profils: string[]
  key_actions: string[]
  livrables: string[]
  go_no_go?: string
  risques_phase?: { risk: string; mitigation?: string }[]
  dependances?: string[]
}

export interface RiskMitigation {
  risk: string
  mitigation: string
}

export interface RoadmapBanner {
  complexity?: string
  pitch?: string
  roi_attendu?: string
  cible?: string
}

export interface RoadmapHypotheses {
  techniques?: string[]
  organisationnelles?: string[]
  business?: string[]
  impact_variation?: string
}

export interface RoadmapExpectationsRow {
  label: string
  pessimiste: string
  realiste: string
  optimiste: string
}

export interface RoadmapExpectations {
  rows: RoadmapExpectationsRow[]
  facteurs_pessimiste?: string[]
  facteurs_optimiste?: string[]
}

export interface RoadmapMetriquesSucces {
  livraison?: string[]
  adoption_m3?: string[]
  impact_m6?: string[]
  signal_abandon?: string
}

export interface Roadmap {
  use_case_title: string
  objective: string
  hypotheses_de_base?: string[]
  business_value: string[]
  budget_total?: string
  equipe_recommandee?: string
  roadmap: RoadmapPhase[]
  estimated_timeline: string
  risks_and_mitigations: RiskMitigation[]
  banner?: RoadmapBanner
  hypotheses?: RoadmapHypotheses
  expectations?: RoadmapExpectations
  metriques_succes?: RoadmapMetriquesSucces
}
