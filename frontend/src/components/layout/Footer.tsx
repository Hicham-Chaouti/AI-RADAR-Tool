import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      padding: '48px 40px 32px',
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-white)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            AI Radar
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>by DXC Technology</span>
        </div>

        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { label: 'Platform', href: '/' },
            { label: 'Methodology', href: '/how-it-works' },
            { label: 'Start Analysis', href: '/onboarding' },
          ].map(l => (
            <Link key={l.label} to={l.href} style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
              {l.label}
            </Link>
          ))}
        </div>

        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          &copy; {new Date().getFullYear()} DXC Technology · Internal Tool
        </span>
      </div>
    </footer>
  )
}
