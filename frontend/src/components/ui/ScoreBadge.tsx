interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const SIZES = { sm: 40, md: 56, lg: 80 }
const FONT = { sm: 13, md: 18, lg: 28 }
const STROKE = { sm: 3, md: 4, lg: 5 }

function getScoreColor(score: number): string {
  if (score >= 8) return 'var(--score-high)'
  if (score >= 5) return 'var(--score-mid)'
  return 'var(--score-low)'
}

function getScoreBg(score: number): string {
  if (score >= 8) return 'var(--score-high-light)'
  if (score >= 5) return 'var(--score-mid-light)'
  return 'var(--score-low-light)'
}

export default function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const s = SIZES[size]
  const r = (s - STROKE[size]) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ
  const color = getScoreColor(score)

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: s, height: s }}>
        <svg width={s} height={s} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={s/2} cy={s/2} r={r}
            fill={getScoreBg(score)} stroke="var(--border-light)" strokeWidth={STROKE[size]} />
          <circle cx={s/2} cy={s/2} r={r}
            fill="none" stroke={color} strokeWidth={4}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: FONT[size],
          color: 'var(--text-primary)',
        }}>
          {score.toFixed(1)}
        </span>
      </div>
      {showLabel && (
        <span style={{
          fontSize: size === 'lg' ? 13 : 11, fontWeight: 600,
          color, background: getScoreBg(score),
          padding: '2px 8px', borderRadius: 'var(--radius-full)',
        }}>
          /10
        </span>
      )}
    </div>
  )
}
