import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { INDUSTRIES } from '../../utils/constants'
import {
  Landmark, HeartPulse, ShoppingCart, Zap, Factory, Car, Building2,
  Shield, GraduationCap, Cog, Truck, Tv, Plane, Leaf, HardHat, Mountain, Radio,
} from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

const sectorIcons: Record<string, typeof Landmark> = {
  'Agriculture & Food': Leaf,
  'Automotive & Mobility': Car,
  'Banking & Financial Services': Landmark,
  'Construction & Real Estate': HardHat,
  'Consumer Goods & Retail': ShoppingCart,
  'Education & Research': GraduationCap,
  'Energy & Utilities': Zap,
  'Government & Public Sector': Building2,
  'Healthcare & Life Sciences': HeartPulse,
  'Insurance': Shield,
  'Logistics & Supply Chain': Truck,
  'Manufacturing & Industry 4.0': Factory,
  'Media & Entertainment': Tv,
  'Mining & Natural Resources': Mountain,
  'Professional Services': Cog,
  'Telecommunications': Radio,
  'Travel & Hospitality': Plane,
}

const sectorColors: Record<string, string> = {
  'Agriculture & Food': '#16a34a',
  'Automotive & Mobility': '#2563eb',
  'Banking & Financial Services': 'var(--dxc-blue)',
  'Construction & Real Estate': '#b45309',
  'Consumer Goods & Retail': 'var(--dxc-orange)',
  'Education & Research': '#7c3aed',
  'Energy & Utilities': 'var(--score-mid)',
  'Government & Public Sector': '#374151',
  'Healthcare & Life Sciences': 'var(--accent-emerald)',
  'Insurance': '#0e7490',
  'Logistics & Supply Chain': '#c2410c',
  'Manufacturing & Industry 4.0': 'var(--accent-purple)',
  'Media & Entertainment': '#db2777',
  'Mining & Natural Resources': '#78716c',
  'Professional Services': '#1d4ed8',
  'Telecommunications': '#0284c7',
  'Travel & Hospitality': '#059669',
}

const sectorCounts: Record<string, number> = {
  'Banking & Financial Services': 183,
  'Healthcare & Life Sciences': 106,
  'Consumer Goods & Retail': 166,
  'Energy & Utilities': 73,
  'Manufacturing & Industry 4.0': 89,
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

interface SectorCardProps {
  sector: string
  onClick: () => void
  gridColumnStart?: number
}

function SectorCard({ sector, onClick, gridColumnStart }: SectorCardProps) {
  const { t } = useTranslation()
  const Icon = sectorIcons[sector] || Cog
  const color = sectorColors[sector] || 'var(--dxc-blue)'
  const count = sectorCounts[sector]

  return (
    <motion.button
      variants={item}
      onClick={onClick}
      className="card"
      style={{
        position: 'relative', padding: '28px 20px 20px', textAlign: 'left',
        cursor: 'pointer', background: 'var(--bg-white)',
        borderTop: `3px solid ${color}`,
        minHeight: 160, width: '100%',
        ...(gridColumnStart ? { gridColumnStart } : {}),
      }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
        {sector}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>
        {count
          ? t('landing.sectors.useCasesCount', { count })
          : t('landing.sectors.useCasesLabel', undefined, 'cas d\'usage')
        }
      </span>
    </motion.button>
  )
}

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

        {/* All sectors — single 5-column grid, last 2 centered */}
        <motion.div
          variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}
        >
          {INDUSTRIES.map((sector) => (
            <SectorCard
              key={sector}
              sector={sector}
              onClick={() => handleClick(sector)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
