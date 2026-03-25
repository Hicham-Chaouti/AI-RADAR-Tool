import { motion } from 'framer-motion'
import { Users, Search, BarChart3, FileBarChart } from 'lucide-react'

const steps = [
  {
    title: 'Discovery',
    icon: Users,
    iconBg: 'var(--dxc-blue-light)',
    iconColor: 'var(--dxc-blue)',
    desc: 'Select industry, input client name, define relationship level and AI capabilities.',
  },
  {
    title: 'Analysis',
    icon: Search,
    iconBg: 'var(--accent-purple-light)',
    iconColor: 'var(--accent-purple)',
    desc: 'Qdrant searches 1,068 embedded use cases using cosine similarity (Qwen3, 1024-dim vectors).',
  },
  {
    title: 'Scoring',
    icon: BarChart3,
    iconBg: 'var(--accent-emerald-light)',
    iconColor: 'var(--accent-emerald)',
    desc: '4-criteria weighted score: Trend 25% + Relevance 30% + Capability 25% + Momentum 20%.',
  },
  {
    title: 'Delivery',
    icon: FileBarChart,
    iconBg: 'var(--dxc-orange-light)',
    iconColor: 'var(--dxc-orange)',
    desc: 'Interactive radar, top 10 ranked list, AI-generated justifications, PDF export.',
  },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }
const item = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function ProcessSteps() {
  return (
    <section style={{ position: 'relative', padding: '100px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        {/* Pill badge */}
        <div className="pill-badge" style={{ marginBottom: 20 }}>
          Work Process
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
          From Conversation to Roadmap in 4 Steps
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 60, fontSize: 16 }}>
          A proven methodology that ensures transparent, auditable results.
        </p>

        <motion.div
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, position: 'relative', alignItems: 'start' }}
        >
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={s.title} variants={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
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
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {s.desc}
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
