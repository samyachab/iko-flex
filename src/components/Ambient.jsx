import { motion } from 'framer-motion'
import { TONES } from '../lib/theme.js'

// Fond vivant : trois halos qui dérivent lentement.
// Perf : dégradés radiaux (pas de filter: blur) et seules transform/opacity sont animées,
// donc tout reste sur le compositeur GPU, sans repaint.
const DRIFT = [
  { size: 90, x: ['-22vmax', '-8vmax', '-22vmax'], y: ['-38vmax', '-26vmax', '-38vmax'], dur: 24, slot: 'a' },
  { size: 80, x: ['22vmax', '8vmax', '22vmax'], y: ['10vmax', '-4vmax', '10vmax'], dur: 30, slot: 'b' },
  { size: 70, x: ['-18vmax', '4vmax', '-18vmax'], y: ['42vmax', '30vmax', '42vmax'], dur: 34, slot: 'c' },
]
const KEYS = Object.keys(TONES)

export default function Ambient({ tone = 'rest', intensity = 0.3 }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 h-lvh min-h-full -z-10 overflow-hidden bg-ink">
      <motion.div className="absolute inset-0" animate={{ opacity: intensity }} transition={{ duration: 1.6 }}>
        {DRIFT.map((d) => (
          <motion.div
            key={d.slot}
            className="absolute left-1/2 top-1/2"
            style={{
              width: `${d.size}vmax`,
              height: `${d.size}vmax`,
              marginLeft: `-${d.size / 2}vmax`,
              marginTop: `-${d.size / 2}vmax`,
              willChange: 'transform',
            }}
            animate={{ x: d.x, y: d.y }}
            transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut' }}
          >
            {KEYS.map((k) => (
              <motion.div
                key={k}
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at center, ${TONES[k][d.slot]} 0%, transparent 60%)` }}
                initial={false}
                animate={{ opacity: k === tone ? 1 : 0 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        ))}
      </motion.div>
      <div className="grain absolute inset-0" />
    </div>
  )
}
