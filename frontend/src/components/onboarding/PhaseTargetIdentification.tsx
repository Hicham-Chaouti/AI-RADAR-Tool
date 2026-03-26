import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { INDUSTRIES } from '../../utils/constants'
import { detectSector, DetectSectorResult } from '../../api/detectSector'
import SectionLabel from '../ui/SectionLabel'
import { Building2, ChevronDown } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

interface Props {
  sector: string
  clientName: string
  onSectorChange: (s: string) => void
  onClientNameChange: (n: string) => void
}

export default function PhaseTargetIdentification({ sector, clientName, onSectorChange, onClientNameChange }: Props) {
  const { t } = useTranslation()
  const [isDetecting, setIsDetecting] = useState(false)
  const [detected, setDetected] = useState<DetectSectorResult | null>(null)
  const [detectError, setDetectError] = useState(false)
  const [sectorLocked, setSectorLocked] = useState(false)
  const [intelFlash, setIntelFlash] = useState(false)
  const prevClientName = useRef(clientName)

  // Debounced sector detection
  useEffect(() => {
    // Only trigger when clientName actually changes (not on sector change)
    if (clientName === prevClientName.current) return
    prevClientName.current = clientName

    setDetected(null)
    setDetectError(false)
    setSectorLocked(false)

    if (!clientName || clientName.trim().length < 3) return

    const timer = setTimeout(async () => {
      setIsDetecting(true)
      setDetectError(false)

      try {
        const result = await detectSector(clientName.trim())
        setDetected(result)
        onSectorChange(result.sector_label)
        setSectorLocked(true)

        // Flash the intel card
        setIntelFlash(true)
        setTimeout(() => setIntelFlash(false), 2000)
      } catch {
        setDetectError(true)
        setSectorLocked(false)
      } finally {
        setIsDetecting(false)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [clientName, onSectorChange])

  const handleUnlock = () => {
    setSectorLocked(false)
    setDetected(null)
  }

  return (
    <div>
      <SectionLabel number="01" title={t('onboarding.target.sectionLabel')} />
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        {t('onboarding.target.title')}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
        {t('onboarding.target.subtitle')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* Left - Inputs (Client Name FIRST, then Sector) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Client Name — first so the agent can detect the sector */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              {t('onboarding.target.clientNameLabel')}
            </label>
            <input
              className="input"
              type="text"
              placeholder={t('onboarding.target.clientNamePlaceholder')}
              value={clientName}
              onChange={e => onClientNameChange(e.target.value)}
            />

            {/* Detection status indicator */}
            <div style={{ minHeight: 28, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <AnimatePresence mode="wait">
                {isDetecting && (
                  <motion.span
                    key="detecting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ color: 'var(--dxc-blue)', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="20 20" />
                    </svg>
                    {t('onboarding.target.detectingSector')}
                  </motion.span>
                )}

                {detected && !isDetecting && (
                  <motion.span
                    key="detected"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      color: detected.confidence === 'high' ? 'var(--score-high)' :
                             detected.confidence === 'medium' ? 'var(--score-mid)' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {detected.confidence === 'high' ? t('onboarding.target.detectedHigh') :
                     detected.confidence === 'medium' ? t('onboarding.target.detectedMedium') : t('onboarding.target.detectedLow')}
                    {' — '}{detected.reasoning}
                  </motion.span>
                )}

                {detectError && !isDetecting && (
                  <motion.span
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ color: 'var(--text-dim)', fontSize: 12 }}
                  >
                    {t('onboarding.target.detectError')}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Industry Sector — auto-filled or manual */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              {t('onboarding.target.industrySectorLabel')}
            </label>

            {sectorLocked && detected ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'var(--dxc-blue-light)',
                border: '1.5px solid var(--border-active)',
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" fill="var(--dxc-blue)" fillOpacity="0.15" stroke="var(--dxc-blue)" strokeWidth="1.5" />
                    <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="var(--dxc-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {detected.sector_label}
                  </span>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 100,
                    background: detected.confidence === 'high' ? 'var(--score-high-light)' : 'var(--score-mid-light)',
                    color: detected.confidence === 'high' ? 'var(--score-high)' : 'var(--score-mid)',
                    fontWeight: 600,
                  }}>
                    {detected.confidence === 'high' ? t('onboarding.target.aiConfirmed') : t('onboarding.target.aiSuggested')}
                  </span>
                </div>
                <button
                  onClick={handleUnlock}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-dim)',
                    fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: '4px 8px',
                  }}
                >
                  {t('onboarding.target.changeManually')}
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <select
                  className="input"
                  value={sector}
                  onChange={e => onSectorChange(e.target.value)}
                  style={{ appearance: 'none', paddingRight: 40, cursor: 'pointer' }}
                >
                  <option value="">{t('onboarding.target.selectIndustry')}</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
              </div>
            )}
          </div>
        </div>

        {/* Right - Sector Intel card */}
        {sector && (
          <motion.div
            animate={intelFlash ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={{
              padding: 24, background: 'var(--bg-white)',
              borderRadius: 14, boxShadow: 'var(--shadow-md)',
              borderLeft: '4px solid var(--dxc-blue)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Building2 size={16} style={{ color: intelFlash ? 'var(--score-high)' : 'var(--dxc-blue)' }} />
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: intelFlash ? 'var(--score-high)' : 'var(--dxc-blue)',
                transition: 'color 0.3s',
              }}>
                {intelFlash ? t('onboarding.target.sectorDetectedByAi') : t('onboarding.target.sectorIntel')}
              </span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {sector}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {t('onboarding.target.sectorIntelBody')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
