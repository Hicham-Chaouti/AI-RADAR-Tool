import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  glow?: boolean
  glowColor?: 'blue' | 'orange'
  onClick?: () => void
  as?: 'div' | 'button'
}

export default function GlassCard({
  children, className = '', hoverable = true,
  glow = false, glowColor = 'blue', onClick, as = 'div'
}: GlassCardProps) {
  const glowStyle = glow
    ? (glowColor === 'orange' ? 'card-orange' : 'card-glow')
    : ''
  const Tag = as === 'button' ? motion.button : motion.div

  return (
    <Tag
      className={`card ${glowStyle} ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.03)' } : undefined}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ padding: 24 }}
    >
      {children}
    </Tag>
  )
}
