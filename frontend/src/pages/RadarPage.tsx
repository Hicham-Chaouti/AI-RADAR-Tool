import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { useSessionStore } from '../store/sessionStore'
import { exportPdf } from '../api/export'
import { searchUseCases } from '../api/search'
import { getArchetypeColor } from '../utils/constants'
import type { UseCaseScored } from '../types/useCase'

/* ── Axis descriptions ── */
const AXIS_DESCRIPTIONS: Record<string, string> = {
    'ROI Potential': 'Expected return on investment based on sector benchmarks and implementation cost.',
    'Tech Complexity': 'Level of technical infrastructure required to implement this use case.',
    'Market Maturity': 'Adoption rate of this use case across the industry in 2024-2025.',
    'Quick Win': 'Estimated time-to-value. High score = deployable in < 3 months.',
    'Regulatory Risk': 'Compliance exposure under GDPR, AI Act and sector-specific regulations.',
}

const AXIS_NAMES = ['ROI Potential', 'Tech Complexity', 'Market Maturity', 'Quick Win', 'Regulatory Risk']

function getRadarValues(uc: UseCaseScored): number[] {
    if (uc.radar_axes) {
        return [
            uc.radar_axes.roi_potential,
            uc.radar_axes.technical_complexity,
            uc.radar_axes.market_maturity,
            uc.radar_axes.quick_win_potential,
            uc.radar_axes.regulatory_risk,
        ]
    }
    const sb = uc.score_breakdown
    return [
        Math.min((sb?.trend_strength ?? 5) * 1.1, 10),
        10 - (sb?.capability_match ?? 5),
        sb?.market_momentum ?? 5,
        uc.quick_win ? 9 : 4,
        10 - (sb?.client_relevance ?? 5),
    ]
}

function scoreColor(score: number): string {
    if (score >= 8) return '#4ade80'
    if (score >= 7) return '#FF9259'
    return '#a8b8d8'
}

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
    quick_win: boolean
    source_url: string | null
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

    useEffect(() => {
        if (!session || topTen.length === 0) {
            navigate('/onboarding')
        }
    }, [session, topTen, navigate])

    // Fetch all results when page loads
    useEffect(() => {
        if (!session) return
        setAllLoading(true)
        searchUseCases({ q: 'ai', sector: session.sector, limit: 50 })
            .then((res) => setAllResults(res.results))
            .catch(() => setAllResults([]))
            .finally(() => setAllLoading(false))
    }, [session])

    // Convert search items to display format
    const allResultsDisplay = useMemo(() => {
        return allResults
            .map((r) => ({
                use_case_id: r.use_case_id,
                title: r.title,
                radar_score: r.weighted_score <= 1 ? r.weighted_score * 10 : r.weighted_score,
                archetype: r.archetype,
                quick_win: r.quick_win,
                company_example: null as string | null,
                source_name: null as string | null,
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

    const handleSelectItem = (item: any) => {
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
                score_breakdown: {
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
                { name: 'ROI Potential', max: 10 },
                { name: 'Tech Complexity', max: 10 },
                { name: 'Market Maturity', max: 10 },
                { name: 'Quick Win', max: 10 },
                { name: 'Regulatory Risk', max: 10 },
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
        <div style={{ background: '#080d1a', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* ── TOPBAR ── */}
            <div style={{
                background: '#0d1425',
                borderBottom: '1px solid rgba(97,152,243,0.1)',
                height: 52,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <img src="/dxclogo.png" alt="DXC" style={{ height: 24 }} />
                <span style={{ fontSize: 13, color: '#a8b8d8' }}>
                    {session.client_name} &middot; {session.sector}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => navigate('/onboarding')}
                        style={{ background: 'none', border: 'none', color: '#6198F3', fontSize: 13, cursor: 'pointer' }}
                    >
                        ← New Analysis
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            background: '#FF9259',
                            color: 'white',
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 600,
                            padding: '8px 16px',
                            borderRadius: 8,
                            cursor: 'pointer',
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
                        background: '#0d1425',
                        borderBottom: '1px solid rgba(97,152,243,0.1)',
                        padding: '16px 24px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 18, fontWeight: 700, color: '#f0f4ff' }}>Use Cases</span>
                            <span style={{
                                background: 'rgba(97,152,243,0.1)',
                                color: '#6198F3',
                                fontSize: 12,
                                borderRadius: 20,
                                padding: '4px 12px',
                            }}>
                                {filter === 'top10'
                                    ? `${topTen.length} analysed`
                                    : `${allResults.length} use cases`}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                            {/* Toggle */}
                            <div style={{ background: '#111827', borderRadius: 8, padding: 4, display: 'flex' }}>
                                {(['top10', 'all'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 6,
                                            border: 'none',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            background: filter === f ? '#6198F3' : 'transparent',
                                            color: filter === f ? 'white' : '#5a6a88',
                                            transition: 'all 0.15s',
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
                                    padding: '8px 14px',
                                    width: 220,
                                    fontSize: 13,
                                    outline: 'none',
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
                                return (
                                    <div
                                        key={uc.use_case_id || i}
                                        onClick={() => handleSelectItem(uc)}
                                        style={{
                                            background: isSelected ? '#111827' : '#0d1425',
                                            borderBottom: '1px solid rgba(97,152,243,0.06)',
                                            borderLeft: isSelected ? '3px solid #6198F3' : '3px solid transparent',
                                            padding: isSelected ? '16px 24px 16px 21px' : '16px 24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#111827' }}
                                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#0d1425' }}
                                    >
                                        {/* Rank */}
                                        <span style={{ fontSize: 11, color: '#5a6a88', fontWeight: 600, width: 32, flexShrink: 0 }}>
                                            #{String(uc.rank).padStart(2, '0')}
                                        </span>

                                        {/* Content */}
                                        <div style={{ flex: 1, marginLeft: 12 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f4ff', lineHeight: 1.3, marginBottom: 4 }}>
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
                                                    <span style={{ fontSize: 11, color: '#5a6a88' }}>{uc.company_example}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                                            <div>
                                                <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor(uc.radar_score) }}>
                                                    {uc.radar_score.toFixed(2)}
                                                </span>
                                                <span style={{ fontSize: 12, color: '#5a6a88' }}>/10</span>
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
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN: RADAR + DETAIL ── */}
                <div style={{
                    width: 480,
                    flexShrink: 0,
                    background: '#0d1425',
                    borderLeft: '1px solid rgba(97,152,243,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
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
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4ff', lineHeight: 1.3, marginTop: 4 }}>
                                    {selected.title}
                                </div>
                                <div style={{ fontSize: 12, color: '#5a6a88', marginTop: 4 }}>
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
                                            click: (params: any) => {
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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    )
}
