import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import SectionLabel from '../ui/SectionLabel'
import { Handshake, Building2, Signal, SignalLow, SignalMedium } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  relationship: string
  proximity: string
  onRelationshipChange: (r: string) => void
  onProximityChange: (p: string) => void
}

export default function PhaseClientIntelligence({ relationship, proximity, onRelationshipChange, onProximityChange }: Props) {
  const { t } = useTranslation()

  return (
    <div>
      <SectionLabel number="02" title={t('onboarding.clientIntel.sectionLabel')} />
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        {t('onboarding.clientIntel.title')}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        {t('onboarding.clientIntel.subtitle')}
      </p>

      {/* Relationship level */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>
          {t('onboarding.clientIntel.relationshipLevelLabel')}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { value: 'new', label: t('onboarding.clientIntel.relationship.new.label'), desc: t('onboarding.clientIntel.relationship.new.desc'), icon: Handshake },
            { value: 'existing', label: t('onboarding.clientIntel.relationship.existing.label'), desc: t('onboarding.clientIntel.relationship.existing.desc'), icon: Building2 },
          ].map(opt => {
            const isSelected = relationship === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onRelationshipChange(opt.value)}
                style={{
                  position: 'relative',
                  padding: 20, textAlign: 'left', cursor: 'pointer',
                  background: isSelected ? 'rgba(232,240,254,0.3)' : 'var(--bg-white)',
                  border: isSelected ? '2px solid var(--border-active)' : '1.5px solid var(--border-light)',
                  borderRadius: 14,
                  boxShadow: isSelected ? 'var(--shadow-blue)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s',
                }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ position: 'absolute', top: 12, right: 12 }}
                    >
                      <CheckCircle2 size={20} style={{ color: 'var(--dxc-blue)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <opt.icon size={20} style={{ color: isSelected ? 'var(--dxc-blue)' : 'var(--text-dim)', marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{opt.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Business Proximity */}
      <div>
        <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'block' }}>
          {t('onboarding.clientIntel.businessProximityLabel')}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { value: 'low', label: t('onboarding.clientIntel.proximity.low.label'), desc: t('onboarding.clientIntel.proximity.low.desc'), icon: SignalLow, color: 'var(--score-low)' },
            { value: 'medium', label: t('onboarding.clientIntel.proximity.medium.label'), desc: t('onboarding.clientIntel.proximity.medium.desc'), icon: SignalMedium, color: 'var(--score-mid)' },
            { value: 'high', label: t('onboarding.clientIntel.proximity.high.label'), desc: t('onboarding.clientIntel.proximity.high.desc'), icon: Signal, color: 'var(--score-high)' },
          ].map(opt => {
            const isSelected = proximity === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onProximityChange(opt.value)}
                style={{
                  position: 'relative',
                  padding: 20, textAlign: 'center', cursor: 'pointer',
                  background: isSelected ? 'rgba(232,240,254,0.3)' : 'var(--bg-white)',
                  border: isSelected ? `2px solid ${opt.color}` : '1.5px solid var(--border-light)',
                  borderRadius: 14,
                  boxShadow: isSelected ? 'var(--shadow-blue)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s',
                }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ position: 'absolute', top: 12, right: 12 }}
                    >
                      <CheckCircle2 size={20} style={{ color: opt.color }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <opt.icon size={24} style={{ color: isSelected ? opt.color : 'var(--text-dim)', marginBottom: 8, margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
