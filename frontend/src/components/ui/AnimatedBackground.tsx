import { useMemo } from 'react'

/* ── Deterministic pseudo-random particles ── */
function generateParticles(count: number) {
  const particles = []
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508 // golden angle
    particles.push({
      left: `${(seed * 7.3) % 100}%`,
      top: `${(seed * 3.7) % 100}%`,
      size: 2 + (i % 3),
      opacity: 0.08 + (i % 5) * 0.04,
      duration: 8 + (i % 8),
      delay: (i % 6) * -2,
      color: i % 4 === 0 ? 'var(--dxc-blue-light)' : '#ffffff',
    })
  }
  return particles
}

export default function AnimatedBackground() {
  const particles = useMemo(() => generateParticles(18), [])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* ── Layer 1: Gradient mesh blobs ── */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          top: '-5%',
          left: '-8%',
          borderRadius: '50%',
          background: 'var(--dxc-blue)',
          opacity: 0.08,
          filter: 'blur(150px)',
          animation: 'blobDrift1 25s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          bottom: '-8%',
          right: '-5%',
          borderRadius: '50%',
          background: 'var(--dxc-orange)',
          opacity: 0.06,
          filter: 'blur(140px)',
          animation: 'blobDrift2 30s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 350,
          height: 350,
          top: '35%',
          right: '10%',
          borderRadius: '50%',
          background: 'var(--accent-purple)',
          opacity: 0.05,
          filter: 'blur(130px)',
          animation: 'blobDrift3 35s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          top: '10%',
          right: '25%',
          borderRadius: '50%',
          background: 'var(--accent-cyan)',
          opacity: 0.04,
          filter: 'blur(120px)',
          animation: 'blobDrift4 20s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* ── Layer 2: Circuit board grid pattern ── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <pattern
            id="circuit-grid"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Grid lines */}
            <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(97,152,243,0.04)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="60" stroke="rgba(97,152,243,0.04)" strokeWidth="0.5" />
            {/* Intersection dots */}
            <circle cx="0" cy="0" r="1" fill="rgba(97,152,243,0.06)" />
            <circle cx="60" cy="0" r="1" fill="rgba(97,152,243,0.06)" />
            <circle cx="0" cy="60" r="1" fill="rgba(97,152,243,0.06)" />
            <circle cx="60" cy="60" r="1" fill="rgba(97,152,243,0.06)" />
            {/* Occasional bigger dots at center */}
            <circle cx="30" cy="30" r="1.5" fill="rgba(97,152,243,0.04)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
      </svg>

      {/* ── Layer 3: Floating particles ── */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            opacity: p.opacity,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: 'transform',
          }}
        />
      ))}

      {/* ── Layer 4: Vignette overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(3,7,18,0.6) 100%)',
        }}
      />
    </div>
  )
}
