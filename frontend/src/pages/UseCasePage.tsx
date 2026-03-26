import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { getUseCase } from '../api/usecases'
import { exportPdf } from '../api/export'
import { ArrowLeft, FileDown, ExternalLink, Tag, Zap, Globe, Sparkles } from 'lucide-react'
import type { UseCase } from '../types/useCase'

import Navbar from '../components/layout/Navbar'
import ScoreBadge from '../components/ui/ScoreBadge'
import ScoreBar from '../components/ui/ScoreBar'
import ReactECharts from 'echarts-for-react'
import { useTranslation } from '../hooks/useTranslation'
import { useLocalizedDynamicText } from '../hooks/useLocalizedDynamicText'

function parseMarkdownBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function UseCasePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, topTen } = useSessionStore()
  const [detail, setDetail] = useState<UseCase | null>(null)
  const [exporting, setExporting] = useState(false)

  const scored = useMemo(() =>
    topTen.find(uc => (uc.use_case_id || uc.id) === id) || null
  , [topTen, id])

  const { text: translatedDescription } = useLocalizedDynamicText(detail?.description)
  const { text: translatedAiSolution } = useLocalizedDynamicText(detail?.ai_solution)
  const { text: translatedJustification } = useLocalizedDynamicText(scored?.justification)

  useEffect(() => {
    if (id) getUseCase(id).then(setDetail).catch(console.error)
  }, [id])

  const handleExport = async () => {
    if (!session?.id) return
    setExporting(true)
    try {
      const blob = await exportPdf(session.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `AI-Radar-${detail?.title || 'report'}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e) }
    setExporting(false)
  }

  const radarOption = useMemo(() => {
    const axes = scored?.radar_axes
    const values = axes ? [axes.roi_potential, axes.technical_complexity, axes.market_maturity, axes.regulatory_risk, axes.quick_win_potential] : [0,0,0,0,0]
    return {
      radar: {
        indicator: [
          { name: 'ROI', max: 10 }, { name: 'Tech', max: 10 },
          { name: 'Market', max: 10 }, { name: 'Risk', max: 10 }, { name: 'Quick Win', max: 10 },
        ],
        shape: 'circle', splitNumber: 4,
        axisName: { color: '#6b7280', fontSize: 11, fontWeight: 600 },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
        splitArea: { areaStyle: { color: ['rgba(90,141,232,0.02)', 'transparent'] } },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [{ type: 'radar', data: [{ value: values, lineStyle: { color: '#5a8de8', width: 2.5 }, areaStyle: { color: 'rgba(90,141,232,0.2)' }, itemStyle: { color: '#fff', borderColor: '#5a8de8', borderWidth: 2.5 } }], animationDuration: 1200 }],
    }
  }, [scored])

  const bars = [
    { key: 'trend_strength' as const, label: 'Trend Strength', color: 'var(--dxc-blue)' },
    { key: 'client_relevance' as const, label: 'Client Relevance', color: 'var(--dxc-orange)' },
    { key: 'capability_match' as const, label: 'Capability Match', color: 'var(--accent-emerald)' },
    { key: 'market_momentum' as const, label: 'Market Momentum', color: 'var(--accent-purple)' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)', background: 'var(--bg-white)',
        }}>
          <button onClick={() => navigate('/radar')} className="btn btn-ghost" style={{ fontSize: 13 }}>
            <ArrowLeft size={14} /> {t('radar.backToResults')}
          </button>
          <button onClick={handleExport} disabled={exporting} className="btn btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>
            <FileDown size={14} /> {exporting ? t('actions.exporting') : t('actions.exportPdf')}
          </button>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px', display: 'grid', gridTemplateColumns: '340px 1fr', gap: 40 }}>
          {/* LEFT — Score Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Score Circle */}
            <div className="card" style={{ padding: 32, textAlign: 'center', background: 'var(--bg-white)' }}>
              <ScoreBadge score={scored?.radar_score || 0} size="lg" />
              {scored && (
                <div style={{ marginTop: 12 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    background: scored.rank <= 3 ? 'var(--score-high)' : 'var(--dxc-blue)',
                    color: 'white',
                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                  }}>
                    {t('radar.rank', { rank: scored.rank })}
                  </span>
                </div>
              )}
            </div>

            {/* Mini Radar */}
            <div className="card" style={{ padding: 16, background: 'var(--bg-white)' }}>
              <ReactECharts option={radarOption} style={{ width: '100%', height: 260 }} opts={{ renderer: 'svg' }} />
            </div>

            {/* Score Bars */}
            {scored && (
              <div className="card" style={{ padding: 20, background: 'var(--bg-white)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bars.map((b, i) => (
                  <ScoreBar key={b.key} label={b.label} value={scored.score_breakdown[b.key]} max={10} color={b.color} delay={i * 0.1} />
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="card" style={{ padding: 20, background: 'var(--bg-white)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(detail?.source_url || scored?.source_url) && (
                <MetaRow icon={<Globe size={14} />} label={t('radar.source')}
                  value={<a href={detail?.source_url || scored?.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dxc-blue)', fontSize: 13 }}>
                    {detail?.source_name || scored?.source_name || t('common.viewSource')} <ExternalLink size={10} style={{ display: 'inline' }} />
                  </a>}
                />
              )}
              {scored?.archetype && (
                <MetaRow icon={<Tag size={14} />} label={t('radar.archetype')}
                  value={<span className="chip chip--active" style={{ fontSize: 11, padding: '2px 8px' }}>{scored.archetype}</span>}
                />
              )}
              {scored?.quick_win && (
                <MetaRow icon={<Zap size={14} />} label={t('radar.quickWin')}
                  value={<span style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: 13 }}>{t('common.yesFastImplementation')}</span>}
                />
              )}
            </div>
          </div>

          {/* RIGHT — Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Title */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 8 }}>
                {detail?.title || scored?.title || t('common.loading')}
              </h1>
            </div>

            {/* Description */}
            {translatedDescription && (
              <div className="card" style={{ padding: 24, background: 'var(--bg-white)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('radar.description')}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {translatedDescription}
                </p>
              </div>
            )}

            {/* AI Solution */}
            {translatedAiSolution && (
              <div style={{ padding: 24, background: 'var(--bg-soft)', borderRadius: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('radar.aiSolution')}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {translatedAiSolution}
                </p>
              </div>
            )}

            {/* Benefits */}
            {detail?.measurable_benefit && (
              <div className="card" style={{ padding: 24, background: 'var(--bg-white)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('radar.benefits')}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detail.measurable_benefit.split(/[;,\n]/).filter(Boolean).map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--dxc-orange)', marginTop: 7, flexShrink: 0 }} />
                      {b.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Justification — highlighted */}
            {translatedJustification && (
              <div style={{
                padding: 24, background: 'var(--dxc-orange-light)',
                borderRadius: 12,
                borderLeft: '4px solid var(--dxc-orange)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Sparkles size={14} style={{ color: 'var(--dxc-orange)' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dxc-orange)' }}>
                    {t('radar.generatedJustification')}
                  </span>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.8, fontStyle: 'italic' }}>
                  {parseMarkdownBold(translatedJustification)}
                </p>
                <div style={{
                  marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-white)', padding: '4px 12px', borderRadius: 'var(--radius-full)',
                  fontSize: 11, color: 'var(--text-dim)',
                }}>
                  {t('radar.poweredBy', { client: session?.client_name || 'client' })}
                </div>
              </div>
            )}

            {/* Tech Keywords */}
            {detail?.tech_keywords && detail.tech_keywords.length > 0 && (
              <div className="card" style={{ padding: 24, background: 'var(--bg-white)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t('radar.dataPrerequisites')}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {detail.tech_keywords.map(kw => (
                    <span key={kw} style={{
                      background: 'var(--bg-muted)', border: '1px solid var(--border-light)',
                      padding: '4px 12px', borderRadius: 'var(--radius-full)',
                      fontSize: 12, color: 'var(--text-secondary)',
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
