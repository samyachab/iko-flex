import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Blob from '../components/Blob.jsx'
import { getCalendar, getStreaks } from '../lib/streaks.js'
import { ROUTINES, routineSeconds } from '../lib/routine.js'
import { TONES, gradient, rise } from '../lib/theme.js'

const CARDS = {
  souplesse: { title: 'Souplesse', zones: 'psoas · hanches · épaules · chevilles' },
  renfo: { title: 'Renfo', zones: 'gainage · omoplates · fessiers' },
}
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Encore debout ?'
  if (h < 12) return 'Bonjour.'
  if (h < 18) return 'Salut.'
  return 'Bonsoir.'
}

const snapshot = () => ({ streaks: getStreaks(), calendar: getCalendar(), greeting: greeting() })

// Relit l'historique quand l'app revient au premier plan (ex : laissée ouverte après minuit).
function useHubData() {
  const [data, setData] = useState(snapshot)
  useEffect(() => {
    const refresh = () => document.visibilityState === 'visible' && setData(snapshot())
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
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
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] px-5 py-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">4 dernières semaines</p>
        <p className="text-[0.65rem] text-white/30">
          {active} {active > 1 ? 'jours actifs' : 'jour actif'}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-2">
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
  const r = ROUTINES[routineKey]
  const t = TONES[routineKey]
  const minutes = Math.round(routineSeconds(routineKey) / 60)
  const count = Object.values(r.plan).reduce((s, v) => s + v, 0) * r.rounds

  const launch = (e) => {
    const orb = e.currentTarget.querySelector('[data-orb]').getBoundingClientRect()
    onLaunch(routineKey, { x: orb.left + orb.width / 2, y: orb.top + orb.height / 2 })
  }

  return (
    <motion.button
      {...rise(delay)}
      whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
      onClick={launch}
      className="relative flex w-full items-center justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-6 text-left"
    >
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72"
        style={{ background: `radial-gradient(circle, ${t.glow} 0%, transparent 65%)`, willChange: 'transform' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative">
        <div className="font-display text-[2.4rem] font-medium leading-none tracking-tight">{CARDS[routineKey].title}</div>
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
          <Blob tone={routineKey} size={78}>
            <svg width="22" height="22" viewBox="0 0 24 24" className="ml-1 fill-ink">
              <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
            </svg>
          </Blob>
        </motion.div>
      </div>
    </motion.button>
  )
}

export default function Hub({ onLaunch }) {
  const { streaks, calendar, greeting } = useHubData()

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-10">
      <motion.img {...rise(0)} src="/logo-wordmark.png" alt="Iko Flex" className="h-9 w-auto self-start" draggable={false} />
      <motion.h1 {...rise(0.08)} className="font-display mt-3 text-[2.2rem] font-light leading-[1.08] tracking-tight">
        {greeting}
        <br />
        <span className="italic text-white/50">Pas besoin d’être motivé,</span>
        <br />
        juste de commencer.
      </motion.h1>

      <motion.div {...rise(0.18)} className="mt-7 flex gap-6">
        <Streak tone="souplesse" label="souplesse" {...streaks.souplesse} />
        <Streak tone="renfo" label="renfo" {...streaks.renfo} />
      </motion.div>

      <motion.div {...rise(0.26)} className="mt-5">
        <Calendar days={calendar} />
      </motion.div>

      <div className="mt-auto flex flex-col gap-4 pt-8">
        <RoutineCard routineKey="souplesse" delay={0.36} onLaunch={onLaunch} />
        <RoutineCard routineKey="renfo" delay={0.44} onLaunch={onLaunch} />
      </div>
    </div>
  )
}
