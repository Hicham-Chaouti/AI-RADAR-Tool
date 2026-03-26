import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { INDUSTRIES } from '../../utils/constants'
import { Landmark, HeartPulse, ShoppingCart, Zap, Factory, Car, Building2, Shield, GraduationCap, Cog, Truck, Tv, Plane } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const sectorIcons: Record<string, typeof Landmark> = {
  'Banking & Financial Services': Landmark,
  'Healthcare & Life Sciences': HeartPulse,
  'Consumer Goods & Retail': ShoppingCart,
  'Energy & Utilities': Zap,
  'Manufacturing & Industry 4.0': Factory,
  'Automotive & Mobility': Car,
  'Government & Public Sector': Building2,
  'Insurance': Shield,
  'Education & Research': GraduationCap,
  'Professional Services': Cog,
  'Logistics & Supply Chain': Truck,
  'Media & Entertainment': Tv,
  'Travel & Hospitality': Plane,
}

const topSectors = INDUSTRIES.slice(0, 5)
const otherSectors = INDUSTRIES.slice(5)

const topCounts: Record<string, number> = {
  'Banking & Financial Services': 183,
  'Healthcare & Life Sciences': 106,
  'Consumer Goods & Retail': 166,
  'Energy & Utilities': 73,
  'Manufacturing & Industry 4.0': 89,
}

const topColors: Record<string, string> = {
  'Banking & Financial Services': 'var(--dxc-blue)',
  'Healthcare & Life Sciences': 'var(--accent-emerald)',
  'Consumer Goods & Retail': 'var(--dxc-orange)',
  'Energy & Utilities': 'var(--score-mid)',
  'Manufacturing & Industry 4.0': 'var(--accent-purple)',
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function SectorGrid() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSelectedSector = useSessionStore(s => s.setSelectedSector)

  const handleClick = (sector: string) => {
    setSelectedSector(sector)
    navigate('/onboarding')
  }

  return (
    <section style={{ position: 'relative', padding: '100px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="pill-badge" style={{ marginBottom: 20 }}>
          {t('landing.sectors.badge')}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          {t('landing.sectors.title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 48 }}>
          {t('landing.sectors.subtitle')}
        </p>

        {/* Top 5 — larger cards */}
        <motion.div
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}
        >
          {topSectors.map(sector => {
            const Icon = sectorIcons[sector] || Cog
            const borderColor = topColors[sector] || 'var(--dxc-blue)'
            return (
              <motion.button
                key={sector} variants={item}
                onClick={() => handleClick(sector)}
                className="card"
                style={{
                  position: 'relative', padding: '28px 20px 20px', textAlign: 'left',
                  cursor: 'pointer', background: 'var(--bg-white)',
                  borderTop: `3px solid ${borderColor}`,
                  minHeight: 160,
                }}
                whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `${borderColor}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Icon size={18} style={{ color: borderColor }} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                  {sector}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>
                  {t('landing.sectors.useCasesCount', { count: topCounts[sector] })}
                </span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Rest — compact cards */}
        <motion.div
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}
        >
          {otherSectors.map(sector => (
            <motion.button
              key={sector} variants={item}
              onClick={() => handleClick(sector)}
              className="card"
              style={{ padding: '16px 20px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-white)' }}
              whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                {sector}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
