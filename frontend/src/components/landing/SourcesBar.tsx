import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'

const sources = [
  { name: 'Google Cloud', logo: '/logos/google-cloud.png', countKey: 'googleCloud', active: true, badgeKey: null, isBlueprint: false, logoHeight: 80 },
  { name: 'IBM watsonx', logo: '/logos/ibm-watsonx.png?v=2', countKey: 'ibm', active: true, badgeKey: null, isBlueprint: false, logoHeight: 120 },
  { name: 'Salesforce AI', logo: '/logos/salesforce.png', countKey: 'salesforce', active: true, badgeKey: null, isBlueprint: false, logoHeight: 140 },
  { name: 'Google Cloud', logo: '/logos/google-cloud.png', countKey: 'blueprints', active: true, badgeKey: null, isBlueprint: true, logoHeight: 80 },
  { name: 'McKinsey', logo: '/logos/mckinsey.png', countKey: 'benchmark', active: true, badgeKey: 'calibrationOnly', isBlueprint: false, logoHeight: 170 },
  { name: 'NVIDIA', logo: '/logos/nvidia.png', countKey: 'comingV2', active: false, badgeKey: 'comingV2', isBlueprint: false, logoHeight: 80 },
  { name: 'MIT', logo: '/logos/mit.png', countKey: 'comingV2', active: false, badgeKey: 'comingV2', isBlueprint: false, logoHeight: 60 },
]

function SourceItem({ s }: { s: typeof sources[0] }) {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: 160, // Largeur de la colonne pour chaque logo
      cursor: 'default',
    }}>
      {/* 1. J'ai augmenté la hauteur du conteneur de 50 à 80 pour donner plus de place */}
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'
      }}>
        {!imgError ? (
          <img
            src={s.logo}
            alt={s.name}
            style={{
              // 2. Hauteur en 'auto' pour ne pas déformer le logo
              height: 'auto', 
              // 3. Hauteur max augmentée à 60px (au lieu de 36px fixe)
              maxHeight: s.logoHeight ? s.logoHeight * 0.6 : 60, // On multiplie par 0.6 pour que ça ne dépasse pas trop 
              width: 'auto',
              // 4. Largeur max définie à 140px pour laisser une petite marge dans le conteneur de 160px
              maxWidth: 140,  
              objectFit: 'contain' as const,
              filter: 'none',
              opacity: 1,
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: s.badgeKey === 'calibrationOnly' ? 'var(--dxc-orange)' : s.active ? 'var(--dxc-blue)' : 'var(--text-dim)',
            }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              {s.name}
            </span>
          </div>
        )}
      </div>
      {s.isBlueprint && (
        <>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {t('landing.sources.blueprintProvider')}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: '2px 8px', borderRadius: 100,
            background: 'var(--dxc-blue-light)',
            color: 'var(--dxc-blue)',
            marginTop: 4,
          }}>
            {t('landing.sources.blueprints')}
          </span>
        </>
      )}
      <span style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, opacity: s.active ? 1 : 0.4 }}>{t(`landing.sources.counts.${s.countKey}`)}</span>
      {s.badgeKey && (
        <span style={{
          fontSize: 10, fontWeight: 600,
          padding: '2px 8px', borderRadius: 100,
          background: s.badgeKey === 'comingV2' ? 'var(--bg-muted)' : 'var(--dxc-orange-light)',
          color: s.badgeKey === 'comingV2' ? 'var(--text-dim)' : 'var(--dxc-orange)',
          marginTop: 4,
          opacity: s.active ? 1 : 0.5,
        }}>
          {t(`landing.sources.badges.${s.badgeKey}`)}
        </span>
      )}
    </div>
  )
}
export default function SourcesBar() {
  const { t } = useTranslation()

  return (
    <section style={{ padding: '48px 40px', position: 'relative' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: 28,
        }}>
          {t('landing.sources.title')}
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            gap: 48, padding: '0 40px', flexWrap: 'nowrap' as const,
          }}
        >
          {sources.map((s, i) => (
            <SourceItem key={`${s.name}-${i}`} s={s} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
