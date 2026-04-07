import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Map, Clock, TrendingUp, AlertTriangle, Users, Package,
  Banknote, UserCheck, Target, CheckSquare, ChevronRight, Activity,
} from 'lucide-react'
import { generateRoadmap } from '../../api/usecases'
import { useTranslation } from '../../hooks/useTranslation'
import type { Roadmap } from '../../types/roadmap'

const PHASE_COLORS = ['#3b6fd4', '#e8760a', '#059669', '#7c3aed', '#dc2626', '#0891b2']

const COMPLEXITY_MAP: Record<string, { bg: string; border: string; color: string; emoji: string }> = {
  faible:  { bg: 'rgba(5,150,105,0.1)',  border: 'rgba(5,150,105,0.3)',  color: '#059669', emoji: '🟢' },
  moyenne: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#d97706', emoji: '🟡' },
  elevee:  { bg: 'rgba(220,38,38,0.1)',  border: 'rgba(220,38,38,0.3)',  color: '#dc2626', emoji: '🔴' },
}

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

  const totalBufferedDays = roadmap?.roadmap.reduce(
    (sum, p) => sum + (p.charge_avec_buffer ?? p.charge_jours ?? 0), 0,
  ) ?? 0
  const toWeeks = (days: number) => Math.round((days / 5) * 10) / 10

  const complexityCfg = roadmap?.banner?.complexity
    ? (COMPLEXITY_MAP[roadmap.banner.complexity] ?? COMPLEXITY_MAP.moyenne)
    : null

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
          {[80, 120, 100, 80].map((h, i) => (
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

          {/* ══ 1. COMMUNICATION BANNER ══ */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(124,58,237,0.04) 100%)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 14,
            padding: '22px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(90,141,232,0.05)', pointerEvents: 'none' }} />

            {/* Title + complexity badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
                🎯 {roadmap.use_case_title}
              </h2>
              {complexityCfg && (
                <div style={{ padding: '5px 14px', borderRadius: 'var(--radius-full)', background: complexityCfg.bg, border: `1px solid ${complexityCfg.border}`, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: complexityCfg.color, whiteSpace: 'nowrap' }}>
                    {complexityCfg.emoji} {t('roadmap.complexity', undefined, 'Complexité')} : {t(`roadmap.complexity_${roadmap.banner!.complexity}`, undefined, roadmap.banner!.complexity)}
                  </span>
                </div>
              )}
            </div>

            {/* Pitch */}
            {roadmap.banner?.pitch && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.65, maxWidth: 600, borderBottom: '1px solid rgba(59,130,246,0.1)', paddingBottom: 16 }}>
                💡 {roadmap.banner.pitch}
              </p>
            )}

            {/* KPI chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { icon: Clock,      label: t('roadmap.totalCharge', undefined, 'Effort'),      value: `${totalBufferedDays} JH (~${toWeeks(totalBufferedDays)} sem.)` },
                { icon: Map,        label: t('roadmap.timeline',    undefined, 'Durée'),        value: roadmap.estimated_timeline },
                { icon: TrendingUp, label: t('roadmap.roiAttendu',  undefined, 'ROI attendu'), value: roadmap.banner?.roi_attendu ?? '—' },
                { icon: Users,      label: t('roadmap.cible',       undefined, 'Cible'),        value: roadmap.banner?.cible ?? '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.65)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Icon size={11} style={{ color: 'var(--dxc-blue)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-dim)' }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ══ 2. HYPOTHÈSES DE BASE ══ */}
          {roadmap.hypotheses && (
            <div style={{ borderRadius: 12, border: '1px solid rgba(245,158,11,0.22)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'rgba(245,158,11,0.07)', borderBottom: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={13} style={{ color: '#d97706' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706' }}>
                  ⚠️ {t('roadmap.hypothesesTitle', undefined, 'Hypothèses de Base')}
                </span>
              </div>

              <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                {([
                  { key: 'techniques',      label: t('roadmap.hypothesesTechniques', undefined, '⚙️ Techniques'),         color: '#3b82f6', items: roadmap.hypotheses.techniques },
                  { key: 'orga',            label: t('roadmap.hypothesesOrga',       undefined, '🏢 Organisationnelles'), color: '#7c3aed', items: roadmap.hypotheses.organisationnelles },
                  { key: 'business',        label: t('roadmap.hypothesesBusiness',   undefined, '💼 Business'),           color: '#059669', items: roadmap.hypotheses.business },
                ] as const).map(({ key, label, color, items }) => (
                  <div key={key}>
                    <p style={{ fontSize: 11, fontWeight: 700, color, margin: '0 0 8px' }}>{label}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(items ?? []).map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <CheckSquare size={11} style={{ color, flexShrink: 0, marginTop: 2 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {roadmap.hypotheses.impact_variation && (
                <div style={{ padding: '10px 18px', background: 'rgba(245,158,11,0.05)', borderTop: '1px solid rgba(245,158,11,0.12)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>📍 {roadmap.hypotheses.impact_variation}</span>
                </div>
              )}
            </div>
          )}

          {/* ══ 3. KPI STRIP ══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {roadmap.budget_total && (
              <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, rgba(232,118,10,0.08) 0%, rgba(232,118,10,0.03) 100%)', borderRadius: 10, border: '1px solid rgba(232,118,10,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Banknote size={13} style={{ color: 'var(--dxc-orange)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dxc-orange)' }}>
                    {t('roadmap.budgetTotal', undefined, 'Budget total')}
                  </span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                  {roadmap.budget_total}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                  {t('roadmap.dailyRate', undefined, 'à 8 500 MAD/jour taux mixte')}
                </p>
              </div>
            )}
            <div style={{ padding: '16px 18px', background: 'rgba(90,141,232,0.05)', borderRadius: 10, border: '1px solid rgba(90,141,232,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Clock size={13} style={{ color: 'var(--dxc-blue)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--dxc-blue)' }}>
                  {t('roadmap.totalCharge', undefined, 'Charge totale')}
                </span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                {totalBufferedDays} <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>JH</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0' }}>
                ~{toWeeks(totalBufferedDays)} sem. · {roadmap.estimated_timeline}
              </p>
            </div>
            {roadmap.equipe_recommandee && (
              <div style={{ padding: '16px 18px', background: 'rgba(5,150,105,0.05)', borderRadius: 10, border: '1px solid rgba(5,150,105,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <UserCheck size={13} style={{ color: '#059669' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#059669' }}>
                    {t('roadmap.equipeRecommandee', undefined, 'Équipe recommandée')}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
                  {roadmap.equipe_recommandee}
                </p>
              </div>
            )}
          </div>

          {/* ══ 4. EXPECTATIONS TABLE ══ */}
          {roadmap.expectations && (
            <div style={{ borderRadius: 12, border: '1px solid rgba(90,141,232,0.15)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'rgba(90,141,232,0.06)', borderBottom: '1px solid rgba(90,141,232,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={13} style={{ color: 'var(--dxc-blue)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dxc-blue)' }}>
                  📊 {t('roadmap.expectationsTitle', undefined, 'Projections & Scénarios')}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--bg-soft)', borderBottom: '1px solid var(--border-light)', width: '28%' }}>
                        {t('roadmap.dimension', undefined, 'Dimension')}
                      </th>
                      {([
                        { key: 'pessimiste', emoji: '😟', color: '#dc2626', bg: '#fef2f2', label: t('roadmap.pessimiste', undefined, 'Pessimiste') },
                        { key: 'realiste',   emoji: '🎯', color: '#2563eb', bg: '#eff6ff', label: t('roadmap.realiste',   undefined, 'Réaliste')   },
                        { key: 'optimiste',  emoji: '🚀', color: '#059669', bg: '#f0fdf4', label: t('roadmap.optimiste',  undefined, 'Optimiste')  },
                      ] as const).map(({ key, emoji, color, bg, label }) => (
                        <th key={key} style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color, background: bg, borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                          {emoji} {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roadmap.expectations.rows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)', background: i % 2 === 0 ? 'var(--bg-white)' : 'var(--bg-soft)' }}>
                          {row.label}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#dc2626', fontWeight: 600, background: i % 2 === 0 ? 'rgba(254,242,242,0.5)' : 'rgba(254,242,242,0.85)' }}>
                          {row.pessimiste}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#2563eb', fontWeight: 700, background: i % 2 === 0 ? 'rgba(239,246,255,0.5)' : 'rgba(239,246,255,0.85)', borderLeft: '2px solid rgba(59,130,246,0.15)', borderRight: '2px solid rgba(59,130,246,0.15)' }}>
                          {row.realiste}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#059669', fontWeight: 600, background: i % 2 === 0 ? 'rgba(240,253,244,0.5)' : 'rgba(240,253,244,0.85)' }}>
                          {row.optimiste}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {((roadmap.expectations.facteurs_pessimiste?.length ?? 0) > 0 || (roadmap.expectations.facteurs_optimiste?.length ?? 0) > 0) && (
                <div style={{ padding: '14px 18px', background: 'var(--bg-soft)', borderTop: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {(roadmap.expectations.facteurs_pessimiste?.length ?? 0) > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        😟 {t('roadmap.facteursPessimiste', undefined, 'Facteurs pessimistes')}
                      </p>
                      {roadmap.expectations.facteurs_pessimiste?.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--text-dim)', marginBottom: 3 }}>
                          <ChevronRight size={11} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                  {(roadmap.expectations.facteurs_optimiste?.length ?? 0) > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        🚀 {t('roadmap.facteursOptimiste', undefined, 'Facteurs optimistes')}
                      </p>
                      {roadmap.expectations.facteurs_optimiste?.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--text-dim)', marginBottom: 3 }}>
                          <ChevronRight size={11} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ 5. BUSINESS VALUE ══ */}
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

          {/* ══ 6. PHASES ══ */}
          {roadmap.roadmap.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                  {t('roadmap.phases', undefined, 'Phases de Delivery')}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {roadmap.roadmap.map((phase, i) => {
                  const color = PHASE_COLORS[i % PHASE_COLORS.length]
                  const isLast = i === roadmap.roadmap.length - 1
                  const buffered = phase.charge_avec_buffer ?? phase.charge_jours
                  return (
                    <div key={i} style={{ display: 'flex', gap: 18 }}>
                      {/* Spine */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)', boxShadow: `0 0 0 4px ${color}22` }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: 'var(--bg-white)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
                                <Clock size={10} style={{ color }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                  {buffered} JH
                                </span>
                                {phase.charge_avec_buffer && phase.charge_avec_buffer !== phase.charge_jours && (
                                  <span style={{ fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                                    (base {phase.charge_jours})
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: `${color}15`, borderRadius: 'var(--radius-full)', border: `1px solid ${color}33` }}>
                                <Banknote size={10} style={{ color }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color, whiteSpace: 'nowrap' }}>
                                  {phase.budget_phase}
                                </span>
                              </div>
                            </div>
                          </div>

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
                                  {t('roadmap.profils', undefined, 'Profils')}
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
                                  {t('roadmap.keyActions', undefined, 'Actions clés')}
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
                                    {t('roadmap.livrables', undefined, 'Livrables')}
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

                          {/* Go / No-Go */}
                          {phase.go_no_go && (
                            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(5,150,105,0.07)', borderRadius: 8, borderLeft: '3px solid #059669', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', flexShrink: 0, marginTop: 1, whiteSpace: 'nowrap' }}>
                                ✅ {t('roadmap.goNoGo', undefined, 'GO / NO-GO')}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{phase.go_no_go}</span>
                            </div>
                          )}

                          {/* Phase risks */}
                          {phase.risques_phase && phase.risques_phase.length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {phase.risques_phase.map((r, j) => (
                                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, padding: '6px 10px', background: 'rgba(232,118,10,0.05)', borderRadius: 6, border: '1px solid rgba(232,118,10,0.12)' }}>
                                  <AlertTriangle size={11} style={{ color: '#e8760a', flexShrink: 0, marginTop: 1 }} />
                                  <span style={{ color: 'var(--text-dim)' }}>
                                    <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{r.risk}</strong>
                                    {r.mitigation && <> → {r.mitigation}</>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Dependencies */}
                          {phase.dependances && phase.dependances.length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)' }}>
                                🔗 {t('roadmap.dependances', undefined, 'Dépend de')} :
                              </span>
                              {phase.dependances.map((d, j) => (
                                <span key={j} style={{ fontSize: 11, padding: '2px 9px', background: `${color}12`, borderRadius: 4, color, fontWeight: 500, border: `1px solid ${color}25` }}>
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══ 7. MÉTRIQUES DE SUCCÈS ══ */}
          {roadmap.metriques_succes && (
            <div style={{ borderRadius: 12, border: '1px solid rgba(5,150,105,0.2)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'rgba(5,150,105,0.07)', borderBottom: '1px solid rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={13} style={{ color: '#059669' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669' }}>
                  ✅ {t('roadmap.metriquesSucces', undefined, 'Critères de Succès')}
                </span>
              </div>
              <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                {([
                  { key: 'livraison',   label: t('roadmap.livraison',   undefined, '📦 Livraison'),    color: '#3b82f6', items: roadmap.metriques_succes.livraison   },
                  { key: 'adoption_m3', label: t('roadmap.adoptionM3',  undefined, '👥 Adoption M+3'), color: '#7c3aed', items: roadmap.metriques_succes.adoption_m3 },
                  { key: 'impact_m6',   label: t('roadmap.impactM6',    undefined, '📈 Impact M+6'),   color: '#059669', items: roadmap.metriques_succes.impact_m6   },
                ] as const).map(({ key, label, color, items }) => (
                  <div key={key}>
                    <p style={{ fontSize: 11, fontWeight: 700, color, margin: '0 0 8px' }}>{label}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {(items ?? []).map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ color, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {roadmap.metriques_succes.signal_abandon && (
                <div style={{ padding: '10px 18px', background: '#fef2f2', borderTop: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <AlertTriangle size={13} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    <strong style={{ color: '#dc2626', marginRight: 4 }}>
                      🚨 {t('roadmap.signalAbandon', undefined, "Signal d'abandon")} :
                    </strong>
                    {roadmap.metriques_succes.signal_abandon}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ══ 8. RISKS & MITIGATIONS ══ */}
          {roadmap.risks_and_mitigations.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <AlertTriangle size={14} style={{ color: 'var(--dxc-orange)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                  {t('roadmap.risksAndMitigations', undefined, 'Risques & Mitigations')}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '6px 14px', background: '#fff7ed', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--dxc-orange)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t('roadmap.risk', undefined, 'Risque')}
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
