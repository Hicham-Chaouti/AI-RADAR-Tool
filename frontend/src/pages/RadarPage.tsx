import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { useSessionStore } from '../store/sessionStore'
import { exportPdf } from '../api/export'
import { searchUseCases } from '../api/search'
import {
    listFeedback,
    saveFeedback,
    type FeedbackItem,
    type DecisionConfidence,
    type DecisionStatus,
    type TimeToValue,
    type RiskIncidents,
} from '../api/feedback'
import { getArchetypeColor } from '../utils/constants'
import type { UseCaseScored } from '../types/useCase'

/* ── Axis descriptions ── */
const AXIS_DESCRIPTIONS: Record<string, string> = {
    'Trend Strength': 'How strong and durable this use-case trend is across the market.',
    'Client Relevance': 'How well this use case matches the current client context and objectives.',
    'Capability Match': 'How closely this use case fits the available delivery and technical capabilities.',
    'Market Momentum': 'How quickly this use case category is being adopted in the market.',
}

const AXIS_NAMES = ['Trend Strength', 'Client Relevance', 'Capability Match', 'Market Momentum']

function getRadarValues(uc: UseCaseScored): number[] {
    const sb = uc.score_breakdown
    return [
        sb?.trend_strength ?? 5,
        sb?.client_relevance ?? 5,
        sb?.capability_match ?? 5,
        sb?.market_momentum ?? 5,
    ]
}

function scoreColor(score: number): string {
    if (score >= 8) return '#4ade80'
    if (score >= 7) return '#FF9259'
    return '#a8b8d8'
}

function feedbackDecisionColor(status: DecisionStatus): string {
    if (status === 'approve') return '#4ade80'
    if (status === 'reject') return '#E98166'
    return '#FF9259'
}

const SPACE = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
} as const

const FONT = {
    xs: 11,
    sm: 12,
    md: 13,
    lg: 14,
    xl: 16,
    xxl: 18,
} as const

/* ── Score bar ── */
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                <span style={{ color: '#5a6a88' }}>{label}</span>
                <span style={{ fontWeight: 600, color: '#f0f4ff' }}>{value.toFixed(1)}</span>
            </div>
            <div style={{ height: 3, background: '#1a2235', borderRadius: 2 }}>
                <div style={{
                    height: '100%',
                    width: `${(value / 10) * 100}%`,
                    background: color,
                    borderRadius: 2,
                    transition: 'width 0.4s ease-out',
                }} />
            </div>
        </div>
    )
}

/* ── Lightweight item for "All Results" from search API ── */
interface SearchItem {
    use_case_id: string
    title: string
    sector_normalized: string
    archetype: string | null
    weighted_score: number
    radar_score?: number | null
    score_breakdown?: {
        trend_strength: number
        client_relevance: number
        capability_match: number
        market_momentum: number
    }
    quick_win: boolean
    company_example?: string | null
    source_name?: string | null
    source_url: string | null
}

interface AllResultsDisplayItem {
    use_case_id: string
    title: string
    rank: number
    radar_score: number
    score_breakdown?: {
        trend_strength: number
        client_relevance: number
        capability_match: number
        market_momentum: number
    }
    archetype: string | null
    quick_win: boolean
    company_example: string | null
    source_name: string | null
}

interface FeedbackDraft {
    decision_status: DecisionStatus
    confidence: DecisionConfidence
    strategic_fit: number
    business_value: number
    feasibility: number
    time_to_value: TimeToValue
    blockers: string[]
    rationale: string
    owner: string
    next_step_date: string
    implemented: boolean
    kpi_name: string
    baseline_value: string
    current_value: string
    adoption_percent: string
    satisfaction: string
    delivery_difficulty: string
    risk_incidents: RiskIncidents
    outcome_comment: string
}

const DEFAULT_FEEDBACK_DRAFT: FeedbackDraft = {
    decision_status: 'defer',
    confidence: 'medium',
    strategic_fit: 3,
    business_value: 3,
    feasibility: 3,
    time_to_value: 'm3_6',
    blockers: [],
    rationale: '',
    owner: '',
    next_step_date: '',
    implemented: false,
    kpi_name: '',
    baseline_value: '',
    current_value: '',
    adoption_percent: '',
    satisfaction: '',
    delivery_difficulty: '',
    risk_incidents: 'none',
    outcome_comment: '',
}

type DisplayListItem = UseCaseScored | AllResultsDisplayItem

type ChartClickEvent = {
    name?: string
}

export default function RadarPage() {
    const navigate = useNavigate()
    const { session, topTen } = useSessionStore()
    const [selected, setSelected] = useState<UseCaseScored | null>(null)
    const [filter, setFilter] = useState<'top10' | 'all'>('top10')
    const [search, setSearch] = useState('')
    const [activeAxis, setActiveAxis] = useState<string | null>(null)
    const [allResults, setAllResults] = useState<SearchItem[]>([])
    const [allLoading, setAllLoading] = useState(false)
    const [feedbackByUseCase, setFeedbackByUseCase] = useState<Record<string, FeedbackItem>>({})
    const [feedbackOpen, setFeedbackOpen] = useState(false)
    const [feedbackTarget, setFeedbackTarget] = useState<{ use_case_id: string; title: string } | null>(null)
    const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft>(DEFAULT_FEEDBACK_DRAFT)
    const [feedbackSaving, setFeedbackSaving] = useState(false)
    const [feedbackError, setFeedbackError] = useState<string | null>(null)
    const outcomeSectionRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!session || topTen.length === 0) {
            navigate('/onboarding')
        }
    }, [session, topTen, navigate])

    // Fetch all results when page loads
    useEffect(() => {
        if (!session) return
        setAllLoading(true)
        searchUseCases({ q: 'ai', session_id: session.id, limit: 50 })
            .then((res) => setAllResults(res.results))
            .catch(() => setAllResults([]))
            .finally(() => setAllLoading(false))
    }, [session])

    // Load existing feedback for this session
    useEffect(() => {
        if (!session) return
        listFeedback(session.id)
            .then((res) => {
                const mapped = Object.fromEntries(res.items.map((item) => [item.use_case_id, item]))
                setFeedbackByUseCase(mapped)
            })
            .catch(() => setFeedbackByUseCase({}))
    }, [session])

    // Convert search items to display format
    const allResultsDisplay = useMemo<AllResultsDisplayItem[]>(() => {
        return allResults
            .map((r) => ({
                use_case_id: r.use_case_id,
                title: r.title,
                radar_score: r.radar_score ?? 0,
                score_breakdown: r.score_breakdown,
                archetype: r.archetype,
                quick_win: r.quick_win,
                company_example: r.company_example ?? null,
                source_name: r.source_name ?? null,
                rank: 0,
            }))
            .sort((a, b) => b.radar_score - a.radar_score)
            .map((r, i) => ({ ...r, rank: i + 1 }))
    }, [allResults])

    const displayList = useMemo(() => {
        const list = filter === 'top10' ? topTen : allResultsDisplay
        if (!search.trim()) return list
        const q = search.toLowerCase()
        return list.filter((uc) => uc.title.toLowerCase().includes(q))
    }, [topTen, allResultsDisplay, filter, search])

    const handleExport = async () => {
        if (!session) return
        try {
            const blob = await exportPdf(session.id)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `RadarTool_${session.client_name.replace(/ /g, '_')}.pdf`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            console.error('PDF export failed')
        }
    }

    const handleSelectItem = (item: DisplayListItem) => {
        // If it's a top10 scored item, use it directly for radar
        const scoredItem = topTen.find((uc) => uc.use_case_id === item.use_case_id)
        if (scoredItem) {
            setSelected(scoredItem)
        } else {
            // For search results, create a minimal scored item
            setSelected({
                use_case_id: item.use_case_id,
                title: item.title,
                rank: item.rank,
                radar_score: item.radar_score,
                score_breakdown: item.score_breakdown ?? {
                    trend_strength: 5,
                    client_relevance: 5,
                    capability_match: 5,
                    market_momentum: 5,
                },
                justification: null,
                quick_win: item.quick_win,
                archetype: item.archetype,
                company_example: item.company_example,
            })
        }
        setActiveAxis(null)
    }

    const openFeedbackDrawer = (item: Pick<DisplayListItem, 'use_case_id' | 'title'>) => {
        const existing = feedbackByUseCase[item.use_case_id]
        setFeedbackTarget({ use_case_id: item.use_case_id, title: item.title })
        if (existing) {
            setFeedbackDraft({
                decision_status: existing.decision_status,
                confidence: existing.confidence,
                strategic_fit: existing.strategic_fit,
                business_value: existing.business_value,
                feasibility: existing.feasibility,
                time_to_value: existing.time_to_value,
                blockers: existing.blockers ?? [],
                rationale: existing.rationale,
                owner: existing.owner ?? '',
                next_step_date: existing.next_step_date ?? '',
                implemented: Boolean(existing.implemented),
                kpi_name: existing.kpi_name ?? '',
                baseline_value: existing.baseline_value != null ? String(existing.baseline_value) : '',
                current_value: existing.current_value != null ? String(existing.current_value) : '',
                adoption_percent: existing.adoption_percent != null ? String(existing.adoption_percent) : '',
                satisfaction: existing.satisfaction != null ? String(existing.satisfaction) : '',
                delivery_difficulty: existing.delivery_difficulty != null ? String(existing.delivery_difficulty) : '',
                risk_incidents: existing.risk_incidents ?? 'none',
                outcome_comment: existing.outcome_comment ?? '',
            })
        } else {
            setFeedbackDraft(DEFAULT_FEEDBACK_DRAFT)
        }
        setFeedbackError(null)
        setFeedbackOpen(true)
    }

    const handleSaveFeedback = async () => {
        if (!session || !feedbackTarget) return
        if (feedbackDraft.rationale.trim().length < 3) {
            setFeedbackError('Please add a short rationale (min 3 characters).')
            return
        }
        if (feedbackDraft.decision_status === 'approve' && (!feedbackDraft.owner || !feedbackDraft.next_step_date)) {
            setFeedbackError('Owner and next step date are required for approved decisions.')
            return
        }
        if (feedbackDraft.implemented) {
            if (!feedbackDraft.kpi_name.trim()) {
                setFeedbackError('KPI name is required when implemented is set to Yes.')
                return
            }
            if (feedbackDraft.baseline_value.trim() === '' || feedbackDraft.current_value.trim() === '') {
                setFeedbackError('Baseline and current values are required when implemented is set to Yes.')
                return
            }
        }

        setFeedbackSaving(true)
        setFeedbackError(null)
        try {
            const payload: FeedbackItem = {
                session_id: session.id,
                use_case_id: feedbackTarget.use_case_id,
                decision_status: feedbackDraft.decision_status,
                confidence: feedbackDraft.confidence,
                strategic_fit: feedbackDraft.strategic_fit,
                business_value: feedbackDraft.business_value,
                feasibility: feedbackDraft.feasibility,
                time_to_value: feedbackDraft.time_to_value,
                blockers: feedbackDraft.blockers,
                rationale: feedbackDraft.rationale.trim(),
                owner: feedbackDraft.owner || null,
                next_step_date: feedbackDraft.next_step_date || null,
                implemented: feedbackDraft.implemented,
                kpi_name: feedbackDraft.kpi_name || null,
                baseline_value: feedbackDraft.baseline_value.trim() === '' ? null : Number(feedbackDraft.baseline_value),
                current_value: feedbackDraft.current_value.trim() === '' ? null : Number(feedbackDraft.current_value),
                adoption_percent: feedbackDraft.adoption_percent.trim() === '' ? null : Number(feedbackDraft.adoption_percent),
                satisfaction: feedbackDraft.satisfaction.trim() === '' ? null : Number(feedbackDraft.satisfaction),
                delivery_difficulty: feedbackDraft.delivery_difficulty.trim() === '' ? null : Number(feedbackDraft.delivery_difficulty),
                risk_incidents: feedbackDraft.risk_incidents,
                outcome_comment: feedbackDraft.outcome_comment || null,
                updated_by: 'decider',
            }
            const saved = await saveFeedback(payload)
            setFeedbackByUseCase((prev) => ({ ...prev, [saved.use_case_id]: saved }))
            setFeedbackOpen(false)
        } catch {
            setFeedbackError('Failed to save feedback. Please retry.')
        } finally {
            setFeedbackSaving(false)
        }
    }

    const radarOption = selected ? {
        radar: {
            shape: 'circle' as const,
            radius: '65%',
            center: ['50%', '50%'],
            axisName: { color: '#a8b8d8', fontSize: 11, fontWeight: 500 },
            splitLine: { lineStyle: { color: 'rgba(97,152,243,0.1)' } },
            splitArea: { areaStyle: { color: ['rgba(97,152,243,0.03)', 'rgba(97,152,243,0.06)'] } },
            axisLine: { lineStyle: { color: 'rgba(97,152,243,0.15)' } },
            indicator: [
                { name: 'Trend Strength', max: 10 },
                { name: 'Client Relevance', max: 10 },
                { name: 'Capability Match', max: 10 },
                { name: 'Market Momentum', max: 10 },
            ],
        },
        series: [{
            type: 'radar',
            data: [{
                value: getRadarValues(selected),
                name: selected.title,
                areaStyle: { color: 'rgba(97,152,243,0.15)' },
                lineStyle: { color: '#6198F3', width: 2 },
                itemStyle: { color: '#6198F3' },
            }],
        }],
    } : null

    if (!session || topTen.length === 0) return null

    const radarValues = selected ? getRadarValues(selected) : []

    return (
        <div style={{
            background: 'radial-gradient(120% 120% at 10% 5%, #13203b 0%, #080d1a 45%, #060a14 100%)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"Segoe UI Variable Display", "Segoe UI", "Inter", sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
        }}>
            {/* ── TOPBAR ── */}
            <div style={{
                background: 'rgba(13,20,37,0.82)',
                borderBottom: '1px solid rgba(97,152,243,0.1)',
                height: 56,
                padding: `0 ${SPACE.xl}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            }}>
                <img src="/dxclogo.png" alt="DXC" style={{ height: 24 }} />
                <span style={{ fontSize: FONT.md, color: '#a8b8d8', letterSpacing: 0.2 }}>
                    {session.client_name} &middot; {session.sector}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => navigate('/onboarding')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#78A9F6',
                            fontSize: FONT.md,
                            cursor: 'pointer',
                            transition: 'color 0.15s ease',
                        }}
                    >
                        ← New Analysis
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            background: '#FF9259',
                            color: 'white',
                            border: 'none',
                            fontSize: FONT.md,
                            fontWeight: 600,
                            padding: `${SPACE.sm}px ${SPACE.lg}px`,
                            borderRadius: 10,
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(255,146,89,0.28)',
                            transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 10px 24px rgba(255,146,89,0.34)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,146,89,0.28)'
                        }}
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── LEFT COLUMN: USE CASE LIST ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* List header */}
                    <div style={{
                        background: 'linear-gradient(180deg, rgba(13,20,37,0.94) 0%, rgba(12,19,34,0.88) 100%)',
                        borderBottom: '1px solid rgba(97,152,243,0.1)',
                        padding: `${SPACE.lg}px ${SPACE.xl}px`,
                        boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: FONT.xxl, fontWeight: 700, color: '#f0f4ff', letterSpacing: 0.2 }}>Use Cases</span>
                            <span style={{
                                background: 'rgba(97,152,243,0.1)',
                                color: '#6198F3',
                                fontSize: FONT.sm,
                                borderRadius: 20,
                                padding: `${SPACE.xs}px ${SPACE.md}px`,
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {filter === 'top10'
                                    ? `${topTen.length} analysed`
                                    : `${allResults.length} use cases`}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACE.md }}>
                            {/* Toggle */}
                            <div style={{
                                background: 'rgba(17,24,39,0.86)',
                                borderRadius: 10,
                                padding: SPACE.xs,
                                display: 'flex',
                                border: '1px solid rgba(97,152,243,0.14)',
                            }}>
                                {(['top10', 'all'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 6,
                                            border: 'none',
                                            fontSize: FONT.md,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            background: filter === f ? '#6198F3' : 'transparent',
                                            color: filter === f ? 'white' : '#5a6a88',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {f === 'top10' ? 'Top 10 Only' : 'All Results'}
                                    </button>
                                ))}
                            </div>
                            {/* Search */}
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search use cases..."
                                style={{
                                    background: '#111827',
                                    border: '1px solid rgba(97,152,243,0.15)',
                                    color: '#f0f4ff',
                                    borderRadius: 8,
                                    padding: `${SPACE.sm}px 14px`,
                                    width: 220,
                                    fontSize: FONT.md,
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(97,152,243,0.45)'
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(97,152,243,0.14)'
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(97,152,243,0.15)'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Scrollable list */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {allLoading && filter === 'all' ? (
                            // Skeleton loading
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} style={{
                                    height: 72,
                                    margin: '8px 24px',
                                    background: '#111827',
                                    borderRadius: 8,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} />
                            ))
                        ) : displayList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 48, color: '#5a6a88' }}>
                                No use cases found
                            </div>
                        ) : (
                            displayList.map((uc, i) => {
                                const isSelected = selected?.use_case_id === uc.use_case_id
                                const feedback = feedbackByUseCase[uc.use_case_id]
                                return (
                                    <div
                                        key={uc.use_case_id || i}
                                        onClick={() => handleSelectItem(uc)}
                                        style={{
                                            background: isSelected ? '#111827' : '#0d1425',
                                            borderBottom: '1px solid rgba(97,152,243,0.06)',
                                            borderLeft: isSelected ? '3px solid #6198F3' : '3px solid transparent',
                                            padding: isSelected ? `${SPACE.lg}px ${SPACE.xl}px ${SPACE.lg}px 21px` : `${SPACE.lg}px ${SPACE.xl}px`,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                                            boxShadow: isSelected ? 'inset 0 0 0 1px rgba(97,152,243,0.08), 0 8px 24px rgba(0,0,0,0.16)' : 'none',
                                            animation: `fadeInUp 0.24s ease-out both`,
                                            animationDelay: `${Math.min(i, 12) * 0.02}s`,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#111827'
                                                e.currentTarget.style.transform = 'translateY(-1px)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#0d1425'
                                                e.currentTarget.style.transform = 'translateY(0)'
                                            }
                                        }}
                                    >
                                        {/* Rank */}
                                        <span style={{ fontSize: FONT.xs, color: '#5a6a88', fontWeight: 700, width: 32, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                                            #{String(uc.rank).padStart(2, '0')}
                                        </span>

                                        {/* Content */}
                                        <div style={{ flex: 1, marginLeft: 12 }}>
                                            <div style={{ fontSize: FONT.lg, fontWeight: 600, color: '#f0f4ff', lineHeight: 1.35, marginBottom: SPACE.xs }}>
                                                {uc.title}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                {uc.archetype && (
                                                    <span style={{
                                                        background: 'rgba(97,152,243,0.08)',
                                                        border: '1px solid rgba(97,152,243,0.15)',
                                                        color: getArchetypeColor(uc.archetype),
                                                        fontSize: 10,
                                                        padding: '2px 8px',
                                                        borderRadius: 4,
                                                    }}>
                                                        {uc.archetype}
                                                    </span>
                                                )}
                                                {uc.company_example && (
                                                    <span style={{ fontSize: FONT.xs, color: '#7A88A6' }}>{uc.company_example}</span>
                                                )}
                                                {feedback && (
                                                    <span style={{
                                                        background: `${feedbackDecisionColor(feedback.decision_status)}20`,
                                                        border: `1px solid ${feedbackDecisionColor(feedback.decision_status)}44`,
                                                        color: feedbackDecisionColor(feedback.decision_status),
                                                        fontSize: 10,
                                                        padding: '2px 8px',
                                                        borderRadius: 4,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.4,
                                                        fontWeight: 600,
                                                    }}>
                                                        {feedback.decision_status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                                            <div>
                                                <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor(uc.radar_score), fontVariantNumeric: 'tabular-nums' }}>
                                                    {uc.radar_score.toFixed(2)}
                                                </span>
                                                <span style={{ fontSize: FONT.sm, color: '#5a6a88', fontVariantNumeric: 'tabular-nums' }}>/10</span>
                                            </div>
                                            {uc.quick_win && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    marginTop: 4,
                                                    fontSize: 9,
                                                    background: 'rgba(74,222,128,0.1)',
                                                    border: '1px solid rgba(74,222,128,0.2)',
                                                    color: '#4ade80',
                                                    borderRadius: 4,
                                                    padding: '2px 6px',
                                                    letterSpacing: 1,
                                                }}>
                                                    QUICK WIN
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openFeedbackDrawer(uc)
                                                }}
                                                style={{
                                                    display: 'inline-block',
                                                    marginTop: 8,
                                                    background: 'transparent',
                                                    border: '1px solid rgba(97,152,243,0.25)',
                                                    color: '#6198F3',
                                                    borderRadius: 8,
                                                    fontSize: 10,
                                                    padding: `${SPACE.xs}px ${SPACE.sm}px`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(97,152,243,0.12)'
                                                    e.currentTarget.style.borderColor = 'rgba(97,152,243,0.44)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent'
                                                    e.currentTarget.style.borderColor = 'rgba(97,152,243,0.25)'
                                                }}
                                            >
                                                Feedback
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN: RADAR + DETAIL ── */}
                <div style={{
                    width: 496,
                    flexShrink: 0,
                    background: 'linear-gradient(180deg, rgba(13,20,37,0.96) 0%, rgba(11,17,31,0.95) 100%)',
                    borderLeft: '1px solid rgba(97,152,243,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    boxShadow: '-18px 0 34px rgba(0,0,0,0.2)',
                }}>
                    {!selected ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#5a6a88',
                            fontSize: 14,
                        }}>
                            ← Select a use case to view its radar
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(97,152,243,0.1)',
                            }}>
                                <div style={{ fontSize: 11, color: '#FF9259', fontWeight: 600, letterSpacing: 2 }}>
                                    #{String(selected.rank).padStart(2, '0')}
                                </div>
                                <div style={{ fontSize: FONT.xl, fontWeight: 700, color: '#f0f4ff', lineHeight: 1.35, marginTop: SPACE.xs }}>
                                    {selected.title}
                                </div>
                                <div style={{ fontSize: FONT.sm, color: '#7A88A6', marginTop: SPACE.xs }}>
                                    {selected.company_example && <>{selected.company_example} &middot; </>}
                                    {selected.source_name}
                                </div>
                            </div>

                            {/* Radar chart */}
                            <div style={{ padding: '16px 24px' }}>
                                {radarOption && (
                                    <ReactECharts
                                        option={radarOption}
                                        style={{ height: 320, width: '100%' }}
                                        onEvents={{
                                            click: (params: ChartClickEvent) => {
                                                if (params.name && AXIS_NAMES.includes(params.name)) {
                                                    setActiveAxis(params.name === activeAxis ? null : params.name)
                                                }
                                            },
                                        }}
                                    />
                                )}
                            </div>

                            {/* Axis detail panel */}
                            {activeAxis && (
                                <div style={{
                                    margin: '0 24px 16px',
                                    background: '#111827',
                                    border: '1px solid rgba(97,152,243,0.15)',
                                    borderRadius: 10,
                                    padding: 16,
                                    animation: 'fadeIn 0.2s ease-out',
                                }}>
                                    <div style={{ fontSize: 12, color: '#6198F3', fontWeight: 600, letterSpacing: 1 }}>
                                        {activeAxis.toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#f0f4ff', marginTop: 4 }}>
                                        {radarValues[AXIS_NAMES.indexOf(activeAxis)].toFixed(1)} / 10
                                    </div>
                                    <div style={{ fontSize: 13, color: '#a8b8d8', lineHeight: 1.6, marginTop: 8 }}>
                                        {AXIS_DESCRIPTIONS[activeAxis]}
                                    </div>
                                    {selected.justification && (
                                        <div style={{
                                            background: '#0d1425',
                                            borderLeft: '2px solid #FF9259',
                                            padding: '10px 14px',
                                            borderRadius: '0 6px 6px 0',
                                            fontSize: 12,
                                            color: '#a8b8d8',
                                            lineHeight: 1.6,
                                            marginTop: 10,
                                        }}>
                                            {selected.justification}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Score breakdown */}
                            <div style={{ padding: '16px 24px' }}>
                                <ScoreBar label="Trend Strength" value={selected.score_breakdown?.trend_strength ?? 0} color="#6198F3" />
                                <ScoreBar label="Client Relevance" value={selected.score_breakdown?.client_relevance ?? 0} color="#FF9259" />
                                <ScoreBar label="Capability Match" value={selected.score_breakdown?.capability_match ?? 0} color="#4ade80" />
                                <ScoreBar label="Market Momentum" value={selected.score_breakdown?.market_momentum ?? 0} color="#9b8aff" />
                            </div>

                            {/* View full details button */}
                            <div style={{ padding: '0 24px 20px' }}>
                                <button
                                    onClick={() => navigate(`/usecase/${selected.use_case_id || selected.id}`)}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: '1px solid rgba(97,152,243,0.2)',
                                        color: '#6198F3',
                                        fontSize: 13,
                                        padding: 12,
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(97,152,243,0.08)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    View Full Details →
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {feedbackOpen && feedbackTarget && (
                <>
                    <div
                        onClick={() => setFeedbackOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.42)',
                            backdropFilter: 'blur(2px)',
                            zIndex: 49,
                            animation: 'fadeIn 0.2s ease-out',
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: 432,
                        height: '100vh',
                        background: 'linear-gradient(180deg, rgba(13,20,37,0.98) 0%, rgba(10,16,29,0.98) 100%)',
                        borderLeft: '1px solid rgba(97,152,243,0.15)',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '-24px 0 42px rgba(0,0,0,0.42)',
                        animation: 'slideInRight 0.22s ease-out',
                    }}>
                    <div style={{ padding: `${SPACE.lg}px 18px`, borderBottom: '1px solid rgba(97,152,243,0.1)' }}>
                        <div style={{ fontSize: 11, color: '#FF9259', letterSpacing: 1 }}>CLIENT FEEDBACK</div>
                        <div style={{ color: '#f0f4ff', fontSize: 15, fontWeight: 700, marginTop: 6, lineHeight: 1.35 }}>{feedbackTarget.title}</div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ color: '#a8b8d8', fontSize: 11 }}>Decision feedback</div>
                            <button
                                onClick={() => outcomeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(97,152,243,0.25)',
                                    color: '#78A9F6',
                                    borderRadius: 8,
                                    fontSize: 10,
                                    padding: '5px 8px',
                                    cursor: 'pointer',
                                }}
                            >
                                Go to Outcome Feedback
                            </button>
                        </div>

                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Decision</label>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            {(['approve', 'defer', 'reject'] as const).map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setFeedbackDraft((p) => ({ ...p, decision_status: v }))}
                                    style={{
                                        flex: 1,
                                        padding: '6px 8px',
                                        borderRadius: 8,
                                        border: '1px solid rgba(97,152,243,0.2)',
                                        background: feedbackDraft.decision_status === v ? 'rgba(97,152,243,0.2)' : 'transparent',
                                        color: '#f0f4ff',
                                        fontSize: 10,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Confidence</label>
                        <select
                            value={feedbackDraft.confidence}
                            onChange={(e) => setFeedbackDraft((p) => ({ ...p, confidence: e.target.value as DecisionConfidence }))}
                            style={{ width: '100%', marginBottom: 12, background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                        >
                            <option value="low" style={{ fontSize: 10 }}>Low</option>
                            <option value="medium" style={{ fontSize: 10 }}>Medium</option>
                            <option value="high" style={{ fontSize: 10 }}>High</option>
                        </select>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                            {([
                                ['Strategic fit', 'strategic_fit'],
                                ['Business value', 'business_value'],
                                ['Feasibility', 'feasibility'],
                            ] as const).map(([label, key]) => (
                                <div key={key}>
                                    <div style={{ color: '#a8b8d8', fontSize: 11, marginBottom: 4 }}>{label}</div>
                                    <input
                                        type="number"
                                        min={1}
                                        max={5}
                                        value={feedbackDraft[key]}
                                        onChange={(e) => setFeedbackDraft((p) => ({ ...p, [key]: Number(e.target.value || 3) }))}
                                        style={{ width: '100%', background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '6px 8px', fontSize: 10 }}
                                    />
                                </div>
                            ))}
                        </div>

                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Time to value</label>
                        <select
                            value={feedbackDraft.time_to_value}
                            onChange={(e) => setFeedbackDraft((p) => ({ ...p, time_to_value: e.target.value as TimeToValue }))}
                            style={{ width: '100%', marginBottom: 12, background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                        >
                            <option value="lt_3m" style={{ fontSize: 10 }}>Under 3 months</option>
                            <option value="m3_6" style={{ fontSize: 10 }}>3 to 6 months</option>
                            <option value="m6_12" style={{ fontSize: 10 }}>6 to 12 months</option>
                            <option value="gt_12m" style={{ fontSize: 10 }}>Over 12 months</option>
                        </select>

                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Rationale</label>
                        <textarea
                            value={feedbackDraft.rationale}
                            onChange={(e) => setFeedbackDraft((p) => ({ ...p, rationale: e.target.value }))}
                            maxLength={240}
                            rows={4}
                            style={{ width: '100%', marginBottom: 12, background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '8px', resize: 'vertical', fontSize: 10 }}
                        />

                        {feedbackDraft.decision_status === 'approve' && (
                            <>
                                <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Owner</label>
                                <input
                                    value={feedbackDraft.owner}
                                    onChange={(e) => setFeedbackDraft((p) => ({ ...p, owner: e.target.value }))}
                                    style={{ width: '100%', marginBottom: 10, background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                />

                                <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Next step date</label>
                                <input
                                    type="date"
                                    value={feedbackDraft.next_step_date}
                                    onChange={(e) => setFeedbackDraft((p) => ({ ...p, next_step_date: e.target.value }))}
                                    style={{ width: '100%', marginBottom: 12, background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                />
                            </>
                        )}

                        <div style={{ borderTop: '1px solid rgba(97,152,243,0.15)', margin: '6px 0 12px' }} />
                        <div ref={outcomeSectionRef} style={{ color: '#FF9259', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
                            OUTCOME FEEDBACK (POST-IMPLEMENTATION)
                        </div>

                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Implemented</label>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            <button
                                onClick={() => setFeedbackDraft((p) => ({ ...p, implemented: true }))}
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    borderRadius: 8,
                                    border: '1px solid rgba(97,152,243,0.2)',
                                    background: feedbackDraft.implemented ? 'rgba(74,222,128,0.2)' : 'transparent',
                                    color: '#f0f4ff',
                                    fontSize: 10,
                                    cursor: 'pointer',
                                }}
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setFeedbackDraft((p) => ({ ...p, implemented: false }))}
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    borderRadius: 8,
                                    border: '1px solid rgba(97,152,243,0.2)',
                                    background: !feedbackDraft.implemented ? 'rgba(97,152,243,0.2)' : 'transparent',
                                    color: '#f0f4ff',
                                    fontSize: 10,
                                    cursor: 'pointer',
                                }}
                            >
                                No
                            </button>
                        </div>

                        {feedbackDraft.implemented && (
                            <>
                                <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>KPI Name</label>
                                <input
                                    value={feedbackDraft.kpi_name}
                                    onChange={(e) => setFeedbackDraft((p) => ({ ...p, kpi_name: e.target.value }))}
                                    style={{ width: '100%', marginBottom: 10, background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                    <div>
                                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Baseline Value</label>
                                        <input
                                            type="number"
                                            value={feedbackDraft.baseline_value}
                                            onChange={(e) => setFeedbackDraft((p) => ({ ...p, baseline_value: e.target.value }))}
                                            style={{ width: '100%', background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Current Value</label>
                                        <input
                                            type="number"
                                            value={feedbackDraft.current_value}
                                            onChange={(e) => setFeedbackDraft((p) => ({ ...p, current_value: e.target.value }))}
                                            style={{ width: '100%', background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                            <div>
                                <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Adoption %</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={feedbackDraft.adoption_percent}
                                    onChange={(e) => setFeedbackDraft((p) => ({ ...p, adoption_percent: e.target.value }))}
                                    style={{ width: '100%', background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Satisfaction (1-5)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={feedbackDraft.satisfaction}
                                    onChange={(e) => setFeedbackDraft((p) => ({ ...p, satisfaction: e.target.value }))}
                                    style={{ width: '100%', background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                            <div>
                                <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Delivery Difficulty (1-5)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={feedbackDraft.delivery_difficulty}
                                    onChange={(e) => setFeedbackDraft((p) => ({ ...p, delivery_difficulty: e.target.value }))}
                                    style={{ width: '100%', background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Risk Incidents</label>
                                <select
                                    value={feedbackDraft.risk_incidents}
                                    onChange={(e) => setFeedbackDraft((p) => ({ ...p, risk_incidents: e.target.value as RiskIncidents }))}
                                    style={{ width: '100%', background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '7px 9px', fontSize: 10 }}
                                >
                                    <option value="none" style={{ fontSize: 10 }}>None</option>
                                    <option value="minor" style={{ fontSize: 10 }}>Minor</option>
                                    <option value="major" style={{ fontSize: 10 }}>Major</option>
                                </select>
                            </div>
                        </div>

                        <label style={{ display: 'block', color: '#a8b8d8', fontSize: 12, marginBottom: 6 }}>Outcome Comment</label>
                        <textarea
                            value={feedbackDraft.outcome_comment}
                            onChange={(e) => setFeedbackDraft((p) => ({ ...p, outcome_comment: e.target.value }))}
                            maxLength={300}
                            rows={3}
                            style={{ width: '100%', marginBottom: 12, background: '#111827', border: '1px solid rgba(97,152,243,0.2)', color: '#f0f4ff', borderRadius: 8, padding: '8px', resize: 'vertical', fontSize: 10 }}
                        />

                        {feedbackError && (
                            <div style={{ background: 'rgba(233,129,102,0.12)', border: '1px solid rgba(233,129,102,0.25)', color: '#E98166', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                                {feedbackError}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 16, borderTop: '1px solid rgba(97,152,243,0.1)', display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setFeedbackOpen(false)}
                            style={{ flex: 1, background: 'transparent', border: '1px solid rgba(97,152,243,0.2)', color: '#6198F3', padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveFeedback}
                            disabled={feedbackSaving}
                            style={{ flex: 1, background: '#6198F3', border: 'none', color: 'white', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', opacity: feedbackSaving ? 0.7 : 1 }}
                        >
                            {feedbackSaving ? 'Saving...' : 'Save Feedback'}
                        </button>
                    </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    )
}
