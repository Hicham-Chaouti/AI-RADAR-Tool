import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { UseCaseScored } from '../../types/useCase'
import ScoreBadge from '../ui/ScoreBadge'
import { ArrowRight, ExternalLink, Tag, X } from 'lucide-react'

interface Props {
  item: UseCaseScored | null
  onClose: () => void
}

export default function QuickPreviewPanel({ item, onClose }: Props) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="card"
          style={{ padding: 24, background: 'var(--bg-white)', position: 'relative', boxShadow: 'var(--shadow-md)' }}
        >
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-dim)', padding: 4,
          }}>
            <X size={16} />
          </button>

          {/* Score + Rank */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <ScoreBadge score={item.radar_score} size="md" />
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                color: 'var(--dxc-blue)', background: 'var(--dxc-blue-light)',
                padding: '2px 8px', borderRadius: 'var(--radius-full)',
              }}>
                Rank #{item.rank}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 12 }}>
            {item.title}
          </h3>

          {/* Justification */}
          {item.justification && (
            <div style={{
              borderLeft: '4px solid var(--dxc-orange)', padding: '12px 16px',
              background: 'var(--dxc-orange-light)', borderRadius: '0 8px 8px 0',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-body)', fontStyle: 'italic', lineHeight: 1.6 }}>
                {item.justification.slice(0, 200)}{item.justification.length > 200 && '...'}
              </p>
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {item.archetype && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'var(--bg-muted)', border: '1px solid var(--border-light)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                fontSize: 11, color: 'var(--text-secondary)',
              }}>
                <Tag size={10} /> {item.archetype}
              </span>
            )}
            {item.sector_normalized && (
              <span style={{
                background: 'var(--bg-muted)', border: '1px solid var(--border-light)',
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                fontSize: 11, color: 'var(--text-secondary)',
              }}>
                {item.sector_normalized}
              </span>
            )}
          </div>

          {/* Actions */}
          <Link
            to={`/usecase/${item.use_case_id || item.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '10px 16px', borderRadius: 10,
              background: 'var(--dxc-blue-vibrant)', color: 'white',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              boxShadow: 'var(--shadow-blue)',
            }}
          >
            View Full Details <ArrowRight size={14} />
          </Link>

          {/* Source */}
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: 'var(--text-dim)', marginTop: 12,
              }}
            >
              <ExternalLink size={11} />
              {item.source_name || 'View source'}
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
