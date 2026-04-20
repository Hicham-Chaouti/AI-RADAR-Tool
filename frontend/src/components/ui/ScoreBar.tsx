import { motion } from 'framer-motion'

interface ScoreBarProps {
  label: string
  value: number
  max?: number
  color: string
  delay?: number
}

export default function ScoreBar({ label, value, max = 10, color, delay = 0 }: ScoreBarProps) {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
        color: 'var(--text-secondary)', minWidth: 130, flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: 8, background: 'var(--bg-muted)',
        borderRadius: 6, overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', borderRadius: 6, background: color }}
        />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
        color: 'var(--text-primary)', minWidth: 44, textAlign: 'right',
      }}>
        {value.toFixed(1)}/{max}
      </span>
    </div>
  )
}
