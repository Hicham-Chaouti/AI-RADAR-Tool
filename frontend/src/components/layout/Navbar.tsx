import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export default function Navbar() {
  const location = useLocation()
  const { language, setLanguage, t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const isInternal = location.pathname !== '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: t('navbar.platform'), href: '/' },
    { label: t('navbar.methodology'), href: '/how-it-works' },
    { label: t('navbar.startAnalysis'), href: '/onboarding' },
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
            {t('navbar.back')}
          </Link>
        )}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img
            src="/logos/dxclogo.png"
            alt="DXC Technology"
            style={{ height: 32, width: 'auto' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t('navbar.brand')}
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
        <div className="lang-switch">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            aria-label="Switch language to English"
            className={`lang-switch-btn ${language === 'en' ? 'is-active' : ''}`}
          >
            {t('language.english')}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('fr')}
            aria-label="Switch language to French"
            className={`lang-switch-btn ${language === 'fr' ? 'is-active' : ''}`}
          >
            {t('language.french')}
          </button>
        </div>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          {t('navbar.signIn')}
        </span>
        <Link to="/onboarding" className="btn btn-brand" style={{
          padding: '10px 24px', borderRadius: 10,
          fontSize: 14, fontWeight: 600, textDecoration: 'none',
        }}>
          {t('navbar.startAnalysis')} <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  )
}
