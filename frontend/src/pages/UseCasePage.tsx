import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import ReactECharts from 'echarts-for-react'
import * as THREE from 'three'
import { getUseCase } from '../api/usecases'
import { useSessionStore } from '../store/sessionStore'
import { getArchetypeColor } from '../utils/constants'
import type { UseCase } from '../types/useCase'

/* ── Background 3D node ── */
function FloatingNode({ color }: { color: string }) {
    const ref = useRef<THREE.Mesh>(null)
    useFrame(({ clock }) => {
        if (!ref.current) return
        ref.current.rotation.y = clock.getElapsedTime() * 0.2
        ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.1
    })
    return (
        <mesh ref={ref}>
            <icosahedronGeometry args={[1.5, 2]} />
            <meshPhongMaterial color={color} transparent opacity={0.15} emissive={color} emissiveIntensity={0.05} />
        </mesh>
    )
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-app-text-muted">{label}</span>
                <span className="font-semibold text-app-text-primary">{typeof value === 'number' ? value.toFixed(1) : value}/10</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a2235' }}>
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / 10) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    )
}

export default function UseCasePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const topTen = useSessionStore((s) => s.topTen)
    const [useCase, setUseCase] = useState<UseCase | null>(null)
    const [loading, setLoading] = useState(true)

    const scored = topTen.find((uc) => (uc.use_case_id || uc.id) === id)
    const nodeColor = getArchetypeColor(scored?.archetype || useCase?.agent_type)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        getUseCase(id)
            .then(setUseCase)
            .catch(() => setUseCase(null))
            .finally(() => setLoading(false))
    }, [id])

    const radarOption = scored ? {
        radar: {
            indicator: [
                { name: 'Trend', max: 10 },
                { name: 'Relevance', max: 10 },
                { name: 'Capability', max: 10 },
                { name: 'Momentum', max: 10 },
                { name: 'Score', max: 10 },
            ],
            shape: 'polygon',
            splitNumber: 5,
            axisName: { color: '#5a6a88', fontSize: 11 },
            splitArea: { areaStyle: { color: ['#0d1425', '#111827'] } },
            splitLine: { lineStyle: { color: 'rgba(97,152,243,0.12)' } },
            axisLine: { lineStyle: { color: 'rgba(97,152,243,0.15)' } },
        },
        series: [{
            type: 'radar',
            data: [{
                value: [
                    scored.score_breakdown?.trend_strength ?? 0,
                    scored.score_breakdown?.client_relevance ?? 0,
                    scored.score_breakdown?.capability_match ?? 0,
                    scored.score_breakdown?.market_momentum ?? 0,
                    scored.radar_score,
                ],
                areaStyle: { color: 'rgba(97,152,243,0.15)' },
                lineStyle: { color: '#6198F3', width: 2 },
                itemStyle: { color: '#FF9259' },
            }],
        }],
    } : null

    if (loading) {
        return (
            <div className="h-screen w-screen bg-app-bg flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-dxc-blue border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!useCase) {
        return (
            <div className="h-screen w-screen bg-app-bg flex items-center justify-center">
                <p className="text-app-text-muted">Use case not found.</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen w-screen bg-app-bg relative overflow-y-auto"
        >
            {/* Background 3D */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    onCreated={({ gl }) => gl.setClearColor('#080d1a')}
                >
                    <ambientLight intensity={0.4} />
                    <FloatingNode color={nodeColor} />
                </Canvas>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto p-8 flex gap-8">
                {/* Left column (40%) */}
                <div className="w-[40%]">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-dxc-blue hover:text-app-text-primary mb-6 inline-block transition"
                    >
                        Control Room
                    </button>

                    {scored && (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-dxc-orange text-white text-sm font-bold px-3 py-1 rounded-full">
                                    #{scored.rank}
                                </span>
                                <span className="text-3xl font-bold text-app-text-primary">
                                    {scored.radar_score.toFixed(2)}
                                </span>
                                <span className="text-app-text-muted text-sm">/10</span>
                            </div>

                            {/* Radar chart */}
                            {radarOption && (
                                <div className="rounded-xl p-4 mb-4" style={{ background: '#111827', border: '1px solid rgba(97,152,243,0.1)' }}>
                                    <ReactECharts option={radarOption} style={{ height: 220 }} />
                                </div>
                            )}

                            {/* Score bars */}
                            <div className="rounded-xl p-4 mb-4" style={{ background: '#111827', border: '1px solid rgba(97,152,243,0.1)' }}>
                                <ScoreBar label="Trend Strength" value={scored.score_breakdown?.trend_strength ?? 0} color="#6198F3" />
                                <ScoreBar label="Client Relevance" value={scored.score_breakdown?.client_relevance ?? 0} color="#FF9259" />
                                <ScoreBar label="Capability Match" value={scored.score_breakdown?.capability_match ?? 0} color="#4ade80" />
                                <ScoreBar label="Market Momentum" value={scored.score_breakdown?.market_momentum ?? 0} color="#6198F3" />
                            </div>
                        </>
                    )}

                    {useCase.company_example && (
                        <p className="text-xs text-app-text-muted mb-2">Company: {useCase.company_example}</p>
                    )}
                    <a href={useCase.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-dxc-blue hover:underline">
                        {useCase.source_name}
                    </a>
                </div>

                {/* Right column (60%) */}
                <div className="w-[60%]">
                    <h1 className="text-2xl font-bold text-app-text-primary mb-2 mt-10">{useCase.title}</h1>
                    <p className="text-sm text-app-text-secondary leading-relaxed mb-6">{useCase.description}</p>

                    {useCase.business_challenge && (
                        <div className="rounded-xl p-5 mb-4" style={{ background: '#111827', border: '1px solid rgba(97,152,243,0.1)' }}>
                            <h3 className="text-sm font-semibold text-app-text-primary mb-2">Business Challenge</h3>
                            <p className="text-sm text-app-text-secondary">{useCase.business_challenge}</p>
                        </div>
                    )}

                    {useCase.ai_solution && (
                        <div className="rounded-xl p-5 mb-4" style={{ background: '#111827', border: '1px solid rgba(97,152,243,0.1)' }}>
                            <h3 className="text-sm font-semibold text-app-text-primary mb-2">AI Solution</h3>
                            <p className="text-sm text-app-text-secondary">{useCase.ai_solution}</p>
                        </div>
                    )}

                    {/* Functions */}
                    {useCase.functions && useCase.functions.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-app-text-primary mb-2">Functions</h3>
                            <ul className="space-y-1">
                                {useCase.functions.map((b, i) => (
                                    <li key={i} className="text-sm text-app-text-secondary flex items-start gap-2">
                                        <span className="text-dxc-orange mt-0.5">-</span> {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Tech keywords as tags */}
                    {useCase.tech_keywords && useCase.tech_keywords.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-app-text-primary mb-2">Data Prerequisites</h3>
                            <div className="flex flex-wrap gap-2">
                                {useCase.tech_keywords.map((kw, i) => (
                                    <span key={i} className="text-app-text-secondary text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(97,152,243,0.08)', border: '1px solid rgba(97,152,243,0.15)' }}>
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Justification */}
                    {scored?.justification && (
                        <div className="border-l-2 border-dxc-blue rounded-r-xl p-5 mb-4" style={{ background: '#111827' }}>
                            <h3 className="text-sm font-semibold text-app-text-primary mb-2">Justification</h3>
                            <p className="text-sm text-app-text-secondary italic leading-relaxed">{scored.justification}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
