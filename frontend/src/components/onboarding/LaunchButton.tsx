import { ArrowRight, Loader2 } from 'lucide-react'

interface Props {
  canLaunch: boolean
  isLoading: boolean
  loadingMessage: string
  sector: string
  onLaunch: () => void
}

export default function LaunchButton({ canLaunch, isLoading, loadingMessage, sector, onLaunch }: Props) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, left: 0, right: 0, zIndex: 50,
      padding: '16px 0', background: 'linear-gradient(180deg, transparent, var(--bg-page) 30%)',
    }}>
      <button
        onClick={onLaunch}
        disabled={!canLaunch || isLoading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '18px 32px', border: 'none', cursor: canLaunch && !isLoading ? 'pointer' : 'not-allowed',
          borderRadius: 14, fontSize: 16, fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: 'var(--text-white)',
          background: canLaunch
            ? 'linear-gradient(135deg, var(--dxc-blue-vibrant), var(--dxc-orange-vibrant))'
            : 'var(--bg-muted)',
          boxShadow: canLaunch ? 'var(--shadow-lg)' : 'none',
          opacity: canLaunch ? 1 : 0.5,
          transition: 'all 0.3s',
          transform: 'scale(1)',
        }}
        onMouseEnter={e => { if (canLaunch) (e.target as HTMLElement).style.transform = 'scale(1.01)' }}
        onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {loadingMessage || `Analyzing use cases across ${sector}...`}
          </>
        ) : (
          <>
            Launch Analysis <ArrowRight size={18} />
          </>
        )}
      </button>

      {isLoading && (
        <div style={{
          width: '100%', height: 3, borderRadius: 2, overflow: 'hidden',
          background: 'var(--bg-muted)', marginTop: 8,
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, var(--dxc-blue), var(--dxc-orange))',
            backgroundSize: '200% 100%',
            animation: 'gradientMove 1.5s ease-in-out infinite',
            width: '60%',
          }} />
        </div>
      )}
    </div>
  )
}
