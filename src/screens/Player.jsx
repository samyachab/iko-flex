import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion'
import { GROUPS } from '../data/exercises.js'
import { beep, preloadSpeech, speak, stopSpeech } from '../lib/audio.js'
import { PHRASES } from '../lib/phrases.js'
import { EASE, SHAPES, TONES, gradient } from '../lib/theme.js'
import Figure, { hasAnimation } from '../components/Figure.jsx'

// Séquence : transition -> effort -> transition -> effort ...
// La première transition sert de "mise en place". Un exercice unilatéral devient deux exercices :
// côté droit, transition "change de côté", côté gauche (avec la durée par côté de la routine).
// w = index de l'effort (une pastille de progression par effort, donc par côté).
function buildSteps(routine) {
  const steps = []
  let w = 0
  for (const ex of routine.exercises) {
    if (ex.unilateral) {
      steps.push({ phase: 'rest', ex, w, side: 1, duration: routine.rest })
      steps.push({ phase: 'work', ex, w: w++, side: 1, duration: routine.sideWork })
      steps.push({ phase: 'rest', ex, w, side: 2, switch: true, duration: routine.rest })
      steps.push({ phase: 'work', ex, w: w++, side: 2, duration: routine.sideWork })
    } else {
      steps.push({ phase: 'rest', ex, w, duration: routine.rest })
      steps.push({ phase: 'work', ex, w: w++, duration: routine.work })
    }
  }
  return steps
}

const SIDE_LABEL = { 1: 'Côté droit', 2: 'Côté gauche' }

function useWakeLock() {
  useEffect(() => {
    let lock
    const acquire = () =>
      navigator.wakeLock
        ?.request('screen')
        .then((l) => (lock = l))
        .catch(() => {})
    acquire()
    // Le verrou saute quand l'app passe en arrière-plan : on le reprend au retour.
    const onVisible = () => document.visibilityState === 'visible' && acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [])
}

// Guide de respiration : 4s inspire / 6s expire (expiration longue = relâchement).
// Un seul timer par demi-cycle au lieu d'un polling : zéro re-render inutile.
function useBreath(paused) {
  const [phase, setPhase] = useState('in')
  const left = useRef(4000)
  useEffect(() => {
    if (paused) return
    let started = Date.now()
    let id
    const schedule = () => {
      id = setTimeout(() => {
        setPhase((p) => {
          const next = p === 'in' ? 'out' : 'in'
          left.current = next === 'in' ? 4000 : 6000
          return next
        })
        started = Date.now()
        schedule()
      }, left.current)
    }
    schedule()
    return () => {
      clearTimeout(id)
      left.current = Math.max(0, left.current - (Date.now() - started))
    }
  }, [paused])
  return phase
}

function Orb({ tone, isRest, stepId, getLeftMs, remaining, breath, paused, flipKey, onTap, exerciseId }) {
  const size = Math.min(window.innerWidth * 0.68, window.innerHeight * 0.34, 290)
  const ring = size + 44
  const r = ring / 2 - 3
  const c = 2 * Math.PI * r
  const t = TONES[tone]
  const rest = TONES.rest
  const offset = useMotionValue(0)

  // Anneau : une seule animation linéaire continue jusqu'à la fin de l'étape
  // (pas de saut à chaque seconde). Pause = stop sur place, reprise = repart d'où il est.
  useEffect(() => {
    offset.set(0)
  }, [stepId, offset])
  useEffect(() => {
    if (paused) return
    const ms = getLeftMs()
    const controls = animate(offset, c, { duration: ms / 1000, ease: 'linear' })
    return () => controls.stop()
  }, [stepId, paused, c, offset, getLeftMs])

  const scale = paused ? 0.8 : isRest ? 0.62 : breath === 'in' ? 1 : 0.84

  return (
    <button onClick={onTap} className="relative flex items-center justify-center" style={{ width: ring, height: ring }} aria-label="Pause">
      {/* Halo : dégradé radial statique (bien moins coûteux qu'un box-shadow redessiné à chaque frame) */}
      <motion.div
        className="pointer-events-none absolute -inset-10"
        style={{ willChange: 'transform, opacity' }}
        animate={{ scale: scale * 1.05, opacity: isRest ? 0.5 : 1 }}
        transition={{ duration: paused ? 0.6 : breath === 'in' ? 4 : 6, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle, ${isRest ? rest.glow : t.glow} 0%, transparent 62%)` }} />
      </motion.div>

      <svg width={ring} height={ring} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={isRest ? rest.a : t.a} />
            <stop offset="1" stopColor={isRest ? rest.c : t.c} />
          </linearGradient>
        </defs>
        <circle cx={ring / 2} cy={ring / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" />
        <motion.circle
          cx={ring / 2}
          cy={ring / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset }}
        />
      </svg>

      <motion.div
        className="relative"
        style={{ width: size, height: size, willChange: 'transform' }}
        animate={{ scale, rotateY: flipKey * 180 }}
        transition={{
          scale: { duration: paused ? 0.6 : isRest ? 1.2 : breath === 'in' ? 4 : 6, ease: 'easeInOut' },
          rotateY: { type: 'spring', stiffness: 90, damping: 16 },
        }}
      >
        {/* Un seul élément se déforme (border-radius) ; les couleurs ne font que des fondus d'opacité */}
        <motion.div
          className="relative h-full w-full overflow-hidden"
          style={{ willChange: 'transform' }}
          animate={{ rotate: 360, borderRadius: SHAPES }}
          transition={{
            rotate: { duration: 36, repeat: Infinity, ease: 'linear' },
            borderRadius: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="absolute inset-0" style={{ background: gradient(rest) }} />
          <motion.div
            className="absolute inset-0"
            style={{ background: gradient(t) }}
            initial={false}
            animate={{ opacity: isRest ? 0 : 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </motion.div>
        {/* Démo du mouvement : hors de l'élément qui tourne, mais suit le souffle et le retournement de côté */}
        {exerciseId && <Figure id={exerciseId} paused={paused} className="absolute inset-[13%]" />}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {!exerciseId && (
        <motion.span
          key={remaining}
          initial={{ scale: remaining <= 3 ? 1.3 : 1.05, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="font-display text-[5.5rem] font-light leading-none tabular-nums text-ink/90"
        >
          {remaining}
        </motion.span>
        )}
        <AnimatePresence>
          {paused && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 text-xs font-bold uppercase tracking-[0.3em] text-ink/70"
            >
              en pause
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </button>
  )
}

export default function Player({ routine, onFinish, onQuit }) {
  const steps = useMemo(() => buildSteps(routine), [routine])
  const [i, setI] = useState(0)
  const [remaining, setRemaining] = useState(steps[0].duration)
  const [paused, setPaused] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const endAt = useRef(null)
  if (endAt.current === null) endAt.current = Date.now() + steps[0].duration * 1000
  const lastSec = useRef(steps[0].duration)
  const pausedLeft = useRef(0)
  const workedMs = useRef(0) // temps d'effort réellement fait (pour la règle des 70 %)
  const step = steps[i]
  const tone = TONES[routine.key]
  const total = steps.filter((s) => s.phase === 'work').length
  const plannedMs = steps.reduce((sum, s) => sum + (s.phase === 'work' ? s.duration * 1000 : 0), 0)
  const isRest = step.phase === 'rest'
  const breath = useBreath(paused)

  useWakeLock()

  useEffect(() => {
    preloadSpeech([
      PHRASES.switchSide,
      PHRASES.done,
      PHRASES.short,
      ...steps.map((s, k) =>
        s.phase === 'rest' ? (s.switch ? PHRASES.switchSide : PHRASES.intro(s.ex, k === 0)) : s.side ? PHRASES.cueSide(s.ex, s.side) : PHRASES.cue(s.ex),
      ),
    ])
  }, [steps])

  const leftMs = () => Math.max(0, paused ? pausedLeft.current : endAt.current - Date.now())
  const getLeftMs = useRef(leftMs)
  getLeftMs.current = leftMs
  const readLeftMs = useMemo(() => () => getLeftMs.current(), [])

  // L'horloge de l'étape suivante est posée AVANT le re-render,
  // pour que l'anneau de l'orbe parte directement avec la bonne durée.
  const advance = (withSound = true) => {
    if (step.phase === 'work') workedMs.current += step.duration * 1000 - leftMs()
    if (withSound && step.phase === 'work') beep.workEnd()
    if (i === steps.length - 1) {
      onFinish({ workedMs: workedMs.current, plannedMs })
      return
    }
    const next = steps[i + 1]
    endAt.current = Date.now() + next.duration * 1000
    lastSec.current = next.duration
    setRemaining(next.duration)
    setPaused(false)
    setI(i + 1)
  }

  // Début de chaque étape : annonce vocale + signal sonore
  useEffect(() => {
    const s = steps[i]
    if (s.phase === 'rest') {
      if (s.switch) beep.switchSide()
      speak(s.switch ? PHRASES.switchSide : PHRASES.intro(s.ex, i === 0))
    } else {
      beep.go()
      speak(s.side ? PHRASES.cueSide(s.ex, s.side) : PHRASES.cue(s.ex))
    }
  }, [i, steps])

  // Boucle du chrono, basée sur l'horloge réelle (pas de dérive)
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      if (left === lastSec.current) return
      lastSec.current = left
      setRemaining(left)
      if (left > 0 && left <= 3) beep.tick()
      if (left === 0) advance()
    }, 100)
    return () => clearInterval(id)
  })

  useEffect(() => {
    if (!confirmQuit) return
    const t = setTimeout(() => setConfirmQuit(false), 2500)
    return () => clearTimeout(t)
  }, [confirmQuit])

  const togglePause = () => {
    if (paused) {
      endAt.current = Date.now() + pausedLeft.current
    } else {
      pausedLeft.current = Math.max(0, endAt.current - Date.now())
      stopSpeech()
    }
    setPaused(!paused)
  }

  const quit = () => {
    if (!confirmQuit) return setConfirmQuit(true)
    stopSpeech()
    onQuit()
  }

  const animated = hasAnimation(step.ex.id)
  const showBreath = !paused && (isRest || routine.key === 'souplesse')

  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-5">
      {/* Barre du haut : quitter · progression · compteur */}
      <div className="flex items-center gap-4">
        <motion.button
          layout
          onClick={quit}
          className="h-9 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-white/70"
        >
          {confirmQuit ? 'Quitter ?' : '✕'}
        </motion.button>
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {Array.from({ length: total }, (_, k) => {
            const current = k === step.w
            const done = k < step.w
            return (
              <motion.div
                key={k}
                className="h-1.5 rounded-full"
                animate={{
                  width: current ? 22 : 6,
                  background: done || (current && !isRest) ? tone.b : current ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            )
          })}
        </div>
        <span className="w-9 text-right text-sm font-semibold tabular-nums text-white/50">
          {step.w + 1}/{total}
        </span>
      </div>

      {/* Orbe + respiration */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <Orb
          tone={routine.key}
          isRest={isRest}
          remaining={remaining}
          stepId={i}
          getLeftMs={readLeftMs}
          exerciseId={animated ? step.ex.id : null}
          breath={breath}
          paused={paused}
          flipKey={step.side === 2 ? 1 : 0}
          onTap={togglePause}
        />
        {animated && (
          <motion.span
            key={remaining}
            initial={{ scale: remaining <= 3 ? 1.3 : 1.06, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="font-display -mt-1 text-5xl font-light leading-none tabular-nums"
            style={{ color: remaining <= 3 ? (isRest ? '#fff' : tone.a) : '#F3EFE8' }}
          >
            {remaining}
          </motion.span>
        )}
        <div className="mt-3 h-6">
          <AnimatePresence mode="wait">
            {showBreath ? (
              <motion.p
                key={breath}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.8 }}
                className="font-display text-lg italic text-white/55"
              >
                {breath === 'in' ? 'inspire…' : 'expire…'}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Texte de l'exercice */}
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="min-h-44 text-center"
        >
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: isRest ? 'rgba(255,255,255,0.45)' : tone.a }}>
            {isRest ? (step.switch ? '⇄ Change de côté' : i === 0 ? 'Mets-toi en place' : 'Ensuite') : GROUPS[step.ex.group].label}
          </p>
          <h2 className="font-display mt-2 text-[2.1rem] font-normal leading-[1.1] tracking-tight">{step.ex.name}</h2>
          {step.side && (
            <motion.span
              key={`side-${step.side}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="mt-2 inline-block rounded-full px-4 py-1 text-sm font-bold"
              style={isRest ? { background: 'rgba(255,255,255,0.12)', color: '#F3EFE8' } : { background: gradient(tone, 90), color: '#121212' }}
            >
              {step.side === 2 ? '◀ ' : ''}
              {SIDE_LABEL[step.side]}
              {step.side === 1 ? ' ▶' : ''}
            </motion.span>
          )}
          {isRest ? (
            <>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/55">{step.ex.execution}</p>
              {step.ex.warning && (
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed" style={{ color: '#FFC29A' }}>
                  ⚠ {step.ex.warning}
                </p>
              )}
            </>
          ) : (
            <>
              <p
                className="font-display text-gradient mt-2 text-xl italic"
                style={{ backgroundImage: gradient(tone, 90) }}
              >
                {step.ex.cue}
              </p>
              {step.ex.warning ? (
                <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-white/55">⚠ {step.ex.warning}</p>
              ) : (
                <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-white/40">{step.ex.execution}</p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Contrôles discrets */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePause}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"
          aria-label={paused ? 'Reprendre' : 'Pause'}
        >
          {paused ? (
            <svg width="18" height="18" viewBox="0 0 24 24" className="ml-0.5 fill-white/85"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-white/85"><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></svg>
          )}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => advance(false)}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"
          aria-label="Passer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="fill-white/85"><path d="M5 5.5v13a1 1 0 0 0 1.55.83L15 13.2V18a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v4.8L6.55 4.67A1 1 0 0 0 5 5.5Z" /></svg>
        </motion.button>
      </div>
    </div>
  )
}
