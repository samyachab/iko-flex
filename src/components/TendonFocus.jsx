import { motion } from 'framer-motion'
import { TONES, gradient } from '../lib/theme.js'

// Juste avant le Renfo, si une zone de tendon est cochée : focus tendon (courte séance dédiée) ou séance prévue
export default function TendonFocus({ programs, minutes, onFocus, onPlanned, onClose }) {
  const t = TONES.renfo
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 px-4 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="safe-bottom w-full max-w-md rounded-[2rem] border border-white/10 bg-[#1a1a1a] p-6 [--sb:0.5rem]"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em]" style={{ color: t.a }}>
          Zone sensible
        </p>
        <h2 className="font-display mt-2 text-3xl font-light leading-tight">Un focus tendon aujourd’hui ?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Tu as indiqué {programs.map((p) => `ton ${p.program.tendon}`).join(' et ')}. Une courte séance dédiée, phase «{' '}
          {programs[0].phase.label} » : {programs[0].phase.goal.charAt(0).toLowerCase() + programs[0].phase.goal.slice(1)}
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onFocus}
            className="w-full rounded-full py-4 text-base font-bold text-ink"
            style={{ background: gradient(t, 90) }}
          >
            Oui, focus tendon · {minutes} min
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onPlanned}
            className="w-full rounded-full border border-white/15 py-4 text-base font-semibold text-white/80"
          >
            Non, ma séance prévue
          </motion.button>
        </div>
        <p className="mt-4 text-center text-xs text-white/35">Entraînement, pas un soin : si ça fait vraiment mal, vois un pro de santé.</p>
      </motion.div>
    </motion.div>
  )
}
