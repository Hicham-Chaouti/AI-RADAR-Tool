interface MeshGradientBackgroundProps {
  variant?: 'hero' | 'section' | 'full'
  className?: string
}

export default function MeshGradientBackground({ variant = 'hero', className = '' }: MeshGradientBackgroundProps) {
  if (variant === 'hero') {
    return (
      <div className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Large purple blob — top right (NEUORA-style) */}
        <div className="mesh-blob mesh-blob--purple" style={{ width: 700, height: 700, top: -200, right: -200 }} />
        {/* Purple-light blob — bottom left (NEUORA bottom wash) */}
        <div className="mesh-blob mesh-blob--purple-light" style={{ width: 800, height: 500, bottom: -150, left: -100 }} />
        {/* Small blue accent — center right */}
        <div className="mesh-blob mesh-blob--blue" style={{ width: 300, height: 300, top: '35%', right: '10%' }} />
        {/* Bottom gradient wash (like NEUORA's purple-to-transparent) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: 'var(--gradient-hero-wash)',
          pointerEvents: 'none',
        }} />
      </div>
    )
  }

  if (variant === 'section') {
    return (
      <div className={className} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="mesh-blob mesh-blob--purple" style={{ width: 500, height: 500, top: -100, left: '50%' }} />
        <div className="mesh-blob mesh-blob--blue" style={{ width: 300, height: 300, bottom: -80, right: '20%' }} />
        {/* Section bottom wash */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'var(--gradient-section-wash)',
        }} />
      </div>
    )
  }

  // full
  return (
    <div className={className} style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div className="mesh-blob mesh-blob--purple" style={{ width: 900, height: 900, top: -300, right: -300 }} />
      <div className="mesh-blob mesh-blob--purple-light" style={{ width: 600, height: 600, bottom: -200, left: -150 }} />
      <div className="mesh-blob mesh-blob--blue" style={{ width: 400, height: 400, top: '50%', left: '30%' }} />
    </div>
  )
}
