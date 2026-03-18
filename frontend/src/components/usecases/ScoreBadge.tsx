// TODO (Phase 6): Implement score badge
/** Colored badge showing a radar score value. */
export default function ScoreBadge({ score }: { score: number }) {
    return <span className="bg-dxc-orange text-white px-2 py-1 rounded-full text-sm font-semibold">{score.toFixed(1)}</span>
}
