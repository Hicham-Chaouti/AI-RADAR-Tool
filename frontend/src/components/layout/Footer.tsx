import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer style={{
      padding: '48px 40px 32px',
      borderTop: '1px solid var(--border-light)',
      background: 'var(--bg-white)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            {t('navbar.brand')}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{t('footer.byDxc')}</span>
        </div>

        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { label: t('navbar.platform'), href: '/' },
            { label: t('navbar.methodology'), href: '/how-it-works' },
            { label: t('navbar.startAnalysis'), href: '/onboarding' },
          ].map(l => (
            <Link key={l.label} to={l.href} style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
              {l.label}
            </Link>
          ))}
        </div>

        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </span>
      </div>
    </footer>
  )
}
