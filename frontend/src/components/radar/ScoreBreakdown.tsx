import type { UseCaseScored } from '../../types/useCase'
import ScoreBar from '../ui/ScoreBar'

interface Props {
  item: UseCaseScored | null
}

const bars = [
  { key: 'trend_strength' as const, label: 'Trend Strength', color: 'var(--dxc-blue)' },
  { key: 'client_relevance' as const, label: 'Client Relevance', color: 'var(--dxc-orange)' },
  { key: 'capability_match' as const, label: 'Capability Match', color: 'var(--accent-emerald)' },
  { key: 'market_momentum' as const, label: 'Market Momentum', color: 'var(--accent-purple)' },
]

export default function ScoreBreakdown({ item }: Props) {
  if (!item) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Score Breakdown
      </h4>
      {bars.map((b, i) => (
        <ScoreBar
          key={b.key}
          label={b.label}
          value={item.score_breakdown[b.key]}
          max={10}
          color={b.color}
          delay={i * 0.1}
        />
      ))}
    </div>
  )
}
