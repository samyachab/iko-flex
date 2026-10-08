import { useState } from 'react'
import { motion } from 'framer-motion'
import { EXERCISES, GROUPS } from '../data/exercises.js'
import { ROUTINES, routineInfo } from '../lib/routine.js'
import { DURATIONS, MIN_ENABLED, getSettings, saveSettings } from '../lib/settings.js'
import { TONES, gradient, rise } from '../lib/theme.js'
import { LEVEL_LABELS } from '../lib/progress.js'
import VoicePicker from '../components/VoicePicker.jsx'

const TITLES = { souplesse: 'Souplesse', renfo: 'Renfo' }

function Toggle({ on, disabled, onChange, color }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40"
      style={{ background: on ? color : 'rgba(255,255,255,0.12)' }}
    >
      <motion.span
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
        animate={{ left: on ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

function RoutineSettings({ routineKey, settings, update, delay }) {
  const s = settings[routineKey]
  const t = TONES[routineKey]
  const info = routineInfo(routineKey, settings)
  const all = EXERCISES.filter((e) => e.theme === routineKey)
  const enabledCount = all.filter((e) => !s.disabled.includes(e.id)).length
  const groups = Object.keys(ROUTINES[routineKey].plan)
  for (const e of all) if (!groups.includes(e.group)) groups.push(e.group)

  const set = (patch) => update({ ...settings, [routineKey]: { ...s, ...patch } })
  const toggle = (id) => {
    const off = s.disabled.includes(id)
    if (!off && enabledCount <= MIN_ENABLED) return
    set({
      disabled: off ? s.disabled.filter((d) => d !== id) : [...s.disabled, id],
      favorite: !off && s.favorite === id ? null : s.favorite,
    })
  }
  const star = (id) => set({ favorite: s.favorite === id ? null : id, disabled: s.disabled.filter((d) => d !== id) })

  return (
    <motion.section {...rise(delay)} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-3xl font-medium">{TITLES[routineKey]}</h2>
        <span className="text-sm font-semibold" style={{ color: t.a }}>
          ≈ {info.minutes} min · {info.count} mouvements
        </span>
      </div>

      <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Durée visée</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DURATIONS[routineKey].map((m) => (
          <button
            key={m}
            onClick={() => set({ minutes: m })}
            className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={
              s.minutes === m
                ? { background: gradient(t, 90), color: '#121212' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {m} min
          </button>
        ))}
      </div>

      {routineKey === 'renfo' && (
        <>
          <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Niveau</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['auto', 1, 2, 3].map((lv) => {
              const active = (s.level ?? 'auto') === lv
              return (
                <button
                  key={lv}
                  onClick={() => set({ level: lv })}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                  style={
                    active
                      ? { background: gradient(t, 90), color: '#121212' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }
                  }
                >
                  {lv === 'auto' ? 'Auto' : LEVEL_LABELS[lv]}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Auto : séries et répétitions augmentent avec ta régularité.
          </p>
        </>
      )}

      <p className="mt-2 text-xs leading-relaxed text-white/40">
        {routineKey === 'souplesse'
          ? 'Plus la séance est longue, plus il y a d’exercices, et les étirements clés (psoas, quadriceps, pectoraux, soléaire) sont tenus plus longtemps, jusqu’à 2 min par côté.'
          : 'Plus la séance est longue, plus il y a d’exercices dans le circuit, puis chaque effort s’allonge de quelques secondes.'}
      </p>

      <p className="mt-6 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Exercices</p>
      <p className="mt-1 text-xs text-white/40">★ = inclus à chaque séance (un seul par routine). Au moins {MIN_ENABLED} exercices actifs.</p>

      {groups.map((g) => (
        <div key={g} className="mt-4">
          <p className="text-xs font-semibold" style={{ color: t.a }}>
            {GROUPS[g]?.label ?? g}
          </p>
          <ul className="mt-1 divide-y divide-white/[0.06]">
            {all
              .filter((e) => e.group === g)
              .map((e) => {
                const on = !s.disabled.includes(e.id)
                const fav = s.favorite === e.id
                return (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    <button
                      onClick={() => star(e.id)}
                      aria-label={fav ? 'Retirer des incontournables' : 'Inclure à chaque séance'}
                      className="text-xl leading-none transition-transform active:scale-90"
                      style={{ color: fav ? t.a : 'rgba(255,255,255,0.18)' }}
                    >
                      ★
                    </button>
                    <span className={`flex-1 text-sm ${on ? 'text-white/85' : 'text-white/30 line-through'}`}>{e.name}</span>
                    <Toggle on={on} disabled={on && enabledCount <= MIN_ENABLED} onChange={() => toggle(e.id)} color={t.b} />
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </motion.section>
  )
}

export default function Settings({ onBack }) {
  const [settings, setSettings] = useState(getSettings)
  const update = (next) => {
    setSettings(next)
    saveSettings(next)
  }

  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 [--sb:3rem] [--st:1rem]">
      <motion.button {...rise(0)} onClick={onBack} className="rounded-full border border-white/15 px-4 py-2 text-sm">
        ← Retour
      </motion.button>
      <motion.h1 {...rise(0.05)} className="font-display mt-5 text-4xl font-light tracking-tight">
        Réglages
      </motion.h1>
      <motion.p {...rise(0.1)} className="mt-1 text-sm text-white/45">
        Enregistrés automatiquement sur ce téléphone.
      </motion.p>
      <div className="mt-6 flex flex-col gap-5">
        <RoutineSettings routineKey="souplesse" settings={settings} update={update} delay={0.15} />
        <RoutineSettings routineKey="renfo" settings={settings} update={update} delay={0.22} />
        <motion.div {...rise(0.29)}>
          <VoicePicker />
        </motion.div>
      </div>
    </div>
  )
}
