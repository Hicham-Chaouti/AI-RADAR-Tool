import { motion } from 'framer-motion'
import type { UseCaseScored } from '../../types/useCase'
import { Zap } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useLocalizedDynamicFields } from '../../hooks/useLocalizedDynamicFields'

interface Props {
  items: UseCaseScored[]
  selectedId: string | null
  onSelect: (item: UseCaseScored) => void
  isLoading: boolean
}

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

function getRankColor(rank: number): string {
  if (rank === 1) return '#b8860b'   // gold
  if (rank === 2) return '#6b7280'   // silver
  if (rank === 3) return '#a0522d'   // bronze
  return 'var(--dxc-blue)'
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35 } } }

function UseCaseRow({
  uc,
  isSelected,
  onSelect,
}: {
  uc: UseCaseScored
  isSelected: boolean
  onSelect: (item: UseCaseScored) => void
}) {
  const { t } = useTranslation()
  const localized = useLocalizedDynamicFields({
    title: uc.title,
    archetype: uc.archetype,
  })
  const id = uc.use_case_id || uc.id || ''
  const rankColor = getRankColor(uc.rank)

  return (
    <motion.button
      key={id} variants={item}
      onClick={() => onSelect(uc)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', borderRadius: 12,
        background: isSelected ? 'var(--dxc-blue-light)' : 'var(--bg-white)',
        border: isSelected ? '1.5px solid var(--border-active)' : '1px solid var(--border-light)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        boxShadow: isSelected ? 'var(--shadow-blue)' : 'var(--shadow-xs)',
        transition: 'all 0.2s',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14,
        color: rankColor, minWidth: 36, textAlign: 'center',
      }}>
        #{String(uc.rank).padStart(2, '0')}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 14, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {localized.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
          {localized.archetype || '-'}
        </div>
      </div>

      {uc.quick_win && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 10, fontWeight: 700, color: 'var(--accent-emerald)',
          background: 'var(--accent-emerald-light)', padding: '3px 8px',
          borderRadius: 'var(--radius-full)', flexShrink: 0,
        }}>
          <Zap size={10} /> {t('radar.quickWin')}
        </span>
      )}

      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14,
          color: getScoreColor(uc.radar_score),
          background: getScoreBg(uc.radar_score),
          padding: '2px 8px', borderRadius: 6,
        }}>
          {uc.radar_score.toFixed(1)}
        </span>
      </div>
    </motion.button>
  )
}

export default function UseCaseList({ items, selectedId, onSelect, isLoading }: Props) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-shimmer" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={container} initial="hidden" animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      {items.map(uc => {
        const id = uc.use_case_id || uc.id || ''
        const isSelected = selectedId === id

        return (
          <UseCaseRow
            key={id}
            uc={uc}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        )
      })}
    </motion.div>
  )
}
