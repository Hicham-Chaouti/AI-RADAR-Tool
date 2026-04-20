import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import { useRadarStore } from '../store/radarStore'
import { exportPdf } from '../api/export'
import { ArrowLeft, FileDown, FileText } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import RadarChart from '../components/radar/RadarChart'
import UseCaseList from '../components/radar/UseCaseList'
import QuickPreviewPanel from '../components/radar/QuickPreviewPanel'
import ScoreBreakdown from '../components/radar/ScoreBreakdown'
import type { UseCaseScored } from '../types/useCase'
import { useTranslation } from '../hooks/useTranslation'

export default function RadarPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session, topTen, isLoading } = useSessionStore()
  const { selectedNodeId, setSelectedNode } = useRadarStore()
  const [exporting, setExporting] = useState(false)

  const selected = useMemo(() =>
    topTen.find(uc => (uc.use_case_id || uc.id) === selectedNodeId) || (topTen.length > 0 ? topTen[0] : null),
    [topTen, selectedNodeId]
  )

  const handleSelect = (item: UseCaseScored) => {
    setSelectedNode(item.use_case_id || item.id || null)
  }

  const handleExportPdf = async () => {
    if (!session?.id) return
    setExporting(true)
    try {
      const blob = await exportPdf(session.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AI-Radar-${session.client_name || 'report'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error('Export failed:', e) }
    setExporting(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 30% 50%, rgba(90,141,232,0.04) 0%, transparent 50%)',
      }}>
        {/* Header bar */}
        <div style={{
          padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)', background: 'var(--bg-white)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/onboarding')} className="btn btn-ghost" style={{ fontSize: 13 }}>
              <ArrowLeft size={14} /> {t('actions.newAnalysis')}
            </button>
            {session && (
              <span style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                background: 'var(--dxc-blue-light)', fontWeight: 600, fontSize: 13,
                color: 'var(--dxc-blue)',
              }}>
                {session.client_name} · {session.sector}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExportPdf} disabled={exporting || !session} className="btn btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>
              <FileDown size={14} /> {exporting ? t('actions.exporting') : t('actions.exportPdf')}
            </button>
            <button disabled className="btn btn-secondary" style={{ fontSize: 13, padding: '8px 18px', opacity: 0.5 }} title="Coming V2">
              <FileText size={14} /> Export PPT
            </button>
          </div>
        </div>

        {/* 2-zone layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, maxWidth: 1400, margin: '0 auto' }}>
          {/* Zone A — Radar + Score Breakdown */}
          <div style={{ padding: 32 }}>
            <div className="card" style={{ padding: 24, marginBottom: 24, background: 'var(--bg-white)' }}>
              <RadarChart data={selected} isLoading={isLoading} />
            </div>
            <div className="card" style={{ padding: 24, background: 'var(--bg-white)' }}>
              <ScoreBreakdown item={selected} />
            </div>
          </div>

          {/* Zone B — List + Preview */}
          <div style={{ borderLeft: '1px solid var(--border-light)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                {t('radar.topTen')}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
                {topTen.length} {t('radar.results')}
              </span>
            </div>

            <UseCaseList items={topTen} selectedId={selectedNodeId || (topTen[0] && (topTen[0].use_case_id || topTen[0].id)) || null} onSelect={handleSelect} isLoading={isLoading} />

            <QuickPreviewPanel item={selected} onClose={() => setSelectedNode(null)} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
