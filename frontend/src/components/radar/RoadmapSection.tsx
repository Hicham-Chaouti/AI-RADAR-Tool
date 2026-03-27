import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, Clock, TrendingUp, AlertTriangle, Users, Package, Euro, UserCheck } from 'lucide-react'
import { generateRoadmap } from '../../api/usecases'
import { useTranslation } from '../../hooks/useTranslation'
import type { Roadmap } from '../../types/roadmap'

const PHASE_COLORS = [
  '#3b6fd4',
  '#e8760a',
  '#059669',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
]

interface Props {
  useCaseId: string
  sessionId?: string
}

export default function RoadmapSection({ useCaseId, sessionId }: Props) {
  const { t } = useTranslation()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await generateRoadmap(useCaseId, sessionId)
      setRoadmap(data)
    } catch {
      setError(t('roadmap.error', undefined, 'Failed to generate roadmap. Please try again.'))
    }
    setLoading(false)
  }

  const totalDays = roadmap?.roadmap.reduce((sum, p) => sum + (p.charge_jours || 0), 0) ?? 0

  return (
    <div className="card" style={{ padding: 28, background: 'var(--bg-white)' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: roadmap || loading ? 24 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(90,141,232,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Map size={16} style={{ color: 'var(--dxc-blue)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              {t('roadmap.title', undefined, 'Implementation Roadmap')}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0, marginTop: 1 }}>
              {t('roadmap.subtitle', undefined, 'AI-generated consulting-grade delivery plan')}
            </p>
          </div>
        </div>
        {!roadmap && !loading && (
          <button onClick={handleGenerate} className="btn btn-primary" style={{ fontSize: 12, padding: '8px 18px', gap: 6 }}>
            <Map size={13} />
            {t('roadmap.generate', undefined, 'Generate Roadmap')}
          </button>
        )}
      </div>

      {/* ── Idle ── */}
      {!roadmap && !loading && !error && (
        <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '12px 0 0' }}>
          {t('roadmap.idleHint', undefined, 'Generate a step-by-step delivery roadmap with effort estimates, required profiles, and deliverables for each phase.')}
        </p>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[80, 100, 90, 80].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 10, background: 'var(--bg-muted)', opacity: 1 - i * 0.15, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>
            {t('roadmap.generating', undefined, 'Generating your consulting roadmap...')}
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{error}</span>
          <button onClick={handleGenerate} className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: '#dc2626' }}>
            {t('roadmap.retry', undefined, 'Retry')}
          </button>
        </div>
      )}

      {/* ── Roadmap content ── */}
      {roadmap && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Objective */}
          <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(90,141,232,0.06) 0%, rgba(90,141,232,0.02) 100%)', borderRadius: 10, borderLeft: '4px solid var(--dxc-blue)' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
              {roadmap.objective}
            </p>
          </div>

          {/* ── KPI summary strip ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>

            {/* Total Budget */}
            {roadmap.budget_total && (
              <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, rgba(232,118,10,0.08) 0%, rgba(232,118,10,0.03) 100%)', borderRadius: 10, border: '1px solid rgba(232,118,10,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Euro size={13} style={{ color: 'var(--dxc-orange)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dxc-orange)' }}>
                    {t('roadmap.budgetTotal', undefined, 'Total Budget')}
                  </span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                  {roadmap.budget_total}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                  {t('roadmap.dailyRate', undefined, 'at €850/day blended rate')}
                </p>
              </div>
            )}

            {/* Total charge */}
            <div style={{ padding: '16px 18px', background: 'rgba(90,141,232,0.05)', borderRadius: 10, border: '1px solid rgba(90,141,232,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Clock size={13} style={{ color: 'var(--dxc-blue)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dxc-blue)' }}>
                  {t('roadmap.totalCharge', undefined, 'Total Effort')}
                </span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                {totalDays} <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>j/h</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                {roadmap.estimated_timeline}
              </p>
            </div>

            {/* Team */}
            {roadmap.equipe_recommandee && (
              <div style={{ padding: '16px 18px', background: 'rgba(5,150,105,0.05)', borderRadius: 10, border: '1px solid rgba(5,150,105,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <UserCheck size={13} style={{ color: '#059669' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#059669' }}>
                    {t('roadmap.equipeRecommandee', undefined, 'Team')}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                  {roadmap.equipe_recommandee}
                </p>
              </div>
            )}
          </div>

          {/* Business Value */}
          {roadmap.business_value.length > 0 && (
            <div style={{ padding: '16px 18px', background: 'var(--bg-soft)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <TrendingUp size={13} style={{ color: '#059669' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                  {t('roadmap.businessValue', undefined, 'Business Value')}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 16px' }}>
                {roadmap.business_value.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669', marginTop: 6, flexShrink: 0 }} />
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Phases ── */}
          {roadmap.roadmap.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                  {t('roadmap.phases', undefined, 'Delivery Phases')}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {roadmap.roadmap.map((phase, i) => {
                  const color = PHASE_COLORS[i % PHASE_COLORS.length]
                  const isLast = i === roadmap.roadmap.length - 1
                  return (
                    <div key={i} style={{ display: 'flex', gap: 18 }}>

                      {/* Spine */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 11, fontWeight: 800,
                          fontFamily: 'var(--font-mono)', boxShadow: `0 0 0 4px ${color}22`,
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 16, background: 'var(--border-light)', margin: '6px 0' }} />}
                      </div>

                      {/* Card */}
                      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
                        <div style={{ background: 'var(--bg-soft)', borderRadius: 10, padding: '16px 18px', borderLeft: `3px solid ${color}` }}>

                          {/* Title row */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                              {phase.phase}
                            </p>
                            {/* Charge + Budget badges */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: 'var(--bg-white)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
                                <Clock size={10} style={{ color }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                  {phase.charge_jours} j/h
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: `${color}15`, borderRadius: 'var(--radius-full)', border: `1px solid ${color}33` }}>
                                <Euro size={10} style={{ color }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color, whiteSpace: 'nowrap' }}>
                                  {phase.budget_phase}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {phase.description && (
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 12px' }}>
                              {phase.description}
                            </p>
                          )}

                          {/* Profils */}
                          {phase.profils?.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                <Users size={11} style={{ color }} />
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                                  {t('roadmap.profils', undefined, 'Profiles')}
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {phase.profils.map((p, j) => (
                                  <span key={j} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${color}18`, color, fontWeight: 600, border: `1px solid ${color}33` }}>
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions + Livrables */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {phase.key_actions?.length > 0 && (
                              <div>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                                  {t('roadmap.keyActions', undefined, 'Key Actions')}
                                </span>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {phase.key_actions.map((action, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--text-dim)' }}>
                                      <span style={{ color, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>›</span>
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {phase.livrables?.length > 0 && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                  <Package size={11} style={{ color: '#059669' }} />
                                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
                                    {t('roadmap.livrables', undefined, 'Deliverables')}
                                  </span>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {phase.livrables.map((l, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--text-dim)' }}>
                                      <span style={{ color: '#059669', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
                                      {l}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Risks & Mitigations ── */}
          {roadmap.risks_and_mitigations.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <AlertTriangle size={14} style={{ color: 'var(--dxc-orange)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                  {t('roadmap.risksAndMitigations', undefined, 'Risks & Mitigations')}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '6px 14px', background: '#fff7ed', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--dxc-orange)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t('roadmap.risk', undefined, 'Risk')}
                  </span>
                </div>
                <div style={{ padding: '6px 14px', background: '#f0fdf4', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t('roadmap.mitigation', undefined, 'Mitigation')}
                  </span>
                </div>
                {roadmap.risks_and_mitigations.map((item, i) => (
                  <>
                    <div key={`r-${i}`} style={{ padding: '10px 14px', background: '#fff7ed', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.risk}</div>
                    <div key={`m-${i}`} style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.mitigation}</div>
                  </>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      )}
    </div>
  )
}
