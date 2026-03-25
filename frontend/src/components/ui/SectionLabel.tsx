interface SectionLabelProps {
  number: string
  title: string
  className?: string
}

export default function SectionLabel({ number, title, className = '' }: SectionLabelProps) {
  return (
    <div className={`section-label ${className}`} style={{
      color: 'var(--dxc-orange)',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    }}>
      {number} — {title}
    </div>
  )
}
