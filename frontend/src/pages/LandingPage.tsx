import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div
            className="min-h-screen w-screen flex flex-col items-center justify-center"
            style={{ background: '#080d1a' }}
        >
            <div
                className="flex flex-col items-center text-center"
                style={{ animation: 'fadeIn 0.4s ease-out' }}
            >
                {/* Logo */}
                <img
                    src="/dxclogo.png"
                    alt="DXC Technology"
                    style={{ height: 56, marginBottom: 48 }}
                />

                {/* Eyebrow */}
                <p style={{
                    fontSize: 11,
                    letterSpacing: 3,
                    color: '#6198F3',
                    fontWeight: 600,
                    marginBottom: 20,
                }}>
                    POWERED BY AI · BUILT FOR CONSULTANTS
                </p>

                {/* Title */}
                <h1 style={{
                    fontSize: 64,
                    fontWeight: 800,
                    color: '#f0f4ff',
                    lineHeight: 1.1,
                    marginBottom: 24,
                }}>
                    Turn Client Conversations<br />
                    Into AI Roadmaps.
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: 18,
                    color: '#a8b8d8',
                    lineHeight: 1.7,
                    maxWidth: 560,
                    marginBottom: 48,
                }}>
                    Stop spending 3 weeks on manual research.<br />
                    Identify, score and prioritize the best AI<br />
                    use cases for any client — in under 60 seconds.
                </p>

                {/* Stats */}
                <p style={{
                    fontSize: 13,
                    color: '#5a6a88',
                    letterSpacing: 1,
                    marginBottom: 48,
                }}>
                    1,068 Use Cases &nbsp;|&nbsp; 13 Industries &nbsp;|&nbsp; &lt; 60 Seconds
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => navigate('/onboarding')}
                    style={{
                        background: '#6198F3',
                        color: 'white',
                        padding: '16px 40px',
                        fontSize: 16,
                        fontWeight: 600,
                        borderRadius: 12,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#334970')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#6198F3')}
                >
                    Start Analysis →
                </button>

                {/* Footer text */}
                <p style={{
                    fontSize: 12,
                    color: '#5a6a88',
                    marginTop: 64,
                }}>
                    Trusted by DXC Technology consultants worldwide
                </p>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    )
}
