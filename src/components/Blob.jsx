import { motion } from 'framer-motion'
import { TONES, gradient, SHAPES } from '../lib/theme.js'

// Forme organique qui se déforme en continu. `speed` < 1 = plus vif.
// Perf : le halo est un élément séparé (dégradé radial statique) au lieu d'un box-shadow
// animé, sinon chaque frame de morphing redessine l'ombre.
export default function Blob({ tone = 'souplesse', size = 120, speed = 1, className = '', children }) {
  const t = TONES[tone]
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <div
        className="pointer-events-none absolute -inset-1/3"
        style={{ background: `radial-gradient(circle, ${t.glow} 0%, transparent 65%)` }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: gradient(t), willChange: 'transform' }}
        animate={{ borderRadius: SHAPES, rotate: 360 }}
        transition={{
          borderRadius: { duration: 9 * speed, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 40 * speed, repeat: Infinity, ease: 'linear' },
        }}
      />
      {children && <div className="relative">{children}</div>}
    </div>
  )
}
