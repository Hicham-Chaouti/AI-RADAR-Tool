import { useState } from 'react'

const sources = [
  {
    name: 'Google Cloud',
    label: 'Google Cloud AI Use Cases',
    logo: '/logos/google-cloud.png',
    count: '933 use cases',
    active: true,
    badge: null,
    isBlueprint: false,
  },
  {
    name: 'IBM watsonx',
    label: 'IBM Watson AI Use Cases',
    logo: '/logos/ibm-watsonx.png?v=2',
    count: '47 use cases',
    active: true,
    badge: null,
    isBlueprint: false,
  },
  {
    name: 'Salesforce AI',
    label: 'Salesforce Einstein AI Use Cases',
    logo: '/logos/salesforce.png',
    count: '57 use cases',
    active: true,
    badge: null,
    isBlueprint: false,
  },
  {
    name: 'Google Cloud',
    label: 'Google Cloud AI Blueprints',
    logo: '/logos/google-cloud.png',
    count: '31 use cases',
    active: true,
    badge: null,
    isBlueprint: true,
  },
  {
    name: 'McKinsey',
    label: 'McKinsey AI Benchmark',
    logo: '/logos/mckinsey.png',
    count: 'Calibration Only',
    active: true,
    badge: 'Calibration Only',
    isBlueprint: false,
  },
  {
    name: 'NVIDIA',
    label: 'NVIDIA AI Use Cases',
    logo: '/logos/nvidia.png',
    count: 'Coming V2',
    active: false,
    badge: 'Coming V2',
    isBlueprint: false,
  },
  {
    name: 'MIT',
    label: 'MIT AI Use Cases',
    logo: '/logos/mit.png',
    count: 'Coming V2',
    active: false,
    badge: 'Coming V2',
    isBlueprint: false,
  },
]

function SourceItem({ s }: { s: typeof sources[0] }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 180,
      flexShrink: 0,
      padding: '0 16px',
      opacity: s.active ? 1 : 0.45,
      cursor: 'default',
    }}>
      {/* Logo zone — fixed height so all items align */}
      <div style={{
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
        {!imgError ? (
          <img
            src={s.logo}
            alt={s.name}
            style={{
              maxHeight: 64,
              maxWidth: 150,
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              filter: 'none',
              opacity: 1,
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: s.badge === 'Calibration Only'
                ? 'var(--dxc-orange)'
                : s.active ? 'var(--dxc-blue)' : 'var(--text-dim)',
              flexShrink: 0,
            }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              {s.name}
            </span>
          </div>
        )}
      </div>

      {/* Blueprints badge row */}
      {s.isBlueprint && (
        <span style={{
          fontSize: 10, fontWeight: 600,
          padding: '2px 8px', borderRadius: 100,
          background: 'var(--dxc-blue-light)',
          color: 'var(--dxc-blue)',
          marginTop: 4,
          marginBottom: 2,
        }}>
          Blueprints
        </span>
      )}

      {/* Descriptive library name */}
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginTop: s.isBlueprint ? 2 : 6,
        lineHeight: 1.3,
      }}>
        {s.label}
      </span>

      {/* Use case count / status */}
      <span style={{
        fontSize: 11,
        color: 'var(--text-dim)',
        marginTop: 3,
        textAlign: 'center',
      }}>
        {s.count}
      </span>

      {/* Badge (Calibration Only / Coming V2) */}
      {s.badge && (
        <span style={{
          fontSize: 10, fontWeight: 600,
          padding: '2px 8px', borderRadius: 100,
          background: s.badge === 'Coming V2' ? 'var(--bg-muted)' : 'var(--dxc-orange-light)',
          color: s.badge === 'Coming V2' ? 'var(--text-dim)' : 'var(--dxc-orange)',
          marginTop: 4,
        }}>
          {s.badge}
        </span>
      )}
    </div>
  )
}

export default function SourcesBar() {
  return (
    <section style={{ padding: '48px 0', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marqueeScroll 35s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Title */}
      <p style={{
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        marginBottom: 28,
      }}>
        Knowledge Base sourced from
      </p>

      {/* Fade edges */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to right, var(--bg-page, #f8f9fc), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to left, var(--bg-page, #f8f9fc), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Scrolling track — items duplicated for seamless loop */}
        <div
          className="marquee-track"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            width: 'max-content',
          }}
        >
          {/* First set */}
          {sources.map((s, i) => (
            <SourceItem key={`a-${i}`} s={s} />
          ))}
          {/* Duplicate set for seamless loop */}
          {sources.map((s, i) => (
            <SourceItem key={`b-${i}`} s={s} />
          ))}
        </div>
      </div>
    </section>
  )
}
