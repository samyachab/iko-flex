import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion'
import { GROUPS } from '../data/exercises.js'
import { beep, preloadSpeech, speak, stopSpeech } from '../lib/audio.js'
import { PHRASES, spokenName } from '../lib/phrases.js'
import { setSeconds } from '../lib/routine.js'
import { EASE, SHAPES, TONES, gradient } from '../lib/theme.js'
import Figure, { hasAnimation } from '../components/Figure.jsx'

// Séquence : transition -> effort -> transition -> effort ...
// La première transition sert de "mise en place". Un exercice unilatéral devient deux exercices :
// côté droit, transition "change de côté", côté gauche (avec la durée par côté de la routine).
// w = index de l'effort (une pastille de progression par effort, donc par côté).
// Exercice programmé (renfo, prog) : séries guidées (répétitions au tempo ou secondes),
// récupération entre séries ; une seule pastille pour toutes ses séries.
function buildSteps(routine) {
  const steps = []
  let w = 0
  for (const ex of routine.exercises) {
    const plan = routine.plans?.[ex.id]
    if (ex.prog && plan) {
      const { sets, amount } = plan
      const base = { ex, w, sets, duration: setSeconds(ex, amount), reps: ex.prog.measure === 'reps' ? amount : null }
      const sides = ex.unilateral ? [1, 2] : [undefined]
      steps.push({ phase: 'rest', ex, w, sets, set: 1, side: sides[0], duration: routine.rest })
      for (let set = 1; set <= sets; set++) {
        if (set > 1) steps.push({ phase: 'rest', ex, w, sets, set, side: sides[0], recover: true, duration: ex.prog.rest })
        sides.forEach((side, k) => {
          if (k > 0) steps.push({ phase: 'rest', ex, w, sets, set, side, switch: true, duration: routine.rest })
          steps.push({ ...base, phase: 'work', set, side })
        })
      }
      w++
      continue
    }
    const work = plan?.work ?? (ex.unilateral ? routine.sideWork : routine.work)
    if (ex.unilateral) {
      steps.push({ phase: 'rest', ex, w, side: 1, duration: routine.rest })
      steps.push({ phase: 'work', ex, w: w++, side: 1, duration: work })
      steps.push({ phase: 'rest', ex, w, side: 2, switch: true, duration: routine.rest })
      steps.push({ phase: 'work', ex, w: w++, side: 2, duration: work })
    } else {
      steps.push({ phase: 'rest', ex, w, duration: routine.rest })
      steps.push({ phase: 'work', ex, w: w++, duration: work })
    }
  }
  return steps
}

const SIDE_LABEL = { 1: 'Côté droit', 2: 'Côté gauche' }
const nameDetail = (ex) => ex.name.match(/\((.*?)\)/)?.[1]?.toLowerCase()

// Phrase dite au début d'une étape (null = rien à dire, le bip suffit)
function stepPhrase(s, k) {
  if (s.phase === 'rest') {
    if (s.switch) return PHRASES.switchSide
    if (s.recover) return PHRASES.recover
    return PHRASES.intro(s.ex, k === 0)
  }
  if (s.set > 1 && s.side !== 2) return PHRASES.setStart(s.set, s.sets, s.side)
  if (s.set > 1) return null
  return s.side ? PHRASES.cueSide(s.ex, s.side) : PHRASES.cue(s.ex)
}


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

function Orb({ tone, isRest, stepId, getLeftMs, remaining, breath, paused, flipKey, onTap, exerciseId, selfPaced }) {
  const size = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.3, 260)
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
    // Série en répétitions : à ton rythme, pas de compte à rebours (anneau plein)
    if (paused || selfPaced) return
    const ms = getLeftMs()
    const controls = animate(offset, c, { duration: ms / 1000, ease: 'linear' })
    return () => controls.stop()
  }, [stepId, paused, selfPaced, c, offset, getLeftMs])

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
  const startedAt = useRef(Date.now()) // début de l'étape (séries à ton rythme)
  const workedMs = useRef(0) // temps d'effort réellement fait (pour la règle des 70 %)
  const step = steps[i]
  const tone = TONES[routine.key]
  const total = steps[steps.length - 1].w + 1 // une pastille par effort (séries d'un même exercice regroupées)
  const plannedMs = steps.reduce((sum, s) => sum + (s.phase === 'work' ? s.duration * 1000 : 0), 0)
  const isRest = step.phase === 'rest'
  const breath = useBreath(paused)

  useWakeLock()

  useEffect(() => {
    preloadSpeech([
      PHRASES.switchSide,
      PHRASES.done,
      PHRASES.short,
      PHRASES.recover,
      ...steps.map((s, k) => stepPhrase(s, k)).filter(Boolean),
    ])
  }, [steps])

  const leftMs = () => Math.max(0, paused ? pausedLeft.current : endAt.current - Date.now())
  const getLeftMs = useRef(leftMs)
  getLeftMs.current = leftMs
  const readLeftMs = useMemo(() => () => getLeftMs.current(), [])

  // L'horloge de l'étape suivante est posée AVANT le re-render,
  // pour que l'anneau de l'orbe parte directement avec la bonne durée.
  const advance = (withSound = true) => {
    if (step.phase === 'work' && step.reps) {
      // Série à ton rythme : comptée entière si elle a duré au moins 5 s (évite de valider en passant)
      const elapsed = Date.now() - startedAt.current
      workedMs.current += elapsed >= 5000 ? step.duration * 1000 : elapsed
    } else if (step.phase === 'work') workedMs.current += step.duration * 1000 - leftMs()
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
    startedAt.current = Date.now()
    setI(i + 1)
  }

  // Début de chaque étape : annonce vocale + signal sonore
  useEffect(() => {
    const s = steps[i]
    if (s.phase === 'rest' && s.switch) beep.switchSide()
    if (s.phase === 'work') beep.go()
    const text = stepPhrase(s, i)
    if (text) speak(text)
  }, [i, steps])

  // Boucle du chrono, basée sur l'horloge réelle (pas de dérive)
  useEffect(() => {
    if (paused) return
    if (step.phase === 'work' && step.reps) return // à ton rythme : on attend "Série terminée"
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

  // Glisser franchement à l'horizontale (> 70 px, peu de vertical) = passer à l'étape suivante
  const swipeFrom = useRef(null)
  const swipe = {
    start: (e) => (swipeFrom.current = { x: e.clientX, y: e.clientY }),
    cancel: () => (swipeFrom.current = null),
    end: (e) => {
      const from = swipeFrom.current
      swipeFrom.current = null
      if (!from) return
      const dx = e.clientX - from.x
      const dy = e.clientY - from.y
      if (Math.abs(dx) > 70 && Math.abs(dy) < 50) advance(false)
    },
  }

  const repMode = Boolean(step.phase === 'work' && step.reps)
  const animated = hasAnimation(step.ex.id)
  const showBreath = !paused && !repMode && (isRest || routine.key === 'souplesse')

  return (
    <div
      className="safe-top safe-bottom flex h-full touch-pan-y flex-col px-6 [--sb:1.25rem] [--st:1rem]"
      onPointerDown={swipe.start}
      onPointerUp={swipe.end}
      onPointerCancel={swipe.cancel}
    >
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
          selfPaced={repMode}
          onTap={repMode ? () => advance() : togglePause}
        />
        {/* Chrono (ou répétitions) avec le côté en pastille à droite : D / G */}
        {animated && (
          <div className="relative mt-1 flex items-center justify-center">
            {repMode ? (
              <motion.span
                key={`reps-${i}`}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="font-display text-5xl font-light leading-none tabular-nums text-[#F3EFE8]"
              >
                {step.reps}
                <span className="ml-2 text-lg text-white/45">rép.</span>
              </motion.span>
            ) : (
              <motion.span
                key={remaining}
                initial={{ scale: remaining <= 3 ? 1.3 : 1.06, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="font-display text-5xl font-light leading-none tabular-nums"
                style={{ color: remaining <= 3 ? (isRest ? '#fff' : tone.a) : '#F3EFE8' }}
              >
                {remaining}
              </motion.span>
            )}
            {step.side && (
              <motion.span
                key={`side-${step.side}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                aria-label={SIDE_LABEL[step.side]}
                className="absolute left-full ml-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={isRest ? { background: 'rgba(255,255,255,0.14)', color: '#F3EFE8' } : { background: gradient(tone, 90), color: '#121212' }}
              >
                {step.side === 1 ? 'D' : 'G'}
              </motion.span>
            )}
          </div>
        )}
        <div className="mt-2 h-6">
          <AnimatePresence mode="wait">
            {repMode ? (
              <motion.p
                key="tempo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-white/45"
              >
                À ton rythme · tempo {step.ex.prog.tempo.map(([label, sec]) => `${label.toLowerCase()} ${sec} s`).join(', ')}
              </motion.p>
            ) : showBreath ? (
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

      {/* Texte de l'exercice : une seule pile, même espacement entre chaque ligne */}
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex shrink-0 flex-col items-center gap-2 text-center"
        >
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em]" style={{ color: isRest ? 'rgba(255,255,255,0.45)' : tone.a }}>
            {isRest
              ? step.switch
                ? '⇄ Change de côté'
                : step.recover
                  ? 'Récupère'
                  : i === 0
                    ? 'Mets-toi en place'
                    : 'Ensuite'
              : GROUPS[step.ex.group].label}
          </p>
          <h2 className="font-display text-[1.85rem] font-normal leading-[1.1] tracking-tight">
            {spokenName(step.ex)}
            {nameDetail(step.ex) && <span className="ml-2 text-[0.55em] text-white/40">{nameDetail(step.ex)}</span>}
          </h2>
          {step.sets && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/80">
              Série {step.set}/{step.sets}
              {step.phase === 'work' && (step.reps ? ` · ${step.reps} rép.` : ` · ${step.duration} s`)}
            </span>
          )}
          {isRest ? (
            <p className="max-w-xs text-sm leading-relaxed text-white/55">{step.ex.execution}</p>
          ) : (
            <p className="font-display text-gradient text-xl italic" style={{ backgroundImage: gradient(tone, 90) }}>
              {step.ex.cue}
            </p>
          )}
          {step.ex.warning && (
            <p className={`max-w-xs leading-relaxed ${isRest ? 'text-sm' : 'text-xs text-white/55'}`} style={isRest ? { color: '#FFC29A' } : undefined}>
              ⚠ {step.ex.warning}
            </p>
          )}
          {routine.notes?.[step.ex.id]?.map((note) => (
            <p key={note} className="max-w-xs text-xs leading-relaxed" style={{ color: '#9FD3FF' }}>
              {note}
            </p>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Série en répétitions : un seul gros bouton, la personne avance à son rythme */}
      {repMode && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => advance()}
          className="mt-4 w-full shrink-0 rounded-full py-4 text-base font-bold text-ink"
          style={{ background: gradient(tone, 90), boxShadow: `0 10px 40px ${tone.glow}` }}
        >
          {step.set === step.sets && step.side !== 1 ? 'Exercice terminé ✓' : 'Série terminée ✓'}
        </motion.button>
      )}

      {/* Contrôles discrets : l'essentiel se fait au geste (toucher l'orbe = pause, glisser = passer) */}
      {!repMode && (
        <div className="mt-3 flex shrink-0 items-center justify-center gap-5 text-xs text-white/35">
          <button onClick={togglePause} className="px-2 py-1.5">
            {paused ? '▶ Reprendre' : 'Toucher l’orbe : pause'}
          </button>
          <span className="h-3 w-px bg-white/15" />
          <button onClick={() => advance(false)} className="px-2 py-1.5">
            Glisser : passer ›
          </button>
        </div>
      )}
    </div>
  )
}
