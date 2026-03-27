import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Star } from 'lucide-react'
import DashboardPreview from './DashboardPreview'
import { useTranslation } from '../../hooks/useTranslation'

const stats = [
  { value: '1,068', label: 'use cases analyzed' },
  { value: '13', label: 'industry sectors' },
  { value: '4', label: 'knowledge sources' },
  { value: '<60s', label: 'analysis time' },
]

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px 80px', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, textAlign: 'center' }}>
        {/* Rating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pill-badge"
          style={{ marginBottom: 28 }}
        >
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="var(--dxc-blue)" stroke="var(--dxc-blue)" />)}
          </div>
          <span style={{ fontWeight: 700 }}>{t('landing.hero.rating')}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{t('landing.hero.trustedBy')}</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(44px, 5.5vw, 72px)', lineHeight: 1.1,
            letterSpacing: '-0.03em', color: 'var(--text-primary)',
            marginBottom: 24, maxWidth: 800,
          }}
        >
          {t('landing.hero.titlePrefix')}{' '}
          <span className="gradient-text-animated">{t('landing.hero.titleAccent')}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: 18, color: 'var(--text-secondary)', maxWidth: 550,
            margin: '0 auto 40px', lineHeight: 1.6,
          }}
        >
          {t('landing.hero.subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}
        >
          <Link to="/onboarding" className="btn btn-brand" style={{
            padding: '14px 32px', borderRadius: 12,
            fontSize: 15, fontWeight: 600, textDecoration: 'none',
          }}>
            {t('landing.hero.startCta')} <ArrowRight size={16} />
          </Link>
          <Link to="/how-it-works" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: 'var(--text-body)',
            padding: '14px 32px', borderRadius: 12,
            fontSize: 15, fontWeight: 500, textDecoration: 'none',
            border: '1.5px solid var(--border-light)',
            transition: 'all 0.25s',
          }}>
            {t('landing.hero.methodologyCta')} <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Stats bar — hardcoded values */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 0, marginTop: 48,
          }}
        >
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <span style={{ color: 'var(--border-light)', fontSize: 20, margin: '0 24px' }}>|</span>
              )}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontWeight: 700,
                  fontSize: 48, color: 'var(--text-primary)', lineHeight: 1,
                  display: 'block',
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontSize: 14, color: 'var(--text-secondary)', marginTop: 4,
                  display: 'block',
                }}>
                  {t(`landing.hero.stats.${s.label.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase()}`, undefined, s.label)}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dashboard Preview */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 64, width: '100%', maxWidth: 1000, padding: '0 20px' }}>
        <DashboardPreview />
      </div>
    </section>
  )
}
