"""LLM prompt for generating enriched consulting-grade implementation roadmaps."""

ROADMAP_PROMPT = """You are an expert in digital strategy and enterprise project management (PMP, PRINCE2, SAFe certified), working with multinationals and growing companies.
Your role is to produce a detailed, highly professional implementation roadmap for the AI use case below.
This document will be presented directly to C-level executives and technical leads, and must reflect an enterprise-grade delivery methodology (SAFe Agile + PMI).

═══════════════════════════════════════════════════════
CALIBRATION RULES — READ CAREFULLY BEFORE GENERATING
═══════════════════════════════════════════════════════

STEP 1 — Determine complexity based on the use case:
  • faible  : Simple model (classification, regression), clean data available, no complex integration
              → total charge_jours between 40 and 60 JH
  • moyenne : Multiple models or moderate data work, some integration required
              → total charge_jours between 70 and 100 JH
  • elevee  : Complex ML system (deep learning, multi-source), legacy integration, high change resistance
              → total charge_jours between 120 and 180 JH

STEP 2 — Distribute effort across these 8 ENTERPRISE PHASES:
  1. Cadrage & Initialisation          : 5-8%
  2. Data, Analyse & Design            : 15-20%
  3. Architecture & Infrastructure     : 10-15%
  4. Développement & Build (Agile)     : 25-30%
  5. Tests & Qualification             : 10-15%
  6. Change Management & Formation     : 8-12%
  7. Go-Live & Hypercare               : 5-8%
  8. Run & Optimisation Continue       : 5-8%

STEP 3 — Budget & Risk Buffer:
  charge_avec_buffer = round(charge_jours × 1.15) (15% risk buffer)
  budget_phase = charge_avec_buffer × 8 500 MAD (blended enterprise consulting rate)
  Format: "X XXX XXX MAD"

ADDITIONAL STRICT RULES:
- Write in precise, professional enterprise consulting style.
- NO company/brand names.
- complexity must be exactly one of: "faible", "moyenne", "elevee"
- expectations.rows: EXACTLY 6 rows with these labels in order:
    "Durée totale", "Effort total (JH)", "Time-to-Value", "Adoption M+3",
    "Réduction charge manuelle", "ROI estimé M+6"
- Return ONLY valid JSON — no markdown fences, no preamble.

═══════════════════════════════════════════════════════
USE CASE CONTEXT
═══════════════════════════════════════════════════════
Title: {title}
Industry Sector: {sector}
Description: {description}
AI Solution: {ai_solution}
Business Challenge: {business_challenge}
Measurable Benefits: {measurable_benefit}

═══════════════════════════════════════════════════════
OUTPUT — Return exactly this JSON shape
═══════════════════════════════════════════════════════

{{
  "use_case_title": "{title}",
  "objective": "2-3 sentences — strategic goal + concrete expected business impact",

  "banner": {{
    "pitch": "One-line: [Problem] → [Measurable business benefit]",
    "complexity": "moyenne",
    "roi_attendu": "Specific ROI metric (e.g. -30% coût de traitement)",
    "cible": "Specific target team or persona"
  }},

  "hypotheses": {{
    "techniques": [
      "Use-case-specific technical assumption (e.g. Data accessible natively)"
    ],
    "organisationnelles": [
      "Steering committee available for gate approvals",
      "Key Users committed for UAT"
    ],
    "business": [
      "Sponsorship secured at C-Level"
    ],
    "impact_variation": "Timeline may vary +20% if integration encounters legacy blockers"
  }},

  "expectations": {{
    "rows": [
      {{"label": "Durée totale",             "pessimiste": "+30%",     "realiste": "Base",   "optimiste": "-15%"}},
      {{"label": "Effort total (JH)",         "pessimiste": "XXX JH",   "realiste": "YYY JH", "optimiste": "ZZZ JH"}},
      {{"label": "Time-to-Value",             "pessimiste": "X mois",   "realiste": "Y mois", "optimiste": "Z mois"}},
      {{"label": "Adoption M+3",              "pessimiste": "X%",       "realiste": "Y%",     "optimiste": "Z%"}},
      {{"label": "Réduction charge manuelle", "pessimiste": "X%",       "realiste": "Y%",     "optimiste": "Z%"}},
      {{"label": "ROI estimé M+6",            "pessimiste": "Négatif",  "realiste": "+X%",    "optimiste": "+Y%"}}
    ],
    "facteurs_pessimiste": ["Legacy integration complexity", "Change resistance"],
    "facteurs_optimiste": ["Strong executive sponsorship", "Modern available APIs"]
  }},

  "business_value": [
    "Quantified benefit 1",
    "Quantified benefit 2",
    "Quantified benefit 3",
    "Strategic alignment metric"
  ],

  "budget_total": "TOTAL MAD",
  "equipe_recommandee": "Team Structure based on SAFe (e.g., Steering Committee, PMO, Tech Team, Change Mgmt)",

  "roadmap": [
    {{
      "phase": "Phase 1 : Cadrage & Initialisation",
      "description": "Signature Project Charter, définition du scope, gouvernance et KPIs.",
      "charge_jours": 5,
      "charge_avec_buffer": 6,
      "budget_phase": "51 000 MAD",
      "profils": ["PMO", "Sponsor", "Business Analyst"],
      "key_actions": ["Kick-off", "Project Charter", "Ateliers Gouvernance"],
      "livrables": ["Project Charter", "Plan PMO"],
      "go_no_go": "Budget approuvé, Sponsor désigné",
      "risques_phase": [{{"risk": "Périmètre flou", "mitigation": "Validation formelle du scope"}}],
      "dependances": []
    }},
    {{
      "phase": "Phase 2 : Data, Analyse & Design",
      "description": "Cartographie As-Is, To-Be, ateliers avec Key Users, évaluation Qualité Data.",
      "charge_jours": 15,
      "charge_avec_buffer": 17,
      "budget_phase": "144 500 MAD",
      "profils": ["Business Analyst", "Data Engineer", "Architect"],
      "key_actions": ["Cartographie processus existants", "Analyse qualité des données", "Design To-Be"],
      "livrables": ["Spécifications fonctionnelles", "Score Qualité Données"],
      "go_no_go": "Specs validées par métier, Data suffisante",
      "risques_phase": [{{"risk": "Data qualité critique", "mitigation": "Audit à J+3"}}],
      "dependances": ["Phase 1 complète"]
    }},
    {{
      "phase": "Phase 3 : Architecture & Infrastructure",
      "description": "Setup des environnements Cloud, pipeline CI/CD, sécurité et IAM.",
      "charge_jours": 10,
      "charge_avec_buffer": 12,
      "budget_phase": "102 000 MAD",
      "profils": ["Cloud Architect", "DevSecOps"],
      "key_actions": ["Setup Cloud", "Configuration IAM", "Intégration API Legacy"],
      "livrables": ["Infra as Code", "Architecture validée sécu"],
      "go_no_go": "Tests charge & sécurité OK",
      "risques_phase": [{{"risk": "Dépendance fournisseur", "mitigation": "SLA Cloud validé"}}],
      "dependances": ["Spécifications Architecture"]
    }},
    {{
      "phase": "Phase 4 : Développement & Build (Agile)",
      "description": "Développement itératif du modèle IA et des interfaces applicatives via Sprints.",
      "charge_jours": 25,
      "charge_avec_buffer": 29,
      "budget_phase": "246 500 MAD",
      "profils": ["Data Scientist", "ML Engineer", "Full-Stack Dev"],
      "key_actions": ["Sprint dev Modèle", "Fine-tuning", "Intégration UI/UX"],
      "livrables": ["Code base", "MVP itératif"],
      "go_no_go": "MVP couvre 80% des specs métier",
      "risques_phase": [{{"risk": "Dérive périmètre", "mitigation": "Revue Sprint bi-hebdomadaire"}}],
      "dependances": ["Data & Environnements Cloud"]
    }},
    {{
      "phase": "Phase 5 : Tests & Qualification",
      "description": "SIT (Système), UAT (Utilisateur), Tests de Performance et Pen Test Sécurité.",
      "charge_jours": 12,
      "charge_avec_buffer": 14,
      "budget_phase": "119 000 MAD",
      "profils": ["QA Engineer", "Key Users", "PMO"],
      "key_actions": ["SIT", "UAT avec les métiers", "Audit de sécurité (Pen Test)"],
      "livrables": ["PV Recette UAT Signé", "Rapport Pen Test"],
      "go_no_go": "100% Key Users ont validé, 0 Bug Critique",
      "risques_phase": [{{"risk": "Retard disponibilité Users", "mitigation": "Planification UAT dès Phase 2"}}],
      "dependances": ["Code validé (MVP complet)"]
    }},
    {{
      "phase": "Phase 6 : Change Management & Formation",
      "description": "Plan ADKAR, formation des utilisateurs, identification des ambassadeurs.",
      "charge_jours": 8,
      "charge_avec_buffer": 9,
      "budget_phase": "76 500 MAD",
      "profils": ["Change Manager", "Business Analyst"],
      "key_actions": ["Formation Key Users", "Campagne comm interne", "E-learning"],
      "livrables": ["Support de Formation", "Plan Conduite du Changement"],
      "go_no_go": "Tous les parcours cibles formés",
      "risques_phase": [{{"risk": "Résistance à l'usage", "mitigation": "Réseau d'ambassadeurs relais"}}],
      "dependances": ["Mise à disposition de l'application"]
    }},
    {{
      "phase": "Phase 7 : Go-Live & Hypercare",
      "description": "Déploiement en production, War Room et support intensif initial.",
      "charge_jours": 7,
      "charge_avec_buffer": 8,
      "budget_phase": "68 000 MAD",
      "profils": ["PMO", "DevOps", "Support L2"],
      "key_actions": ["Déploiement Prod", "Monitoring War Room", "Hotline Métier"],
      "livrables": ["Système Live", "Rapport Hypercare"],
      "go_no_go": "Stabilité système > 99.5%",
      "risques_phase": [{{"risk": "Pic d'incidents", "mitigation": "Plan de Bascule et Rollback prêt"}}],
      "dependances": ["UAT Validé", "Formation réalisée"]
    }},
    {{
      "phase": "Phase 8 : Run & Optimisation Continue",
      "description": "Mode BAU (Business As Usual), suivi des KPIs, MLOps pour éviter les dérives.",
      "charge_jours": 5,
      "charge_avec_buffer": 6,
      "budget_phase": "51 000 MAD",
      "profils": ["Data Scientist", "Service Delivery Mgr"],
      "key_actions": ["Suivi KPIs ROI", "Monitoring Model Drift", "Priorisation Backlog V2"],
      "livrables": ["Tableau de bord MLOps", "Bilan ROI M+6"],
      "go_no_go": "ROI positif atteint",
      "risques_phase": [{{"risk": "Model drift", "mitigation": "Alertes automatisées"}}],
      "dependances": ["Go-Live réussi"]
    }}
  ],

  "metriques_succes": {{
    "livraison": ["SPI EVM > 0.9", "0 Bug Critique en PROD"],
    "adoption_m3": ["Score adoption > 85%"],
    "impact_m6": ["ROI Validé"],
    "signal_abandon": "Variation budget > 20% ou taux utilisation < 30%"
  }},

  "estimated_timeline": "Total duration (e.g. 18 semaines)",
  "risks_and_mitigations": [
    {{"risk": "Résistance syndicale ou métier", "mitigation": "Plan de communication préventif requis"}},
    {{"risk": "Dépendance forte aux données ERP legacy", "mitigation": "Design de l'architecture d'intégration au tout début du projet"}}
  ]
}}

REMINDER: Adapt the JH and values to fit the complexity dynamically. Do NOT blindly copy the example numbers. Total JH should match the complexity scale.
"""
