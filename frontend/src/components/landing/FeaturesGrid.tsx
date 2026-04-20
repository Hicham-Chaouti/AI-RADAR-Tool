import { motion } from 'framer-motion'
import { Database, Radar, Brain, Timer, FileText, Shield } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const features = [
  {
    key: 'realUseCases',
    icon: Database,
    iconBg: 'var(--dxc-blue-light)',
    iconColor: 'var(--dxc-blue)',
  },
  {
    key: 'interactiveRadar',
    icon: Radar,
    iconBg: 'var(--dxc-orange-light)',
    iconColor: 'var(--dxc-orange)',
  },
  {
    key: 'aiJustifications',
    icon: Brain,
    iconBg: 'var(--accent-emerald-light)',
    iconColor: 'var(--accent-emerald)',
  },
  {
    key: 'under60s',
    icon: Timer,
    iconBg: 'var(--accent-purple-light)',
    iconColor: 'var(--accent-purple)',
  },
  {
    key: 'pdfExport',
    icon: FileText,
    iconBg: 'var(--dxc-blue-light)',
    iconColor: 'var(--accent-cyan)',
  },
  {
    key: 'transparentScoring',
    icon: Shield,
    iconBg: 'var(--dxc-coral-light)',
    iconColor: 'var(--dxc-coral)',
  },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function FeaturesGrid() {
  const { t } = useTranslation()

  return (
    <section style={{ position: 'relative', padding: '100px 40px', background: 'var(--bg-soft)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="pill-badge" style={{ marginBottom: 20 }}>
          {t('landing.features.badge')}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
          {t('landing.features.title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 60, fontSize: 16, maxWidth: 600, margin: '0 auto 60px' }}>
          {t('landing.features.subtitle')}
        </p>

        <motion.div
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}
        >
          {features.map(f => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.key} variants={item}
                className="card"
                style={{ padding: 28, textAlign: 'left', background: 'var(--bg-white)' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: f.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={20} style={{ color: f.iconColor }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {t(`landing.features.items.${f.key}.title`)}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {t(`landing.features.items.${f.key}.desc`)}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
