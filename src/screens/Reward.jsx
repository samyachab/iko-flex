import { Fragment, useEffect, useMemo, useState } from 'react'
import { animate, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Blob from '../components/Blob.jsx'
import { buildDebrief } from '../lib/debrief.js'
import { beep, speak } from '../lib/audio.js'
import { PHRASES } from '../lib/phrases.js'
import { TONES, gradient, rise } from '../lib/theme.js'

export default function Reward({ routine, result, minRatio, onDone }) {
  const { valid, ratio, streak } = result
  const debrief = useMemo(() => buildDebrief(routine.exercises), [routine])
  const t = TONES[valid ? routine.key : 'rest']
  const minutes = Math.round((routine.exercises.length * (routine.work + routine.rest)) / 60)
  const [shown, setShown] = useState(valid ? Math.max(0, streak - 1) : streak)

  useEffect(() => {
    if (!valid) {
      speak(PHRASES.short)
      return
    }
    beep.victory()
    speak(PHRASES.done)
    const colors = [t.a, t.b, t.c, '#F3EFE8']
    const burst = (opts) => confetti({ colors, shapes: ['circle'], scalar: 1.1, ticks: 260, disableForReducedMotion: true, ...opts })
    burst({ particleCount: 120, spread: 100, startVelocity: 38, origin: { y: 0.32 } })
    const t1 = setTimeout(() => {
      burst({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } })
      burst({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } })
    }, 450)
    const counter = animate(Math.max(0, streak - 1), streak, {
      delay: 0.9,
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => {
      clearTimeout(t1)
      counter.stop()
    }
  }, [routine, streak, t, valid])

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-10">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.1 }}
        >
          <Blob tone={valid ? routine.key : 'rest'} size={150} speed={0.7}>
            <motion.span
              key={shown}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="font-display block text-6xl font-light tabular-nums text-ink"
            >
              {shown}
            </motion.span>
          </Blob>
        </motion.div>
        <motion.p {...rise(0.5)} className="mt-4 text-xs font-bold uppercase tracking-[0.3em]" style={{ color: t.a }}>
          {streak > 1 ? 'jours' : 'jour'} de {routine.key === 'souplesse' ? 'souplesse' : 'renfo'} d’affilée
        </motion.p>

        <motion.h1 {...rise(0.65)} className="font-display mt-6 text-5xl font-light tracking-tight">
          {valid ? 'Fait.' : 'Presque.'}
        </motion.h1>
        <motion.p {...rise(0.75)} className="font-display mt-2 text-lg italic text-white/55">
          {valid ? 'Le plus dur, c’était de commencer.' : 'Tu as bougé, c’est déjà ça.'}
        </motion.p>
        {!valid && (
          <motion.p {...rise(0.8)} className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            {Math.round(ratio * 100)} % du temps d’effort fait. Il en faut {Math.round(minRatio * 100)} % pour valider la
            journée et faire grandir la série.
          </motion.p>
        )}
        <motion.p {...rise(0.85)} className="mt-2 text-xs text-white/35">
          {minutes} min · {routine.exercises.length} mouvements
        </motion.p>
      </div>

      <motion.section
        {...rise(1.05)}
        className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6"
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">Le debrief 800m</p>
        <p className="font-display mt-3 text-[1.35rem] leading-snug">
          Tu as travaillé{' '}
          {debrief.zoneList.map((z, k) => (
            <Fragment key={z}>
              <span className="text-gradient italic" style={{ backgroundImage: gradient(t, 90) }}>
                {z}
              </span>
              {k < debrief.zoneList.length - 2 ? ', ' : k === debrief.zoneList.length - 2 ? ' et ' : '.'}
            </Fragment>
          ))}
        </p>

        <p className="mt-6 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">Sur la piste</p>
        <ul className="mt-3 space-y-3">
          {debrief.transfers.map((line, k) => (
            <motion.li key={k} {...rise(1.3 + k * 0.18)} className="flex gap-3 text-sm leading-relaxed text-white/75">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: gradient(t) }} />
              {line}
            </motion.li>
          ))}
        </ul>
      </motion.section>

      <motion.button
        {...rise(1.9)}
        whileTap={{ scale: 0.96 }}
        onClick={onDone}
        className="mt-8 w-full shrink-0 rounded-full py-4 text-base font-bold text-ink"
        style={{ background: gradient(t, 90), boxShadow: `0 10px 40px ${t.glow}` }}
      >
        Terminer
      </motion.button>
    </div>
  )
}
