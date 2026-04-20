const SoftBackground = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {/* Blob 1 — Blue DXC top left — VERY VISIBLE */}
    <div style={{
      position: 'absolute',
      top: '-10%',
      left: '-5%',
      width: '800px',
      height: '800px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(97,152,243,0.35) 0%, rgba(97,152,243,0.16) 35%, transparent 65%)',
      filter: 'blur(40px)',
      animation: 'blobDrift1 25s ease-in-out infinite alternate',
    }} />

    {/* Blob 2 — Orange DXC bottom right */}
    <div style={{
      position: 'absolute',
      bottom: '-5%',
      right: '-5%',
      width: '700px',
      height: '700px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,146,89,0.28) 0%, rgba(255,146,89,0.10) 35%, transparent 65%)',
      filter: 'blur(40px)',
      animation: 'blobDrift2 30s ease-in-out infinite alternate',
    }} />

    {/* Blob 3 — Light blue center right */}
    <div style={{
      position: 'absolute',
      top: '40%',
      right: '10%',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(97,152,243,0.20) 0%, transparent 55%)',
      filter: 'blur(40px)',
      animation: 'blobDrift3 35s ease-in-out infinite alternate',
    }} />

    {/* Blob 4 — Coral bottom left */}
    <div style={{
      position: 'absolute',
      bottom: '15%',
      left: '5%',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(233,129,102,0.20) 0%, transparent 55%)',
      filter: 'blur(40px)',
      animation: 'blobDrift1 28s ease-in-out infinite alternate-reverse',
    }} />

    {/* Subtle dot grid pattern — NEUORA style */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }} />
  </div>
)

export default SoftBackground
