"""CLI runner for the benchmark evaluation.

Usage (from the backend/ directory):
    python -m evaluation.run_benchmark              # Top-10, summary only
    python -m evaluation.run_benchmark --k 5        # Top-5 cutoff
    python -m evaluation.run_benchmark --both       # Run at K=5 and K=10
    python -m evaluation.run_benchmark --verbose    # Per-case detail
    python -m evaluation.run_benchmark --sector telecom  # Single sector

Requirements:
    - PostgreSQL and Qdrant must be running and seeded
    - .env at project root
    - Embedding model loaded (first run may be slow)
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from dotenv import load_dotenv

# ─── Path setup ──────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from qdrant_client import QdrantClient                               # noqa: E402
from app.config import settings                                      # noqa: E402
from app.models.database import async_session_factory               # noqa: E402
from app.services.embedding_service import wait_for_model           # noqa: E402
from app.services.rag_service import RAGService                     # noqa: E402
from app.services.scoring_service import ScoringEngine              # noqa: E402
from evaluation.benchmark_dataset import BENCHMARK_CASES            # noqa: E402
from evaluation.evaluator import (                                   # noqa: E402
    BenchmarkEvaluator,
    BenchmarkReport,
    CaseMetrics,
    SectorSummary,
)


# ─── Formatting helpers ──────────────────────────────────────────────────────

def _bar(value: float, width: int = 15) -> str:
    filled = int(round(value * width))
    return "[" + "█" * filled + "░" * (width - filled) + "]"


def _fmt(value: float) -> str:
    return f"{value:.3f}"


# ─── Report sections ─────────────────────────────────────────────────────────

def _print_global_summary(report: BenchmarkReport) -> None:
    k = report.k
    w = 72
    print(f"\n{'═' * w}")
    print(f"  AI RADAR  —  Benchmark Evaluation Report  (Top-{k})")
    print(f"  {report.total_cases} cases  ·  13 sectors")
    print(f"{'═' * w}")

    rows = [
        ("Precision@K",       report.macro_precision),
        ("Recall@K",          report.macro_recall),
        ("Primary Recall@K",  report.macro_primary_recall),
        ("F1@K",              report.macro_f1),
        ("Hit Rate@K",        report.macro_hit_rate),
        ("MRR@K",             report.macro_mrr),
    ]
    for label, value in rows:
        print(f"  {label:<20} {_fmt(value)}  {_bar(value)}")
    print(f"{'═' * w}")


def _print_sector_table(summaries: list[SectorSummary]) -> None:
    print(f"\n  Per-sector breakdown")
    header = (
        f"  {'Sector':<28} {'N':>3}  {'P@K':>6}  {'R@K':>6}  "
        f"{'P-R@K':>6}  {'F1':>6}  {'HR':>6}  {'MRR':>6}"
    )
    print(header)
    print("  " + "─" * 70)
    for s in summaries:
        print(
            f"  {s.sector:<28} {s.n_cases:>3}  "
            f"{_fmt(s.mean_precision):>6}  {_fmt(s.mean_recall):>6}  "
            f"{_fmt(s.mean_primary_recall):>6}  {_fmt(s.mean_f1):>6}  "
            f"{_fmt(s.mean_hit_rate):>6}  {_fmt(s.mean_mrr):>6}"
        )
    print()


def _print_case_table(cases: list[CaseMetrics], verbose: bool) -> None:
    print(f"\n  Per-case results")
    header = (
        f"  {'Company':<24} {'Sector':<26} {'Hits':>5}  "
        f"{'P@K':>6}  {'R@K':>6}  {'F1':>6}  {'MRR':>6}"
    )
    print(header)
    print("  " + "─" * 78)

    for m in cases:
        hit_str = f"{m.hits}/{m.expected_count}"
        print(
            f"  {m.company:<24} {m.sector:<26} {hit_str:>5}  "
            f"{_fmt(m.precision_at_k):>6}  {_fmt(m.recall_at_k):>6}  "
            f"{_fmt(m.f1_at_k):>6}  {_fmt(m.mrr):>6}"
        )

        if verbose:
            if m.matched:
                print(f"    {'✓':>3} {', '.join(m.matched)}")
            if m.missed:
                print(f"    {'✗':>3} {', '.join(m.missed)}")
            if m.returned_titles:
                preview = " | ".join(m.returned_titles[:5])
                print(f"    {'↳':>3} {preview}")
            print()

    print()


def print_report(report: BenchmarkReport, verbose: bool = False) -> None:
    _print_global_summary(report)
    _print_sector_table(report.sector_summaries)
    _print_case_table(report.cases, verbose=verbose)


def print_comparison(report5: BenchmarkReport, report10: BenchmarkReport) -> None:
    """Side-by-side K=5 vs K=10 comparison table."""
    w = 72
    print(f"\n{'═' * w}")
    print(f"  K=5 vs K=10 Comparison  ({report5.total_cases} cases)")
    print(f"{'═' * w}")
    header = f"  {'Metric':<22}  {'K=5':>8}  {'K=10':>8}  {'Δ':>8}"
    print(header)
    print("  " + "─" * 50)

    pairs = [
        ("Precision@K",       report5.macro_precision,       report10.macro_precision),
        ("Recall@K",          report5.macro_recall,          report10.macro_recall),
        ("Primary Recall@K",  report5.macro_primary_recall,  report10.macro_primary_recall),
        ("F1@K",              report5.macro_f1,              report10.macro_f1),
        ("Hit Rate@K",        report5.macro_hit_rate,        report10.macro_hit_rate),
        ("MRR@K",             report5.macro_mrr,             report10.macro_mrr),
    ]
    for label, v5, v10 in pairs:
        delta = v10 - v5
        sign = "+" if delta >= 0 else ""
        print(f"  {label:<22}  {_fmt(v5):>8}  {_fmt(v10):>8}  {sign}{delta:>+.3f}")
    print(f"{'═' * w}\n")


# ─── Main ────────────────────────────────────────────────────────────────────

async def main(args: argparse.Namespace) -> None:
    print("[benchmark] Waiting for embedding model...")
    await wait_for_model()

    qdrant = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    rag = RAGService(qdrant, settings.QDRANT_COLLECTION)
    scoring = ScoringEngine()

    # Optional sector filter
    cases = BENCHMARK_CASES
    if args.sector:
        cases = [c for c in cases if c.sector == args.sector]
        if not cases:
            print(f"[benchmark] No cases found for sector '{args.sector}'")
            sys.exit(1)
        print(f"[benchmark] Filtered to {len(cases)} cases in sector '{args.sector}'")

    async with async_session_factory() as db:
        evaluator = BenchmarkEvaluator(rag=rag, scoring=scoring, db=db)

        if args.both:
            print(f"[benchmark] Running {len(cases)} cases at K=5...")
            report5 = await evaluator.run_benchmark(cases, k=5)
            print(f"[benchmark] Running {len(cases)} cases at K=10...")
            report10 = await evaluator.run_benchmark(cases, k=10)
            print_comparison(report5, report10)
            print_report(report10, verbose=args.verbose)
        else:
            print(f"[benchmark] Running {len(cases)} cases at K={args.k}...")
            report = await evaluator.run_benchmark(cases, k=args.k)
            print_report(report, verbose=args.verbose)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Radar benchmark evaluation")
    parser.add_argument("--k",       type=int, default=10,
                        help="Top-K cutoff (default: 10)")
    parser.add_argument("--both",    action="store_true",
                        help="Run at both K=5 and K=10 and print a comparison table")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Show matched/missed labels and top-5 titles per case")
    parser.add_argument("--sector",  type=str, default=None,
                        help="Restrict to a single sector (e.g. banking_finance)")
    args = parser.parse_args()

    asyncio.run(main(args))
