import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { createSession } from '../api/sessions'
import { scoreSession } from '../api/scoring'
import Navbar from '../components/layout/Navbar'
import PhaseTargetIdentification from '../components/onboarding/PhaseTargetIdentification'
import PhaseClientIntelligence from '../components/onboarding/PhaseClientIntelligence'
import PhaseArsenalStack from '../components/onboarding/PhaseArsenalStack'
import PhaseMissionObjectives from '../components/onboarding/PhaseMissionObjectives'
import LaunchButton from '../components/onboarding/LaunchButton'
import ErrorBanner from '../components/common/ErrorBanner'
import { useTranslation } from '../hooks/useTranslation'

export default function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedSector, setSession, setTopTen, setLoading, isLoading, loadingMessage, error, setError } = useSessionStore()

  const phaseLabels = [
    t('onboarding.progress.configure'),
    t('onboarding.progress.clientIntel'),
    t('onboarding.progress.capabilities'),
    t('onboarding.progress.launch'),
  ]

  const [sector, setSector] = useState(selectedSector || '')
  const [clientName, setClientName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [proximity, setProximity] = useState('')
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [objectives, setObjectives] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  // Clear error when user modifies form
  const clearError = useCallback(() => setError(null), [setError])

  const handleSectorChange = useCallback((s: string) => {
    clearError()
    setSector(s)
  }, [clearError])

  const handleClientNameChange = useCallback((n: string) => {
    clearError()
    setClientName(n)
  }, [clearError])

  const handleRelationshipChange = useCallback((r: string) => {
    clearError()
    setRelationship(r)
  }, [clearError])

  const handleProximityChange = useCallback((p: string) => {
    clearError()
    setProximity(p)
  }, [clearError])

  const toggleCap = useCallback((cap: string) => {
    setError(null)
    setCapabilities(prev => prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap])
  }, [setError])
  const toggleObj = useCallback((obj: string) => {
    setError(null)
    setObjectives(prev => prev.includes(obj) ? prev.filter(o => o !== obj) : [...prev, obj])
  }, [setError])

  const filled = [sector, clientName, relationship, proximity].filter(Boolean).length + (capabilities.length > 0 ? 1 : 0)
  const total = 5
  const pct = Math.round((filled / total) * 100)
  const canLaunch = !!sector && !!clientName && capabilities.length > 0

  const handleLaunch = async () => {
    if (!canLaunch) return
    try {
      setLoading(true, t('onboarding.loading.creatingSession'))
      const session = await createSession({
        sector,
        client_name: clientName,
        relationship_level: relationship || undefined,
        business_proximity: proximity || undefined,
        capabilities: capabilities.length > 0 ? capabilities : undefined,
        strategic_objectives: objectives.length > 0 ? objectives : undefined,
      })
      setSession(session)
      setLoading(true, t('onboarding.loading.scoringUseCases', { sector }))
      const result = await scoreSession(session.id)
      setTopTen(result.top_10 as any)
      setLoading(false)
      navigate('/radar')
    } catch (err: any) {
      console.error('Launch failed:', err)
      
      let msg = t('onboarding.loading.analysisFailed')
      if (err?.response?.status === 503) {
        msg = t('onboarding.loading.modelLoading')
      } else if (err?.response?.status === 500) {
        msg = err?.response?.data?.detail || t('onboarding.loading.analysisFailed')
      } else if (err?.message) {
        msg = err.message
      }
      
      setError(msg)
      setLoading(false)
    }
  }

  const sectionAnim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' as any }, transition: { duration: 0.5 } }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ position: 'relative', minHeight: '100vh', paddingTop: 24, paddingBottom: 100 }}>
        {/* Progress bar — sticky under navbar */}
        <div style={{
          position: 'sticky', top: 64, zIndex: 40,
          background: 'var(--bg-white)', boxShadow: 'var(--shadow-xs)',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 40px',
        }}>
          <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', gap: 4 }}>
              {phaseLabels.map((label, i) => (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{
                    height: 4, borderRadius: 2,
                    background: i < Math.ceil(filled * phaseLabels.length / total)
                      ? 'var(--dxc-blue)' : 'var(--bg-muted)',
                    transition: 'background 0.3s',
                  }} />
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: i < Math.ceil(filled * phaseLabels.length / total) ? 'var(--dxc-blue)' : 'var(--text-dim)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--dxc-blue)' }}>
              {pct}%
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 40px 0' }}>
          {/* Header */}
          <motion.div {...sectionAnim} style={{ marginBottom: 40 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {t('onboarding.page.title')}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
              {t('onboarding.page.subtitle')}
            </p>
          </motion.div>

          {/* Phases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <ErrorBanner message={error} />
              </motion.div>
            )}

            <motion.div {...sectionAnim} className="card" style={{ padding: 32, background: 'var(--bg-white)' }}>
              <PhaseTargetIdentification sector={sector} clientName={clientName} onSectorChange={handleSectorChange} onClientNameChange={handleClientNameChange} />
            </motion.div>

            <motion.div {...sectionAnim} className="card" style={{ padding: 32, background: 'var(--bg-white)' }}>
              <PhaseClientIntelligence relationship={relationship} proximity={proximity} onRelationshipChange={handleRelationshipChange} onProximityChange={handleProximityChange} />
            </motion.div>

            <motion.div {...sectionAnim} className="card" style={{ padding: 32, background: 'var(--bg-white)' }}>
              <PhaseArsenalStack capabilities={capabilities} onToggle={toggleCap} />
            </motion.div>

            <motion.div {...sectionAnim} className="card" style={{ padding: 32, background: 'var(--bg-white)' }}>
              <PhaseMissionObjectives objectives={objectives} onToggle={toggleObj} notes={notes} onNotesChange={setNotes} />
            </motion.div>
          </div>

          {/* Launch */}
          <LaunchButton canLaunch={canLaunch} isLoading={isLoading} loadingMessage={loadingMessage} sector={sector} onLaunch={handleLaunch} />
        </div>
      </div>
    </motion.div>
  )
}
