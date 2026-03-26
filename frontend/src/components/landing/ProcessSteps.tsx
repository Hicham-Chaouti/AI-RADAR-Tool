import { motion } from 'framer-motion'
import { Users, Search, BarChart3, FileBarChart } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const steps = [
  {
    key: 'discovery',
    icon: Users,
    iconBg: 'var(--dxc-blue-light)',
    iconColor: 'var(--dxc-blue)',
  },
  {
    key: 'analysis',
    icon: Search,
    iconBg: 'var(--accent-purple-light)',
    iconColor: 'var(--accent-purple)',
  },
  {
    key: 'scoring',
    icon: BarChart3,
    iconBg: 'var(--accent-emerald-light)',
    iconColor: 'var(--accent-emerald)',
  },
  {
    key: 'delivery',
    icon: FileBarChart,
    iconBg: 'var(--dxc-orange-light)',
    iconColor: 'var(--dxc-orange)',
  },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }
const item = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function ProcessSteps() {
  const { t } = useTranslation()

  return (
    <section style={{ position: 'relative', padding: '100px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        {/* Pill badge */}
        <div className="pill-badge" style={{ marginBottom: 20 }}>
          {t('landing.process.badge')}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
          {t('landing.process.title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 60, fontSize: 16 }}>
          {t('landing.process.subtitle')}
        </p>

        <motion.div
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative', alignItems: 'start' }}
        >
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={s.key} variants={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* Connecting dashed line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 28, left: 'calc(50% + 36px)', width: 'calc(100% - 72px)',
                    borderTop: '2px dashed var(--border-light)', zIndex: 0,
                  }} />
                )}

                {/* Icon circle */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: s.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, position: 'relative', zIndex: 1,
                }}>
                  <Icon size={24} style={{ color: s.iconColor }} />
                </div>

                {/* Card */}
                <div className="card" style={{
                  padding: 32, textAlign: 'center', width: '100%',
                  background: 'var(--bg-white)',
                }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {t(`landing.process.steps.${s.key}.title`)}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {t(`landing.process.steps.${s.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
