import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { INDUSTRIES, CAPABILITIES } from '../utils/constants'
import { useSessionStore } from '../store/sessionStore'
import { createSession } from '../api/sessions'
import { scoreSession } from '../api/scoring'

export default function OnboardingPage() {
    const navigate = useNavigate()
    const { setSession, setTopTen, setLoading, setError, isLoading, loadingMessage, error } = useSessionStore()

    const [sector, setSector] = useState('')
    const [clientName, setClientName] = useState('')
    const [relationship, setRelationship] = useState<'new' | 'existing'>('existing')
    const [proximity, setProximity] = useState<'low' | 'medium' | 'high'>('medium')
    const [capabilities, setCapabilities] = useState<string[]>([])
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!isLoading) { setProgress(0); return }
        const interval = setInterval(() => {
            setProgress((p) => Math.min(p + 0.4, 90))
        }, 100)
        return () => clearInterval(interval)
    }, [isLoading])

    const handleCapabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, (o) => o.value)
        setCapabilities(selected)
    }

    const handleSubmit = async () => {
        if (!sector || !clientName) return
        setLoading(true, 'Creating session...')
        setError(null)
        try {
            const payload = {
                sector,
                client_name: clientName,
                relationship_level: relationship,
                business_proximity: proximity,
                capabilities,
                data_maturity: 'intermediate',
                strategic_objectives: [],
            }
            console.log('Session payload:', payload)
            const session = await createSession(payload)
            setSession(session)
            setLoading(true, 'Analyzing use cases...')
            const result = await scoreSession(session.id)
            setTopTen(result.top_10 as any)
            setProgress(100)
            setLoading(false)
            navigate('/radar')
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'An error occurred')
        }
    }

    const canSubmit = sector && clientName && !isLoading

    const inputStyle: React.CSSProperties = {
        background: '#111827',
        border: '1px solid rgba(97,152,243,0.2)',
        color: '#f0f4ff',
        borderRadius: 8,
        padding: '12px 16px',
        width: '100%',
        fontSize: 14,
        outline: 'none',
    }

    const labelStyle: React.CSSProperties = {
        fontSize: 11,
        letterSpacing: 2,
        color: '#6198F3',
        fontWeight: 600,
        marginBottom: 8,
        display: 'block',
    }

    return (
        <div style={{ background: '#080d1a', minHeight: '100vh' }}>
            {/* Topbar */}
            <div style={{
                background: '#0d1425',
                borderBottom: '1px solid rgba(97,152,243,0.1)',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
            }}>
                <img src="/dxclogo.png" alt="DXC" style={{ height: 28 }} />
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#6198F3',
                        fontSize: 14,
                        cursor: 'pointer',
                    }}
                >
                    ← Back
                </button>
            </div>

            {/* Form */}
            <div style={{
                maxWidth: 600,
                margin: '0 auto',
                padding: '40px 20px',
            }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0f4ff', marginBottom: 4 }}>
                    Mission Briefing
                </h1>
                <p style={{ fontSize: 14, color: '#5a6a88', marginBottom: 32 }}>
                    Configure your AI analysis parameters
                </p>

                {/* 1. Industry Sector */}
                <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>INDUSTRY SECTOR *</label>
                    <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        style={{
                            ...inputStyle,
                            appearance: 'auto',
                        }}
                    >
                        <option value="">-- Select an industry --</option>
                        {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>

                {/* 2. Client Name */}
                <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>CLIENT NAME *</label>
                    <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Banque Nationale du Maroc"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#6198F3')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(97,152,243,0.2)')}
                    />
                </div>

                {/* 3. Relationship Level */}
                <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>RELATIONSHIP LEVEL</label>
                    <div style={{
                        background: '#111827',
                        borderRadius: 8,
                        padding: 4,
                        display: 'flex',
                    }}>
                        {(['new', 'existing'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRelationship(r)}
                                style={{
                                    flex: 1,
                                    padding: '10px 24px',
                                    borderRadius: 6,
                                    border: 'none',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    background: relationship === r ? '#6198F3' : 'transparent',
                                    color: relationship === r ? 'white' : '#5a6a88',
                                }}
                            >
                                {r === 'new' ? 'Nouveau' : 'Existant'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Business Proximity */}
                <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>BUSINESS PROXIMITY</label>
                    <div style={{
                        background: '#111827',
                        borderRadius: 8,
                        padding: 4,
                        display: 'flex',
                    }}>
                        {(['low', 'medium', 'high'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setProximity(p)}
                                style={{
                                    flex: 1,
                                    padding: '10px 24px',
                                    borderRadius: 6,
                                    border: 'none',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    background: proximity === p ? '#6198F3' : 'transparent',
                                    color: proximity === p ? 'white' : '#5a6a88',
                                }}
                            >
                                {p === 'low' ? 'Faible' : p === 'medium' ? 'Moyen' : 'Fort'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. AI Capabilities */}
                <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>INTERNAL AI CAPABILITIES</label>
                    <select
                        multiple
                        size={7}
                        value={capabilities}
                        onChange={handleCapabilityChange}
                        style={{
                            ...inputStyle,
                            height: 180,
                            padding: 8,
                        }}
                    >
                        {CAPABILITIES.map((cap) => (
                            <option key={cap.value} value={cap.value}>{cap.label}</option>
                        ))}
                    </select>
                    <p style={{ fontSize: 11, color: '#5a6a88', marginTop: 6 }}>
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(233,129,102,0.1)',
                        border: '1px solid rgba(233,129,102,0.3)',
                        color: '#E98166',
                        fontSize: 14,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                    }}>
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    style={{
                        width: '100%',
                        padding: 14,
                        fontSize: 15,
                        fontWeight: 600,
                        borderRadius: 10,
                        border: 'none',
                        marginTop: 32,
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s',
                        background: !sector || !clientName
                            ? '#1a2235'
                            : isLoading
                            ? '#334970'
                            : '#6198F3',
                        color: !sector || !clientName ? '#5a6a88' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                >
                    {isLoading && (
                        <span style={{
                            width: 16,
                            height: 16,
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 0.6s linear infinite',
                        }} />
                    )}
                    {isLoading ? loadingMessage : 'Launch Analysis →'}
                </button>

                {/* Progress bar */}
                {isLoading && (
                    <div style={{
                        marginTop: 12,
                        height: 4,
                        background: '#1a2235',
                        borderRadius: 4,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: '#6198F3',
                            borderRadius: 4,
                            transition: 'width 0.3s ease-out',
                        }} />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                select option {
                    background: #111827;
                    color: #f0f4ff;
                    padding: 6px 8px;
                }
                select:focus, input:focus {
                    border-color: #6198F3 !important;
                }
            `}</style>
        </div>
    )
}
