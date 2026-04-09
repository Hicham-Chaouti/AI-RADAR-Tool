"""Benchmark evaluator — full IR metric suite for academic evaluation.

METRICS COMPUTED PER CASE
──────────────────────────
  Precision@K       share of returned results that match any expected use case
  Recall@K          share of expected use cases found in top-K
  Primary Recall@K  Recall@K restricted to priority=1 (must-have) use cases
  F1@K              harmonic mean of Precision@K and Recall@K
  Hit Rate@K        binary — at least one expected use case found in top-K
  MRR@K             reciprocal rank of the first relevant result in top-K

AGGREGATION ACROSS CASES
─────────────────────────
  All metrics are macro-averaged (mean over all benchmark cases).
  Per-sector aggregation is also computed to expose systematic weaknesses.

MATCHING STRATEGY
──────────────────
  A returned use case is a hit for an expected use case when its
  title + description + ai_solution (lowercased) contains at least one
  keyword from the expected use case's keyword list.
  Matching is case-insensitive substring search.
"""

from __future__ import annotations

import types
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.use_case import UseCase
from app.services.embedding_service import build_query_text
from app.services.rag_service import RAGService
from app.services.scoring_service import ScoringEngine
from evaluation.benchmark_dataset import BenchmarkCase, ExpectedUseCase


# ─── Result dataclasses ──────────────────────────────────────────────────────

@dataclass
class CaseMetrics:
    company: str
    sector: str
    k: int
    expected_count: int
    primary_expected_count: int       # priority=1 use cases only
    hits: int                         # expected use cases found in top-K
    primary_hits: int                 # priority=1 hits in top-K
    precision_at_k: float
    recall_at_k: float
    primary_recall_at_k: float        # Recall@K for must-have use cases only
    f1_at_k: float
    hit_rate: float                   # 1.0 if any hit, else 0.0
    mrr: float                        # reciprocal rank of first relevant result
    matched: list[str] = field(default_factory=list)
    missed: list[str] = field(default_factory=list)
    returned_titles: list[str] = field(default_factory=list)


@dataclass
class SectorSummary:
    sector: str
    n_cases: int
    mean_precision: float
    mean_recall: float
    mean_primary_recall: float
    mean_f1: float
    mean_hit_rate: float
    mean_mrr: float


@dataclass
class BenchmarkReport:
    k: int
    total_cases: int
    cases: list[CaseMetrics]
    # Macro-averaged (mean across all cases)
    macro_precision: float
    macro_recall: float
    macro_primary_recall: float
    macro_f1: float
    macro_hit_rate: float
    macro_mrr: float
    # Per-sector breakdown
    sector_summaries: list[SectorSummary] = field(default_factory=list)


# ─── Matching helpers ────────────────────────────────────────────────────────

def _searchable_text(uc: UseCase) -> str:
    return " ".join(filter(None, [
        uc.title,
        uc.description,
        uc.ai_solution,
    ])).lower()


def _matches(uc: UseCase, expected: ExpectedUseCase) -> bool:
    text = _searchable_text(uc)
    return any(kw in text for kw in expected.keywords)


def _build_mock_session(case: BenchmarkCase) -> types.SimpleNamespace:
    """Lightweight stand-in for the SQLAlchemy Session model."""
    return types.SimpleNamespace(
        sector=case.sector,
        capabilities=list(case.capabilities),
        strategic_objectives=list(case.strategic_objectives),
    )


# ─── Evaluator ───────────────────────────────────────────────────────────────

class BenchmarkEvaluator:
    """Runs the production recommendation pipeline against each benchmark case."""

    def __init__(
        self,
        rag: RAGService,
        scoring: ScoringEngine,
        db: AsyncSession,
    ) -> None:
        self._rag = rag
        self._scoring = scoring
        self._db = db

    async def evaluate_case(self, case: BenchmarkCase, k: int = 10) -> CaseMetrics:
        mock_session = _build_mock_session(case)

        query_text = build_query_text(
            sector=case.sector,
            capabilities=list(case.capabilities),
            objectives=list(case.strategic_objectives),
        )

        rag_results = await self._rag.query(
            query_text=query_text,
            sector_filter=None,
            top_k=30,
        )

        primary_expected = [e for e in case.expected if e.priority == 1]

        if not rag_results:
            return CaseMetrics(
                company=case.company,
                sector=case.sector,
                k=k,
                expected_count=len(case.expected),
                primary_expected_count=len(primary_expected),
                hits=0,
                primary_hits=0,
                precision_at_k=0.0,
                recall_at_k=0.0,
                primary_recall_at_k=0.0,
                f1_at_k=0.0,
                hit_rate=0.0,
                mrr=0.0,
                missed=[e.label for e in case.expected],
            )

        # Load use case rows from PostgreSQL
        uc_ids = [r["use_case_id"] for r in rag_results]
        db_result = await self._db.execute(
            select(UseCase).where(UseCase.id.in_(uc_ids))
        )
        use_cases_map: dict[str, UseCase] = {
            uc.id: uc for uc in db_result.scalars().all()
        }
        cosine_map = {r["use_case_id"]: r["score"] for r in rag_results}

        # Score all candidates
        from app.schemas.scoring import ScoringResult
        scored: list[ScoringResult] = []
        for uc_id, cosine_score in cosine_map.items():
            uc = use_cases_map.get(uc_id)
            if uc:
                sr = self._scoring.score(uc, mock_session, cosine_score)
                scored.append(sr)

        # Sort and take top-K
        scored.sort(key=lambda s: s.radar_score, reverse=True)
        top_k = scored[:k]
        top_k_ucs = [
            use_cases_map[sr.use_case_id]
            for sr in top_k
            if sr.use_case_id in use_cases_map
        ]
        returned_titles = [uc.title for uc in top_k_ucs]

        # ── Per-expected-use-case matching ───────────────────────────────────
        matched_labels: list[str] = []
        missed_labels: list[str] = []
        primary_hits = 0

        for exp in case.expected:
            if any(_matches(uc, exp) for uc in top_k_ucs):
                matched_labels.append(exp.label)
                if exp.priority == 1:
                    primary_hits += 1
            else:
                missed_labels.append(exp.label)

        hits = len(matched_labels)

        # ── Precision@K ──────────────────────────────────────────────────────
        # Among the K returned results, how many match at least one expected?
        relevant_returned = sum(
            1 for uc in top_k_ucs
            if any(_matches(uc, exp) for exp in case.expected)
        )
        precision_at_k = relevant_returned / k if k > 0 else 0.0

        # ── Recall@K ─────────────────────────────────────────────────────────
        recall_at_k = hits / len(case.expected) if case.expected else 0.0

        # ── Primary Recall@K ─────────────────────────────────────────────────
        primary_recall_at_k = (
            primary_hits / len(primary_expected) if primary_expected else 0.0
        )

        # ── F1@K ─────────────────────────────────────────────────────────────
        if precision_at_k + recall_at_k > 0:
            f1_at_k = 2 * precision_at_k * recall_at_k / (precision_at_k + recall_at_k)
        else:
            f1_at_k = 0.0

        # ── Hit Rate@K ───────────────────────────────────────────────────────
        hit_rate = 1.0 if hits > 0 else 0.0

        # ── MRR@K ────────────────────────────────────────────────────────────
        # Reciprocal rank of the first returned use case matching any expected.
        mrr = 0.0
        for rank, uc in enumerate(top_k_ucs, start=1):
            if any(_matches(uc, exp) for exp in case.expected):
                mrr = 1.0 / rank
                break

        return CaseMetrics(
            company=case.company,
            sector=case.sector,
            k=k,
            expected_count=len(case.expected),
            primary_expected_count=len(primary_expected),
            hits=hits,
            primary_hits=primary_hits,
            precision_at_k=round(precision_at_k, 4),
            recall_at_k=round(recall_at_k, 4),
            primary_recall_at_k=round(primary_recall_at_k, 4),
            f1_at_k=round(f1_at_k, 4),
            hit_rate=hit_rate,
            mrr=round(mrr, 4),
            matched=matched_labels,
            missed=missed_labels,
            returned_titles=returned_titles,
        )

    async def run_benchmark(
        self,
        cases: list[BenchmarkCase],
        k: int = 10,
    ) -> BenchmarkReport:
        results: list[CaseMetrics] = []
        for i, case in enumerate(cases, start=1):
            print(f"  [{i:>2}/{len(cases)}] {case.company} ({case.sector})")
            metrics = await self.evaluate_case(case, k=k)
            results.append(metrics)

        n = len(results)

        def _mean(attr: str) -> float:
            return round(sum(getattr(r, attr) for r in results) / n, 4)

        # Per-sector aggregation
        buckets: dict[str, list[CaseMetrics]] = {}
        for r in results:
            buckets.setdefault(r.sector, []).append(r)

        sector_summaries = []
        for sector, ms in sorted(buckets.items()):
            sn = len(ms)
            sector_summaries.append(SectorSummary(
                sector=sector,
                n_cases=sn,
                mean_precision=round(sum(m.precision_at_k for m in ms) / sn, 4),
                mean_recall=round(sum(m.recall_at_k for m in ms) / sn, 4),
                mean_primary_recall=round(sum(m.primary_recall_at_k for m in ms) / sn, 4),
                mean_f1=round(sum(m.f1_at_k for m in ms) / sn, 4),
                mean_hit_rate=round(sum(m.hit_rate for m in ms) / sn, 4),
                mean_mrr=round(sum(m.mrr for m in ms) / sn, 4),
            ))

        return BenchmarkReport(
            k=k,
            total_cases=n,
            cases=results,
            macro_precision=_mean("precision_at_k"),
            macro_recall=_mean("recall_at_k"),
            macro_primary_recall=_mean("primary_recall_at_k"),
            macro_f1=_mean("f1_at_k"),
            macro_hit_rate=_mean("hit_rate"),
            macro_mrr=_mean("mrr"),
            sector_summaries=sector_summaries,
        )
