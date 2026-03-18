import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSessionStore } from '../../store/sessionStore'
import { useRadarStore } from '../../store/radarStore'
import { exportPdf } from '../../api/export'

export default function Topbar() {
    const navigate = useNavigate()
    const session = useSessionStore((s) => s.session)
    const { cameraMode, setCameraMode } = useRadarStore()

    const modes = [
        { key: 'control' as const, label: 'Control Room' },
        { key: 'top' as const, label: 'Top View' },
        { key: 'orbit' as const, label: 'Free Orbit' },
    ]

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

    return (
        <div
            className="h-12 flex items-center justify-between px-4 shrink-0 z-50"
            style={{ background: '#0d1425', borderBottom: '1px solid rgba(97,152,243,0.1)' }}
        >
            {/* Left: logo + title */}
            <div className="flex items-center gap-3">
                <img
                    src="/dxclogo.png"
                    alt="DXC"
                    className="h-7 cursor-pointer"
                    onClick={() => navigate('/')}
                />
                <span className="text-app-text-primary text-sm font-semibold tracking-wide">
                    AI Opportunity Radar
                </span>
            </div>

            {/* Center: camera mode pills */}
            <div className="flex items-center gap-1 rounded-full p-0.5" style={{ background: 'rgba(97,152,243,0.08)' }}>
                {modes.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setCameraMode(m.key)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            cameraMode === m.key
                                ? 'bg-dxc-blue text-white'
                                : 'text-app-text-muted hover:text-app-text-primary'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Right: sector badge + export */}
            <div className="flex items-center gap-3">
                {session && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(255,146,89,0.12)', color: '#FF9259' }}>
                        {session.sector.replace('_', ' ')}
                    </span>
                )}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExport}
                    className="bg-dxc-orange text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:brightness-110 transition"
                >
                    Export PDF
                </motion.button>
            </div>
        </div>
    )
}
