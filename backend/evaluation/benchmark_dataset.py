"""Benchmark dataset for objective evaluation of the AI use case recommendation system.

DESIGN PRINCIPLES
─────────────────
• 80 benchmark cases spanning 13 sectors — large enough for per-sector statistical analysis
• Ground truth sourced from publicly documented AI initiatives of named companies
• Two priority tiers per expected use case:
    priority=1  (must-have)  — canonical, sector-defining use cases
    priority=2  (nice-to-have) — common but secondary use cases
• Keyword matching is substring-based against title + description + ai_solution (lowercased)
  so it is robust to title variation across DB versions

METRICS SUPPORTED
─────────────────
  Recall@K          — fraction of expected use cases found in top-K
  Primary Recall@K  — same, restricted to priority=1 cases only
  Precision@K       — fraction of returned results matching any expected use case
  F1@K              — harmonic mean of P@K and R@K
  Hit Rate@K        — binary: at least one expected use case found in top-K
  MRR@K             — reciprocal rank of the first relevant result in top-K
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ExpectedUseCase:
    """One expected use case for a benchmark entry.

    priority=1  must-have — system should almost always return this
    priority=2  nice-to-have — commonly relevant but not always top-ranked
    """

    label: str
    keywords: list[str] = field(default_factory=list)
    priority: int = 1  # 1 or 2


@dataclass(frozen=True)
class BenchmarkCase:
    """A synthetic client profile with ground-truth expected use cases."""

    company: str
    sector: str                     # Must match session sector IDs in business_rules.py
    capabilities: list[str]         # Must match CAPABILITY_KEYWORDS keys in scoring_service.py
    strategic_objectives: list[str]
    expected: list[ExpectedUseCase]


# ════════════════════════════════════════════════════════════════════════════
#  BANKING & FINANCE  (8 cases)
# ════════════════════════════════════════════════════════════════════════════

_BANKING = [

    BenchmarkCase(
        company="JPMorgan Chase",
        sector="banking_finance",
        capabilities=["ML", "Security", "Data"],
        strategic_objectives=["fraud detection", "anti-money laundering", "credit risk management"],
        expected=[
            ExpectedUseCase("Fraud detection",     ["fraud"],                           priority=1),
            ExpectedUseCase("AML",                 ["aml", "money laundering"],          priority=1),
            ExpectedUseCase("Credit scoring",      ["credit scor", "credit risk"],       priority=1),
            ExpectedUseCase("Risk scoring",        ["risk scor", "risk assess"],         priority=2),
            ExpectedUseCase("Algorithmic trading", ["trading", "algorithmic"],           priority=2),
        ],
    ),

    BenchmarkCase(
        company="BNP Paribas",
        sector="banking_finance",
        capabilities=["ML", "NLP", "Data"],
        strategic_objectives=["fraud prevention", "customer churn", "document processing"],
        expected=[
            ExpectedUseCase("Fraud detection",      ["fraud"],                           priority=1),
            ExpectedUseCase("Churn prediction",     ["churn", "attrition"],              priority=1),
            ExpectedUseCase("Document processing",  ["document", "contract"],            priority=1),
            ExpectedUseCase("Credit scoring",       ["credit scor", "credit risk"],      priority=2),
        ],
    ),

    BenchmarkCase(
        company="Goldman Sachs",
        sector="banking_finance",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["algorithmic trading", "risk scoring", "regulatory compliance"],
        expected=[
            ExpectedUseCase("Algorithmic trading",   ["trading", "algorithmic"],         priority=1),
            ExpectedUseCase("Risk scoring",          ["risk scor", "risk assess"],       priority=1),
            ExpectedUseCase("Compliance automation", ["compliance", "regulatory"],       priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                          priority=2),
        ],
    ),

    BenchmarkCase(
        company="HSBC",
        sector="banking_finance",
        capabilities=["ML", "Security", "Data"],
        strategic_objectives=["anti-money laundering", "fraud", "customer segmentation"],
        expected=[
            ExpectedUseCase("AML",                   ["aml", "money laundering"],        priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                          priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],        priority=2),
            ExpectedUseCase("Credit scoring",        ["credit scor", "credit risk"],     priority=2),
        ],
    ),

    BenchmarkCase(
        company="Revolut",
        sector="banking_finance",
        capabilities=["ML", "Security", "AI"],
        strategic_objectives=["fraud", "aml", "customer segmentation"],
        expected=[
            ExpectedUseCase("Fraud detection",       ["fraud"],                          priority=1),
            ExpectedUseCase("AML",                   ["aml", "money laundering"],        priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],        priority=2),
        ],
    ),

    BenchmarkCase(
        company="Crédit Agricole",
        sector="banking_finance",
        capabilities=["ML", "Data", "NLP"],
        strategic_objectives=["credit scoring", "fraud", "customer churn", "document processing"],
        expected=[
            ExpectedUseCase("Credit scoring",       ["credit scor", "credit risk"],      priority=1),
            ExpectedUseCase("Fraud detection",      ["fraud"],                           priority=1),
            ExpectedUseCase("Churn prediction",     ["churn", "attrition"],              priority=2),
            ExpectedUseCase("Document processing",  ["document", "contract"],            priority=2),
        ],
    ),

    BenchmarkCase(
        company="ING",
        sector="banking_finance",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["personalization", "fraud prevention", "customer segmentation"],
        expected=[
            ExpectedUseCase("Personalization",       ["personaliz"],                     priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                          priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],        priority=2),
        ],
    ),

    BenchmarkCase(
        company="Santander",
        sector="banking_finance",
        capabilities=["ML", "Data", "Security"],
        strategic_objectives=["credit scoring", "fraud", "aml", "customer segmentation"],
        expected=[
            ExpectedUseCase("Credit scoring",        ["credit scor", "credit risk"],     priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                          priority=1),
            ExpectedUseCase("AML",                   ["aml", "money laundering"],        priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],        priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  HEALTHCARE  (8 cases)
# ════════════════════════════════════════════════════════════════════════════

_HEALTHCARE = [

    BenchmarkCase(
        company="Pfizer",
        sector="healthcare",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["drug discovery", "clinical trial optimization", "pharmacovigilance"],
        expected=[
            ExpectedUseCase("Drug discovery",    ["drug discovery", "molecule", "drug design"],           priority=1),
            ExpectedUseCase("Clinical trial",    ["clinical trial", "clinical study"],                    priority=1),
            ExpectedUseCase("Pharmacovigilance", ["pharmacovigil", "adverse event", "drug safety"],       priority=1),
        ],
    ),

    BenchmarkCase(
        company="Roche",
        sector="healthcare",
        capabilities=["ML", "Computer Vision", "Data"],
        strategic_objectives=["medical imaging", "drug discovery", "clinical trial"],
        expected=[
            ExpectedUseCase("Medical imaging",  ["medical imaging", "radiology", "pathology"],            priority=1),
            ExpectedUseCase("Drug discovery",   ["drug discovery", "molecule", "drug design"],            priority=1),
            ExpectedUseCase("Clinical trial",   ["clinical trial", "clinical study"],                     priority=2),
        ],
    ),

    BenchmarkCase(
        company="Siemens Healthineers",
        sector="healthcare",
        capabilities=["Computer Vision", "ML", "AI"],
        strategic_objectives=["medical imaging", "diagnosis assistance", "patient flow"],
        expected=[
            ExpectedUseCase("Medical imaging",       ["medical imaging", "radiology", "pathology"],       priority=1),
            ExpectedUseCase("Diagnosis assistance",  ["diagnos", "clinical decision"],                    priority=1),
            ExpectedUseCase("Patient flow",          ["patient flow", "hospital capac", "patient predict"],priority=2),
        ],
    ),

    BenchmarkCase(
        company="Generic Hospital",
        sector="healthcare",
        capabilities=["ML", "Data", "Computer Vision"],
        strategic_objectives=["diagnosis", "patient flow", "resource optimization"],
        expected=[
            ExpectedUseCase("Diagnosis assistance",    ["diagnos", "clinical decision"],                  priority=1),
            ExpectedUseCase("Patient flow prediction", ["patient flow", "hospital capac"],                priority=1),
            ExpectedUseCase("Medical imaging",         ["medical imaging", "radiology", "pathology"],     priority=2),
        ],
    ),

    BenchmarkCase(
        company="Sanofi",
        sector="healthcare",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["drug discovery", "clinical trial", "pharmacovigilance"],
        expected=[
            ExpectedUseCase("Drug discovery",    ["drug discovery", "molecule", "drug design"],           priority=1),
            ExpectedUseCase("Clinical trial",    ["clinical trial", "clinical study"],                    priority=1),
            ExpectedUseCase("Pharmacovigilance", ["pharmacovigil", "adverse event", "drug safety"],       priority=2),
        ],
    ),

    BenchmarkCase(
        company="Novartis",
        sector="healthcare",
        capabilities=["ML", "Data", "GenAI"],
        strategic_objectives=["drug discovery", "genomics", "clinical trial"],
        expected=[
            ExpectedUseCase("Drug discovery",  ["drug discovery", "molecule", "drug design"],             priority=1),
            ExpectedUseCase("Clinical trial",  ["clinical trial", "clinical study"],                      priority=1),
            ExpectedUseCase("Genomics",        ["genom", "dna", "sequence"],                              priority=2),
        ],
    ),

    BenchmarkCase(
        company="AstraZeneca",
        sector="healthcare",
        capabilities=["ML", "AI", "Data"],
        strategic_objectives=["drug discovery", "clinical trial", "pharmacovigilance"],
        expected=[
            ExpectedUseCase("Drug discovery",    ["drug discovery", "molecule", "drug design"],           priority=1),
            ExpectedUseCase("Clinical trial",    ["clinical trial", "clinical study"],                    priority=1),
            ExpectedUseCase("Pharmacovigilance", ["pharmacovigil", "adverse event", "drug safety"],       priority=2),
        ],
    ),

    BenchmarkCase(
        company="Medtronic",
        sector="healthcare",
        capabilities=["IoT", "ML", "AI"],
        strategic_objectives=["predictive maintenance", "patient monitoring", "medical device"],
        expected=[
            ExpectedUseCase("Patient monitoring",     ["patient monitor", "remote monitor", "wearable"],  priority=1),
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Medical imaging",        ["medical imaging", "radiology"],                   priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  MANUFACTURING  (8 cases)
# ════════════════════════════════════════════════════════════════════════════

_MANUFACTURING = [

    BenchmarkCase(
        company="Airbus",
        sector="manufacturing",
        capabilities=["IoT", "ML", "Computer Vision"],
        strategic_objectives=["predictive maintenance", "quality inspection", "supply chain"],
        expected=[
            ExpectedUseCase("Predictive maintenance",    ["predictive maintenance", "pdm"],               priority=1),
            ExpectedUseCase("Quality inspection",        ["quality", "defect", "inspection"],             priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                                priority=2),
        ],
    ),

    BenchmarkCase(
        company="Siemens",
        sector="manufacturing",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "digital twin", "quality control"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Digital twin",           ["digital twin"],                                   priority=1),
            ExpectedUseCase("Quality control",        ["quality control", "quality inspection"],          priority=2),
        ],
    ),

    BenchmarkCase(
        company="Bosch",
        sector="manufacturing",
        capabilities=["IoT", "ML", "Computer Vision"],
        strategic_objectives=["predictive maintenance", "quality control", "supply chain"],
        expected=[
            ExpectedUseCase("Predictive maintenance",    ["predictive maintenance", "pdm"],               priority=1),
            ExpectedUseCase("Quality control",           ["quality control", "quality inspection"],       priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                                priority=2),
        ],
    ),

    BenchmarkCase(
        company="General Electric",
        sector="manufacturing",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "digital twin", "anomaly detection"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Digital twin",           ["digital twin"],                                   priority=1),
            ExpectedUseCase("Anomaly detection",      ["anomaly", "anomalies", "outlier"],                priority=2),
        ],
    ),

    BenchmarkCase(
        company="Michelin",
        sector="manufacturing",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "quality control", "demand forecasting"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Quality control",        ["quality"],                                        priority=1),
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],              priority=2),
        ],
    ),

    BenchmarkCase(
        company="Danone",
        sector="manufacturing",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["demand forecasting", "supply chain", "quality control"],
        expected=[
            ExpectedUseCase("Demand forecasting",        ["demand forecast", "demand predict"],          priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                               priority=1),
            ExpectedUseCase("Quality control",           ["quality"],                                    priority=2),
        ],
    ),

    BenchmarkCase(
        company="ArcelorMittal",
        sector="manufacturing",
        capabilities=["IoT", "ML", "Computer Vision"],
        strategic_objectives=["predictive maintenance", "quality inspection", "energy optimization"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Quality inspection",     ["quality", "defect", "inspection"],               priority=1),
            ExpectedUseCase("Energy optimization",    ["energy optimiz", "energy effic"],                priority=2),
        ],
    ),

    BenchmarkCase(
        company="3M",
        sector="manufacturing",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["quality control", "supply chain optimization", "demand forecasting"],
        expected=[
            ExpectedUseCase("Quality control",           ["quality"],                                    priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                               priority=1),
            ExpectedUseCase("Demand forecasting",        ["demand forecast", "demand predict"],          priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  RETAIL & E-COMMERCE  (8 cases)
# ════════════════════════════════════════════════════════════════════════════

_RETAIL = [

    BenchmarkCase(
        company="Amazon",
        sector="retail_ecommerce",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["recommendation system", "demand forecasting", "fraud detection"],
        expected=[
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=1),
            ExpectedUseCase("Demand forecasting",    ["demand forecast", "demand predict"],              priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                                          priority=2),
        ],
    ),

    BenchmarkCase(
        company="Walmart",
        sector="retail_ecommerce",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["inventory optimization", "demand forecasting", "price optimization"],
        expected=[
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],             priority=1),
            ExpectedUseCase("Inventory optimization", ["inventory", "stock optimiz"],                    priority=1),
            ExpectedUseCase("Price optimization",     ["price optimiz", "dynamic pricing", "pricing"],   priority=2),
        ],
    ),

    BenchmarkCase(
        company="Sephora",
        sector="retail_ecommerce",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["personalization", "customer segmentation", "demand forecasting"],
        expected=[
            ExpectedUseCase("Personalization",        ["personaliz"],                                    priority=1),
            ExpectedUseCase("Customer segmentation",  ["segmentation", "segment"],                       priority=1),
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],             priority=2),
        ],
    ),

    BenchmarkCase(
        company="Inditex / Zara",
        sector="retail_ecommerce",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["demand forecasting", "inventory optimization", "trend prediction"],
        expected=[
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],             priority=1),
            ExpectedUseCase("Inventory optimization", ["inventory", "stock optimiz"],                    priority=1),
            ExpectedUseCase("Trend prediction",       ["trend", "fashion trend"],                        priority=2),
        ],
    ),

    BenchmarkCase(
        company="Carrefour",
        sector="retail_ecommerce",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["demand forecasting", "price optimization", "customer segmentation"],
        expected=[
            ExpectedUseCase("Demand forecasting",    ["demand forecast", "demand predict"],              priority=1),
            ExpectedUseCase("Price optimization",    ["price optimiz", "dynamic pricing", "pricing"],    priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],                        priority=2),
        ],
    ),

    BenchmarkCase(
        company="H&M",
        sector="retail_ecommerce",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["demand forecasting", "inventory optimization", "personalization"],
        expected=[
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],             priority=1),
            ExpectedUseCase("Inventory optimization", ["inventory", "stock optimiz"],                    priority=1),
            ExpectedUseCase("Personalization",        ["personaliz"],                                    priority=2),
        ],
    ),

    BenchmarkCase(
        company="Decathlon",
        sector="retail_ecommerce",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["demand forecasting", "inventory optimization", "price optimization"],
        expected=[
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],             priority=1),
            ExpectedUseCase("Inventory optimization", ["inventory", "stock optimiz"],                    priority=1),
            ExpectedUseCase("Price optimization",     ["price optimiz", "dynamic pricing", "pricing"],   priority=2),
        ],
    ),

    BenchmarkCase(
        company="L'Oréal",
        sector="retail_ecommerce",
        capabilities=["Data", "ML", "GenAI"],
        strategic_objectives=["personalization", "demand forecasting", "product recommendation"],
        expected=[
            ExpectedUseCase("Personalization",       ["personaliz"],                                     priority=1),
            ExpectedUseCase("Demand forecasting",    ["demand forecast", "demand predict"],              priority=1),
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  ENERGY & UTILITIES  (6 cases)
# ════════════════════════════════════════════════════════════════════════════

_ENERGY = [

    BenchmarkCase(
        company="EDF",
        sector="energy_utilities",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "energy forecasting", "anomaly detection"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Energy forecasting",     ["energy forecast", "load forecast", "power forecast"], priority=1),
            ExpectedUseCase("Anomaly detection",      ["anomaly", "anomalies", "outlier"],                priority=2),
        ],
    ),

    BenchmarkCase(
        company="Shell",
        sector="energy_utilities",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "energy optimization", "safety monitoring"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Energy optimization",    ["energy optimiz", "energy effic"],                priority=1),
            ExpectedUseCase("Safety monitoring",      ["safety", "anomaly", "risk"],                     priority=2),
        ],
    ),

    BenchmarkCase(
        company="TotalEnergies",
        sector="energy_utilities",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "energy forecasting", "environmental monitoring"],
        expected=[
            ExpectedUseCase("Predictive maintenance",      ["predictive maintenance", "pdm"],             priority=1),
            ExpectedUseCase("Energy forecasting",          ["energy forecast", "load forecast"],         priority=1),
            ExpectedUseCase("Environmental monitoring",    ["environment", "emission", "carbon"],         priority=2),
        ],
    ),

    BenchmarkCase(
        company="Engie",
        sector="energy_utilities",
        capabilities=["IoT", "Data", "ML"],
        strategic_objectives=["energy forecasting", "predictive maintenance", "smart grid"],
        expected=[
            ExpectedUseCase("Energy forecasting",     ["energy forecast", "load forecast"],              priority=1),
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Smart grid",             ["smart grid", "grid optimiz"],                    priority=2),
        ],
    ),

    BenchmarkCase(
        company="Vestas",
        sector="energy_utilities",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "energy forecasting", "digital twin"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Energy forecasting",     ["energy forecast", "wind forecast"],              priority=1),
            ExpectedUseCase("Digital twin",           ["digital twin"],                                   priority=2),
        ],
    ),

    BenchmarkCase(
        company="Schneider Electric",
        sector="energy_utilities",
        capabilities=["IoT", "Data", "ML"],
        strategic_objectives=["energy optimization", "predictive maintenance", "anomaly detection"],
        expected=[
            ExpectedUseCase("Energy optimization",    ["energy optimiz", "energy effic"],                priority=1),
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Anomaly detection",      ["anomaly", "anomalies", "outlier"],               priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  TELECOM  (6 cases)
# ════════════════════════════════════════════════════════════════════════════

_TELECOM = [

    BenchmarkCase(
        company="Orange",
        sector="telecom",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["churn prediction", "network optimization", "customer segmentation"],
        expected=[
            ExpectedUseCase("Churn prediction",       ["churn", "attrition"],                            priority=1),
            ExpectedUseCase("Network optimization",   ["network optimiz", "network manag"],              priority=1),
            ExpectedUseCase("Customer segmentation",  ["segmentation", "segment"],                       priority=2),
        ],
    ),

    BenchmarkCase(
        company="Vodafone",
        sector="telecom",
        capabilities=["Data", "ML", "Security"],
        strategic_objectives=["churn prediction", "fraud detection", "network optimization"],
        expected=[
            ExpectedUseCase("Churn prediction",     ["churn", "attrition"],                              priority=1),
            ExpectedUseCase("Fraud detection",      ["fraud"],                                           priority=1),
            ExpectedUseCase("Network optimization", ["network optimiz", "network manag"],                priority=2),
        ],
    ),

    BenchmarkCase(
        company="AT&T",
        sector="telecom",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["network optimization", "churn prediction", "customer segmentation"],
        expected=[
            ExpectedUseCase("Network optimization",  ["network optimiz", "network manag"],               priority=1),
            ExpectedUseCase("Churn prediction",      ["churn", "attrition"],                             priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],                        priority=2),
        ],
    ),

    BenchmarkCase(
        company="Verizon",
        sector="telecom",
        capabilities=["Data", "ML", "Security"],
        strategic_objectives=["network optimization", "fraud detection", "customer segmentation"],
        expected=[
            ExpectedUseCase("Network optimization",  ["network optimiz", "network manag"],               priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                                          priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],                        priority=2),
        ],
    ),

    BenchmarkCase(
        company="Deutsche Telekom",
        sector="telecom",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["churn prediction", "network optimization", "customer segmentation"],
        expected=[
            ExpectedUseCase("Churn prediction",      ["churn", "attrition"],                             priority=1),
            ExpectedUseCase("Network optimization",  ["network optimiz", "network manag"],               priority=1),
            ExpectedUseCase("Customer segmentation", ["segmentation", "segment"],                        priority=2),
        ],
    ),

    BenchmarkCase(
        company="Telefónica",
        sector="telecom",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["churn", "network optimization", "customer segmentation"],
        expected=[
            ExpectedUseCase("Churn prediction",      ["churn", "attrition"],                             priority=1),
            ExpectedUseCase("Network optimization",  ["network optimiz", "network manag"],               priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                                          priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  INSURANCE  (6 cases)
# ════════════════════════════════════════════════════════════════════════════

_INSURANCE = [

    BenchmarkCase(
        company="AXA",
        sector="insurance",
        capabilities=["ML", "Data", "RPA"],
        strategic_objectives=["claims automation", "fraud detection", "risk scoring"],
        expected=[
            ExpectedUseCase("Claims automation", ["claims", "claim process", "claim automat"],           priority=1),
            ExpectedUseCase("Fraud detection",   ["fraud"],                                              priority=1),
            ExpectedUseCase("Risk scoring",      ["risk scor", "underwriting"],                          priority=2),
        ],
    ),

    BenchmarkCase(
        company="Allianz",
        sector="insurance",
        capabilities=["ML", "Data", "NLP"],
        strategic_objectives=["claims automation", "fraud detection", "risk scoring"],
        expected=[
            ExpectedUseCase("Claims automation", ["claims", "claim process", "claim automat"],           priority=1),
            ExpectedUseCase("Fraud detection",   ["fraud"],                                              priority=1),
            ExpectedUseCase("Risk scoring",      ["risk scor", "underwriting"],                          priority=2),
        ],
    ),

    BenchmarkCase(
        company="Generali",
        sector="insurance",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["claims automation", "fraud detection", "underwriting automation"],
        expected=[
            ExpectedUseCase("Claims automation",       ["claims", "claim process"],                      priority=1),
            ExpectedUseCase("Fraud detection",         ["fraud"],                                        priority=1),
            ExpectedUseCase("Underwriting automation", ["underwriting"],                                  priority=2),
        ],
    ),

    BenchmarkCase(
        company="Swiss Re",
        sector="insurance",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["risk scoring", "claims automation", "fraud detection"],
        expected=[
            ExpectedUseCase("Risk scoring",      ["risk scor", "underwriting"],                          priority=1),
            ExpectedUseCase("Claims automation", ["claims", "claim process"],                            priority=1),
            ExpectedUseCase("Fraud detection",   ["fraud"],                                              priority=2),
        ],
    ),

    BenchmarkCase(
        company="Zurich Insurance",
        sector="insurance",
        capabilities=["ML", "Data", "RPA"],
        strategic_objectives=["claims automation", "risk scoring", "fraud detection"],
        expected=[
            ExpectedUseCase("Claims automation", ["claims", "claim process"],                            priority=1),
            ExpectedUseCase("Risk scoring",      ["risk scor", "underwriting"],                          priority=1),
            ExpectedUseCase("Fraud detection",   ["fraud"],                                              priority=2),
        ],
    ),

    BenchmarkCase(
        company="Aon",
        sector="insurance",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["risk scoring", "fraud detection", "claims automation"],
        expected=[
            ExpectedUseCase("Risk scoring",      ["risk scor", "underwriting"],                          priority=1),
            ExpectedUseCase("Fraud detection",   ["fraud"],                                              priority=1),
            ExpectedUseCase("Claims automation", ["claims", "claim process"],                            priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  TRANSPORTATION & LOGISTICS  (6 cases)
# ════════════════════════════════════════════════════════════════════════════

_TRANSPORT = [

    BenchmarkCase(
        company="DHL",
        sector="transportation_logistics",
        capabilities=["Data", "ML", "IoT"],
        strategic_objectives=["route optimization", "demand forecasting", "supply chain"],
        expected=[
            ExpectedUseCase("Route optimization",        ["route optimiz", "fleet optimiz", "delivery optimiz"], priority=1),
            ExpectedUseCase("Demand forecasting",        ["demand forecast", "demand predict"],               priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                                    priority=2),
        ],
    ),

    BenchmarkCase(
        company="Maersk",
        sector="transportation_logistics",
        capabilities=["Data", "ML", "IoT"],
        strategic_objectives=["supply chain optimization", "demand forecasting", "predictive maintenance"],
        expected=[
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                                    priority=1),
            ExpectedUseCase("Demand forecasting",        ["demand forecast", "demand predict"],               priority=1),
            ExpectedUseCase("Predictive maintenance",    ["predictive maintenance", "pdm"],                   priority=2),
        ],
    ),

    BenchmarkCase(
        company="FedEx",
        sector="transportation_logistics",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["route optimization", "demand forecasting", "fraud detection"],
        expected=[
            ExpectedUseCase("Route optimization", ["route optimiz", "fleet optimiz", "delivery optimiz"],    priority=1),
            ExpectedUseCase("Demand forecasting", ["demand forecast", "demand predict"],                     priority=1),
            ExpectedUseCase("Fraud detection",    ["fraud"],                                                 priority=2),
        ],
    ),

    BenchmarkCase(
        company="SNCF",
        sector="transportation_logistics",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "demand forecasting", "route optimization"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                     priority=1),
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],                 priority=1),
            ExpectedUseCase("Route optimization",     ["route optimiz", "fleet optimiz"],                    priority=2),
        ],
    ),

    BenchmarkCase(
        company="Uber",
        sector="transportation_logistics",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["demand forecasting", "route optimization", "fraud detection"],
        expected=[
            ExpectedUseCase("Demand forecasting",  ["demand forecast", "demand predict"],                    priority=1),
            ExpectedUseCase("Route optimization",  ["route optimiz", "fleet optimiz"],                       priority=1),
            ExpectedUseCase("Fraud detection",     ["fraud"],                                                priority=2),
        ],
    ),

    BenchmarkCase(
        company="Lufthansa",
        sector="transportation_logistics",
        capabilities=["IoT", "Data", "ML"],
        strategic_objectives=["predictive maintenance", "demand forecasting", "price optimization"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                     priority=1),
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],                 priority=1),
            ExpectedUseCase("Price optimization",     ["price optimiz", "dynamic pricing"],                  priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  MEDIA & ENTERTAINMENT  (6 cases)
# ════════════════════════════════════════════════════════════════════════════

_MEDIA = [

    BenchmarkCase(
        company="Netflix",
        sector="media_entertainment",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["recommendation", "content personalization", "churn prediction"],
        expected=[
            ExpectedUseCase("Recommendation system",  ["recommendation", "recommender"],                 priority=1),
            ExpectedUseCase("Content personalization",["personaliz"],                                    priority=1),
            ExpectedUseCase("Churn prediction",       ["churn", "attrition"],                            priority=2),
        ],
    ),

    BenchmarkCase(
        company="Spotify",
        sector="media_entertainment",
        capabilities=["ML", "Data", "NLP"],
        strategic_objectives=["recommendation", "content personalization", "churn prediction"],
        expected=[
            ExpectedUseCase("Recommendation system",  ["recommendation", "recommender"],                 priority=1),
            ExpectedUseCase("Content personalization",["personaliz"],                                    priority=1),
            ExpectedUseCase("Churn prediction",       ["churn", "attrition"],                            priority=2),
        ],
    ),

    BenchmarkCase(
        company="Disney",
        sector="media_entertainment",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["content personalization", "recommendation", "churn prediction"],
        expected=[
            ExpectedUseCase("Content personalization",["personaliz"],                                    priority=1),
            ExpectedUseCase("Recommendation system",  ["recommendation", "recommender"],                 priority=1),
            ExpectedUseCase("Churn prediction",       ["churn", "attrition"],                            priority=2),
        ],
    ),

    BenchmarkCase(
        company="YouTube",
        sector="media_entertainment",
        capabilities=["ML", "Data", "Computer Vision"],
        strategic_objectives=["recommendation", "content moderation", "ad targeting"],
        expected=[
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=1),
            ExpectedUseCase("Content moderation",    ["moderation", "content filter", "harmful"],        priority=1),
            ExpectedUseCase("Ad targeting",          ["ad target", "advertising", "audience target"],    priority=2),
        ],
    ),

    BenchmarkCase(
        company="TikTok",
        sector="media_entertainment",
        capabilities=["ML", "Data", "Computer Vision"],
        strategic_objectives=["recommendation", "content moderation", "ad targeting"],
        expected=[
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=1),
            ExpectedUseCase("Content moderation",    ["moderation", "content filter", "harmful"],        priority=1),
            ExpectedUseCase("Ad targeting",          ["ad target", "advertising", "audience target"],    priority=2),
        ],
    ),

    BenchmarkCase(
        company="Vivendi",
        sector="media_entertainment",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["content personalization", "churn prediction", "recommendation"],
        expected=[
            ExpectedUseCase("Content personalization",["personaliz"],                                    priority=1),
            ExpectedUseCase("Churn prediction",       ["churn", "attrition"],                            priority=1),
            ExpectedUseCase("Recommendation system",  ["recommendation", "recommender"],                 priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  AUTOMOTIVE & MOBILITY  (6 cases)
# ════════════════════════════════════════════════════════════════════════════

_AUTOMOTIVE = [

    BenchmarkCase(
        company="Tesla",
        sector="automotive_mobility",
        capabilities=["ML", "Computer Vision", "IoT"],
        strategic_objectives=["autonomous driving", "predictive maintenance", "quality control"],
        expected=[
            ExpectedUseCase("Autonomous driving",     ["autonomous", "self-driving"],                    priority=1),
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Quality control",        ["quality"],                                        priority=2),
        ],
    ),

    BenchmarkCase(
        company="BMW",
        sector="automotive_mobility",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "quality control", "supply chain"],
        expected=[
            ExpectedUseCase("Predictive maintenance",    ["predictive maintenance", "pdm"],              priority=1),
            ExpectedUseCase("Quality control",           ["quality"],                                    priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                               priority=2),
        ],
    ),

    BenchmarkCase(
        company="Toyota",
        sector="automotive_mobility",
        capabilities=["IoT", "ML", "Computer Vision"],
        strategic_objectives=["predictive maintenance", "quality control", "supply chain"],
        expected=[
            ExpectedUseCase("Predictive maintenance",    ["predictive maintenance", "pdm"],              priority=1),
            ExpectedUseCase("Quality control",           ["quality"],                                    priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                               priority=2),
        ],
    ),

    BenchmarkCase(
        company="Renault",
        sector="automotive_mobility",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "quality control", "demand forecasting"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Quality control",        ["quality"],                                        priority=1),
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],              priority=2),
        ],
    ),

    BenchmarkCase(
        company="Stellantis",
        sector="automotive_mobility",
        capabilities=["IoT", "ML", "Data"],
        strategic_objectives=["predictive maintenance", "quality control", "supply chain"],
        expected=[
            ExpectedUseCase("Predictive maintenance",    ["predictive maintenance", "pdm"],              priority=1),
            ExpectedUseCase("Quality control",           ["quality"],                                    priority=1),
            ExpectedUseCase("Supply chain optimization", ["supply chain"],                               priority=2),
        ],
    ),

    BenchmarkCase(
        company="Valeo",
        sector="automotive_mobility",
        capabilities=["Computer Vision", "ML", "IoT"],
        strategic_objectives=["autonomous driving", "quality control", "predictive maintenance"],
        expected=[
            ExpectedUseCase("Autonomous driving",     ["autonomous", "self-driving", "adas"],            priority=1),
            ExpectedUseCase("Quality control",        ["quality"],                                        priority=1),
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  PUBLIC SECTOR  (4 cases)
# ════════════════════════════════════════════════════════════════════════════

_PUBLIC = [

    BenchmarkCase(
        company="Generic Tax Authority",
        sector="public_sector",
        capabilities=["ML", "Data", "NLP"],
        strategic_objectives=["fraud detection", "document processing", "customer segmentation"],
        expected=[
            ExpectedUseCase("Fraud detection",      ["fraud"],                                           priority=1),
            ExpectedUseCase("Document processing",  ["document", "contract"],                            priority=1),
            ExpectedUseCase("Customer segmentation",["segmentation", "segment"],                         priority=2),
        ],
    ),

    BenchmarkCase(
        company="Generic Police / Security Agency",
        sector="public_sector",
        capabilities=["Computer Vision", "ML", "Data"],
        strategic_objectives=["fraud detection", "anomaly detection", "video surveillance"],
        expected=[
            ExpectedUseCase("Fraud detection",    ["fraud"],                                             priority=1),
            ExpectedUseCase("Anomaly detection",  ["anomaly", "anomalies", "outlier"],                   priority=1),
            ExpectedUseCase("Video surveillance", ["video", "surveillance", "cctv"],                     priority=2),
        ],
    ),

    BenchmarkCase(
        company="Generic City Council",
        sector="public_sector",
        capabilities=["Data", "ML", "IoT"],
        strategic_objectives=["demand forecasting", "route optimization", "resource optimization"],
        expected=[
            ExpectedUseCase("Demand forecasting",  ["demand forecast", "demand predict"],                priority=1),
            ExpectedUseCase("Route optimization",  ["route optimiz", "fleet optimiz"],                   priority=1),
            ExpectedUseCase("Resource optimization",["resource optimiz", "resource alloc"],              priority=2),
        ],
    ),

    BenchmarkCase(
        company="Generic Social Services",
        sector="public_sector",
        capabilities=["Data", "NLP", "ML"],
        strategic_objectives=["document processing", "demand forecasting", "resource optimization"],
        expected=[
            ExpectedUseCase("Document processing",  ["document", "contract"],                            priority=1),
            ExpectedUseCase("Demand forecasting",   ["demand forecast", "demand predict"],               priority=1),
            ExpectedUseCase("Resource optimization",["resource optimiz", "resource alloc"],              priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  EDUCATION  (4 cases)
# ════════════════════════════════════════════════════════════════════════════

_EDUCATION = [

    BenchmarkCase(
        company="Coursera",
        sector="education",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["recommendation", "personalization", "churn prediction"],
        expected=[
            ExpectedUseCase("Recommendation system",["recommendation", "recommender"],                   priority=1),
            ExpectedUseCase("Personalization",       ["personaliz"],                                     priority=1),
            ExpectedUseCase("Churn prediction",      ["churn", "attrition"],                             priority=2),
        ],
    ),

    BenchmarkCase(
        company="Duolingo",
        sector="education",
        capabilities=["ML", "NLP", "Data"],
        strategic_objectives=["personalization", "churn prediction", "recommendation"],
        expected=[
            ExpectedUseCase("Personalization",       ["personaliz"],                                     priority=1),
            ExpectedUseCase("Churn prediction",      ["churn", "attrition"],                             priority=1),
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=2),
        ],
    ),

    BenchmarkCase(
        company="Generic University",
        sector="education",
        capabilities=["Data", "ML", "NLP"],
        strategic_objectives=["student churn", "recommendation", "document processing"],
        expected=[
            ExpectedUseCase("Churn prediction",     ["churn", "attrition"],                              priority=1),
            ExpectedUseCase("Recommendation system",["recommendation", "recommender"],                   priority=1),
            ExpectedUseCase("Document processing",  ["document", "contract"],                            priority=2),
        ],
    ),

    BenchmarkCase(
        company="Khan Academy",
        sector="education",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["personalization", "recommendation", "student engagement"],
        expected=[
            ExpectedUseCase("Personalization",       ["personaliz"],                                     priority=1),
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=1),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  TRAVEL & HOSPITALITY  (4 cases)
# ════════════════════════════════════════════════════════════════════════════

_TRAVEL = [

    BenchmarkCase(
        company="Airbnb",
        sector="travel_hospitality",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["recommendation", "fraud detection", "price optimization"],
        expected=[
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                                          priority=1),
            ExpectedUseCase("Price optimization",    ["price optimiz", "dynamic pricing"],               priority=2),
        ],
    ),

    BenchmarkCase(
        company="Booking.com",
        sector="travel_hospitality",
        capabilities=["ML", "Data", "AI"],
        strategic_objectives=["recommendation", "price optimization", "fraud detection"],
        expected=[
            ExpectedUseCase("Recommendation system", ["recommendation", "recommender"],                  priority=1),
            ExpectedUseCase("Price optimization",    ["price optimiz", "dynamic pricing"],               priority=1),
            ExpectedUseCase("Fraud detection",       ["fraud"],                                          priority=2),
        ],
    ),

    BenchmarkCase(
        company="Marriott",
        sector="travel_hospitality",
        capabilities=["Data", "ML", "AI"],
        strategic_objectives=["price optimization", "personalization", "demand forecasting"],
        expected=[
            ExpectedUseCase("Price optimization",    ["price optimiz", "dynamic pricing"],               priority=1),
            ExpectedUseCase("Personalization",       ["personaliz"],                                     priority=1),
            ExpectedUseCase("Demand forecasting",    ["demand forecast", "demand predict"],              priority=2),
        ],
    ),

    BenchmarkCase(
        company="Air France",
        sector="travel_hospitality",
        capabilities=["IoT", "Data", "ML"],
        strategic_objectives=["predictive maintenance", "price optimization", "demand forecasting"],
        expected=[
            ExpectedUseCase("Predictive maintenance", ["predictive maintenance", "pdm"],                  priority=1),
            ExpectedUseCase("Price optimization",     ["price optimiz", "dynamic pricing"],               priority=1),
            ExpectedUseCase("Demand forecasting",     ["demand forecast", "demand predict"],              priority=2),
        ],
    ),
]

# ════════════════════════════════════════════════════════════════════════════
#  MASTER LIST  (80 cases total)
# ════════════════════════════════════════════════════════════════════════════

BENCHMARK_CASES: list[BenchmarkCase] = (
    _BANKING       # 8
    + _HEALTHCARE  # 8
    + _MANUFACTURING  # 8
    + _RETAIL      # 8
    + _ENERGY      # 6
    + _TELECOM     # 6
    + _INSURANCE   # 6
    + _TRANSPORT   # 6
    + _MEDIA       # 6
    + _AUTOMOTIVE  # 6
    + _PUBLIC      # 4
    + _EDUCATION   # 4
    + _TRAVEL      # 4
)  # = 80 benchmark cases
