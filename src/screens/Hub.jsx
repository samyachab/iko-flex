import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Blob from '../components/Blob.jsx'
import { getCalendar, getStreaks } from '../lib/streaks.js'
import { routineInfo } from '../lib/routine.js'
import { TONES, gradient, rise } from '../lib/theme.js'

const CARDS = {
  souplesse: { title: 'Souplesse', zones: 'psoas · hanches · épaules · chevilles' },
  renfo: { title: 'Renfo', zones: 'gainage · omoplates · fessiers' },
}
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Avec le prénom du compte : "Bonjour Léa."
function greeting(name) {
  const h = new Date().getHours()
  const who = name ? ` ${name}` : ''
  if (h < 5) return `Encore debout${who} ?`
  if (h < 12) return `Bonjour${who}.`
  if (h < 18) return `Salut${who}.`
  return `Bonsoir${who}.`
}

const snapshot = (name) => ({ streaks: getStreaks(), calendar: getCalendar(), greeting: greeting(name) })

// Relit l'historique quand l'app revient au premier plan (ex : laissée ouverte après minuit).
function useHubData(name) {
  const [data, setData] = useState(() => snapshot(name))
  useEffect(() => {
    const refresh = () => document.visibilityState === 'visible' && setData(snapshot(name))
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [name])
  return data
}

function Streak({ tone, count, best, doneToday, label }) {
  const t = TONES[tone]
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Blob tone={tone} size={46} speed={0.6} />
        <span className="font-display absolute inset-0 flex items-center justify-center text-lg font-semibold text-ink">{count}</span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white/85">
          {count > 1 ? 'jours' : 'jour'} {label}
        </div>
        <div className="text-xs" style={{ color: doneToday ? t.a : 'rgba(255,255,255,0.4)' }}>
          {doneToday ? 'fait aujourd’hui ✓' : count > 0 ? 'garde la flamme' : 'à allumer'}
        </div>
        {best > 0 && <div className="text-[0.65rem] text-white/30">record {best}</div>}
      </div>
    </div>
  )
}

function dotStyle(types) {
  const s = types.includes('souplesse')
  const r = types.includes('renfo')
  if (s && r) return { background: `linear-gradient(135deg, ${TONES.souplesse.b} 50%, ${TONES.renfo.b} 50%)` }
  if (s) return { background: gradient(TONES.souplesse) }
  if (r) return { background: gradient(TONES.renfo) }
  return null
}

function Calendar({ days }) {
  const active = days.filter((d) => d.types.length).length
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] px-5 py-3.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">4 dernières semaines</p>
        <p className="text-[0.65rem] text-white/30">
          {active} {active > 1 ? 'jours actifs' : 'jour actif'}
        </p>
      </div>
      <div className="mt-2.5 grid grid-cols-7 gap-y-1.5">
        {WEEKDAYS.map((w, k) => (
          <span key={k} className="text-center text-[0.6rem] font-semibold text-white/25">
            {w}
          </span>
        ))}
        {days.map((d, k) => {
          const filled = dotStyle(d.types)
          return (
            <div key={d.key} className="flex justify-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35 + k * 0.012, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-3.5 w-3.5 rounded-full"
                style={{
                  ...(filled ?? { background: d.isFuture ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)' }),
                  boxShadow: d.isToday ? '0 0 0 2px #121212, 0 0 0 3.5px rgba(255,255,255,0.55)' : undefined,
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RoutineCard({ routineKey, delay, onLaunch }) {
  const t = TONES[routineKey]
  const { minutes, count } = routineInfo(routineKey)

  const launch = (e) => {
    const orb = e.currentTarget.querySelector('[data-orb]').getBoundingClientRect()
    onLaunch(routineKey, { x: orb.left + orb.width / 2, y: orb.top + orb.height / 2 })
  }

  return (
    <motion.button
      {...rise(delay)}
      whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
      onClick={launch}
      className="relative flex w-full items-center justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.05] px-6 py-5 text-left"
    >
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72"
        style={{ background: `radial-gradient(circle, ${t.glow} 0%, transparent 65%)`, willChange: 'transform' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative">
        <div className="font-display text-[2.2rem] font-medium leading-none tracking-tight">{CARDS[routineKey].title}</div>
        <div className="mt-3 text-sm font-semibold" style={{ color: t.a }}>
          {minutes} min · {count} mouvements
        </div>
        <div className="mt-1 text-xs text-white/45">{CARDS[routineKey].zones}</div>
      </div>
      <div data-orb className="relative shrink-0">
        <motion.div
          style={{ willChange: 'transform' }}
          animate={{ scale: [0.92, 1.04, 0.92] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Blob tone={routineKey} size={72}>
            <svg width="22" height="22" viewBox="0 0 24 24" className="ml-1 fill-ink">
              <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
            </svg>
          </Blob>
        </motion.div>
      </div>
    </motion.button>
  )
}

// Appui long (0,8 s) sur le logo : ouvre le labo (animations + choix de la voix),
// seul accès possible depuis l'app installée qui n'a pas de barre d'adresse.
function useLongPress(callback, ms = 800) {
  const timer = useRef(null)
  const start = () => {
    timer.current = setTimeout(callback, ms)
  }
  const cancel = () => clearTimeout(timer.current)
  return { onPointerDown: start, onPointerUp: cancel, onPointerLeave: cancel, onPointerCancel: cancel, onContextMenu: (e) => e.preventDefault() }
}

export default function Hub({ name, badge = 0, onLaunch, onOpenLab, onOpenSettings }) {
  const longPress = useLongPress(onOpenLab)
  const { streaks, calendar, greeting } = useHubData(name)

  return (
    <div className="safe-top safe-bottom flex h-full flex-col overflow-y-auto px-6 [--sb:1rem] [--st:0.75rem]">
      {/* Conteneur qui capte l'appui long ; l'image ne reçoit aucun geste (sinon iOS propose d'enregistrer le PNG) */}
      <div className="flex items-center justify-between">
        <motion.div {...rise(0)} {...longPress} className="select-none p-1 -m-1" style={{ WebkitTouchCallout: 'none' }}>
          <img src="/logo-wordmark.png" alt="Iko Flex" className="pointer-events-none h-8 w-auto" draggable={false} />
        </motion.div>
        <motion.button
          {...rise(0.05)}
          whileTap={{ scale: 0.9, rotate: 30 }}
          onClick={onOpenSettings}
          aria-label={badge ? `Réglages, ${badge} nouvel inscrit${badge > 1 ? 's' : ''}` : 'Réglages'}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]"
        >
          {badge > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem] font-bold text-ink"
              style={{ background: '#8BF1DA' }}
            >
              {badge}
            </span>
          )}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-white/70">
            <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="10" cy="17" r="2" />
          </svg>
        </motion.button>
      </div>
      <motion.h1 {...rise(0.08)} className="font-display mt-4 text-[2rem] font-light leading-[1.06] tracking-tight">
        {greeting}
        <br />
        <span className="italic text-white/50">Pas besoin d’être motivé,</span>
        <br />
        juste de commencer.
      </motion.h1>

      <motion.div {...rise(0.18)} className="mt-5 flex gap-6">
        <Streak tone="souplesse" label="souplesse" {...streaks.souplesse} />
        <Streak tone="renfo" label="renfo" {...streaks.renfo} />
      </motion.div>

      <motion.div {...rise(0.26)} className="mt-4">
        <Calendar days={calendar} />
      </motion.div>

      <div className="mt-auto flex flex-col gap-3 pt-5">
        <RoutineCard routineKey="souplesse" delay={0.36} onLaunch={onLaunch} />
        <RoutineCard routineKey="renfo" delay={0.44} onLaunch={onLaunch} />
      </div>
    </div>
  )
}
