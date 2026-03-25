import { motion } from 'framer-motion'
import { Database, Radar, Brain, Timer, FileText, Shield } from 'lucide-react'

const features = [
  {
    icon: Database,
    iconBg: 'var(--dxc-blue-light)',
    iconColor: 'var(--dxc-blue)',
    title: '1,068 Real Use Cases',
    desc: 'Every use case traces to a real public source URL. No hallucinated data.',
  },
  {
    icon: Radar,
    iconBg: 'var(--dxc-orange-light)',
    iconColor: 'var(--dxc-orange)',
    title: 'Interactive Radar Chart',
    desc: '5-axis visualization: ROI, Complexity, Maturity, Risk, Quick Win potential.',
  },
  {
    icon: Brain,
    iconBg: 'var(--accent-emerald-light)',
    iconColor: 'var(--accent-emerald)',
    title: 'AI-Generated Justifications',
    desc: 'Mistral Small contextualizes each recommendation to your specific client.',
  },
  {
    icon: Timer,
    iconBg: 'var(--accent-purple-light)',
    iconColor: 'var(--accent-purple)',
    title: 'Under 60 Seconds',
    desc: 'From client profile to ranked roadmap in one click. No manual research.',
  },
  {
    icon: FileText,
    iconBg: 'var(--dxc-blue-light)',
    iconColor: 'var(--accent-cyan)',
    title: 'PDF Export',
    desc: 'Professional report ready to send to the client. Radar, scores, justifications included.',
  },
  {
    icon: Shield,
    iconBg: 'var(--dxc-coral-light)',
    iconColor: 'var(--dxc-coral)',
    title: 'Transparent Scoring',
    desc: '4 documented criteria with explicit weights. No black box. Fully auditable.',
  },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function FeaturesGrid() {
  return (
    <section style={{ position: 'relative', padding: '100px 40px', background: 'var(--bg-soft)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="pill-badge" style={{ marginBottom: 20 }}>
          Why AI Radar
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
          Your unfair advantage in AI opportunity identification
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 60, fontSize: 16, maxWidth: 600, margin: '0 auto 60px' }}>
          We combine cutting-edge AI with structured methodology to deliver results in under 60 seconds.
        </p>

        <motion.div
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}
        >
          {features.map(f => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title} variants={item}
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
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
