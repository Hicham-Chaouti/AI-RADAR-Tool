import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const isInternal = location.pathname !== '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Platform', href: '/' },
    { label: 'Methodology', href: '/how-it-works' },
    { label: 'Start Analysis', href: '/onboarding' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '0 40px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--bg-white)',
      boxShadow: scrolled ? 'var(--shadow-xs)' : 'none',
      borderBottom: '1px solid var(--border-light)',
      transition: 'box-shadow 0.3s ease',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {isInternal && (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            Back
          </Link>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img
            src="/logos/dxclogo.png"
            alt="DXC Technology"
            style={{ height: 32, width: 'auto' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AI Radar
          </span>
        </Link>
      </div>

      {/* Center links */}
      {!isInternal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {navLinks.map(l => {
            const isActive = location.pathname === l.href
            return (
              <Link key={l.label} to={l.href} style={{
                fontSize: 15, fontWeight: isActive ? 600 : 500, textDecoration: 'none',
                color: isActive ? 'var(--dxc-blue)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--dxc-blue)' : '2px solid transparent',
                paddingBottom: 4,
                transition: 'all 0.2s',
              }}>
                {l.label}
              </Link>
            )
          })}
        </div>
      )}

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          Sign In
        </span>
        <Link to="/onboarding" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--dxc-blue-vibrant)', color: 'white',
          padding: '10px 24px', borderRadius: 10,
          fontSize: 14, fontWeight: 600, textDecoration: 'none',
          boxShadow: 'var(--shadow-blue)',
          transition: 'all 0.25s',
        }}>
          Start Analysis <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  )
}
