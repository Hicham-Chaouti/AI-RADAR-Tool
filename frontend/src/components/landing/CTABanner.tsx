import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export default function CTABanner() {
  const { t } = useTranslation()

  return (
    <section style={{
      position: 'relative', padding: '100px 40px', textAlign: 'center', overflow: 'hidden',
      background: 'var(--bg-soft)',
    }}>
      {/* Subtle blue blob */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(90,141,232,0.08) 0%, transparent 60%)',
        filter: 'blur(60px)',
        top: '-20%', right: '20%', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)',
          fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12,
        }}>
          {t('landing.cta.title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36, maxWidth: '50ch', margin: '0 auto 36px' }}>
          {t('landing.cta.subtitle')}
        </p>
        <Link to="/onboarding" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--dxc-blue-vibrant)', color: 'white',
          padding: '16px 40px', borderRadius: 14,
          fontWeight: 700, fontSize: 16, textDecoration: 'none',
          boxShadow: 'var(--shadow-blue)',
          transition: 'all 0.25s',
        }}>
          {t('onboarding.launchAnalysis')} <ArrowRight size={18} />
        </Link>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 16 }}>
          {t('landing.cta.footnote')}
        </p>
      </motion.div>
    </section>
  )
}
