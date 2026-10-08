import { useState } from 'react'
import { motion } from 'framer-motion'
import Figure from '../components/Figure.jsx'
import { EXERCISES, GROUPS } from '../data/exercises.js'
import { ANIMATIONS } from '../data/animations.js'
import { EXTRA_ANIMATIONS } from '../data/animations-extra.js'
import { TONES, gradient, SHAPES } from '../lib/theme.js'
import VoicePicker from '../components/VoicePicker.jsx'
import { experience, getLevel } from '../lib/progress.js'

// Exercices de la dernière extension (à relire en priorité)
const NEW_IDS = new Set([...Object.keys(EXTRA_ANIMATIONS), 'ischio-actif'])
const FILTERS = {
  nouveaux: { label: 'Nouveaux', test: (e) => NEW_IDS.has(e.id) },
  souplesse: { label: 'Souplesse', test: (e) => e.theme === 'souplesse' },
  renfo: { label: 'Renfo', test: (e) => e.theme === 'renfo' },
  tous: { label: 'Tous', test: () => true },
}

// Page cachée (#lab) : toutes les animations en boucle, pour valider le style et les poses.
export default function Lab({ onBack }) {
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState('nouveaux')
  const animated = EXERCISES.filter((e) => ANIMATIONS[e.id])
  const done = animated.filter(FILTERS[filter].test)
  const todo = EXERCISES.filter((e) => !ANIMATIONS[e.id] && e.theme !== 'salle')

  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 [--sb:4rem] [--st:1.5rem]">
      <button onClick={onBack} className="mb-6 rounded-full border border-white/15 px-4 py-2 text-sm">
        ← Retour
      </button>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">Labo animations</p>
      <h1 className="font-display mt-2 text-4xl font-light">
        {animated.length} / {animated.length + todo.length}
      </h1>
      <button onClick={() => setPaused(!paused)} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm">
        {paused ? '▶ Lecture' : '⏸ Pause'}
      </button>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(FILTERS).map(([key, f]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-2 text-sm ${filter === key ? 'border-white/60 bg-white/10' : 'border-white/15 text-white/60'}`}
          >
            {f.label} ({animated.filter(f.test).length})
          </button>
        ))}
      </div>

      {/* Progression automatique (invisible ailleurs dans l'app) */}
      <p className="mt-4 text-xs text-white/40">
        Niveau auto · souplesse {getLevel('souplesse')} ({experience('souplesse')} séances) · renfo {getLevel('renfo')} ({experience('renfo')} séances)
      </p>

      {/* Test du style "v2" (option 1), à comparer avec le style actuel : profil et face */}
      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">Test nouveau style</p>
        {[
          ['lunge-psoas', 'souplesse', 'Lunge Psoas (profil)'],
          ['goblet-squat', 'renfo', 'Goblet Squat (profil)'],
          ['cossack', 'souplesse', 'Cossack (face)'],
          ['trapezes', 'souplesse', 'Trapèzes (de dos)'],
        ].map(([exId, tone, label]) => (
          <div key={exId} className="mt-5">
            <p className="text-sm text-white/60">{label}</p>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {['v1', 'v2'].map((variant) => (
                <div key={variant} className="flex flex-col items-center">
                  <div className="relative aspect-square w-full max-w-80">
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: gradient(TONES[tone]) }}
                      animate={{ borderRadius: SHAPES }}
                      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <Figure id={exId} variant={variant} paused={paused} className="absolute inset-[12%]" />
                  </div>
                  <p className="mt-2 text-xs text-white/50">{variant === 'v1' ? 'Actuel' : 'Nouveau'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Test des couleurs du personnage (nouveau style) */}
      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">Test couleurs</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            ['#121212', 'Encre (actuel)'],
            ['#1c2740', 'Bleu nuit'],
            ['#173a33', 'Vert sapin'],
            ['#3b1f3a', 'Prune'],
            ['#4a2418', 'Terre brûlée'],
            ['#2b2d33', 'Graphite'],
          ].map(([c, label]) => (
            <div key={c} className="flex flex-col items-center">
              <div className="relative aspect-square w-full">
                <motion.div
                  className="absolute inset-0"
                  style={{ background: gradient(TONES.souplesse) }}
                  animate={{ borderRadius: SHAPES }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Figure id="lunge-psoas" variant="v2" color={c} paused={paused} className="absolute inset-[12%]" />
              </div>
              <p className="mt-2 text-xs text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <VoicePicker className="mt-8" />

      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {done.map((ex) => {
          const t = TONES[ex.theme]
          return (
            <section key={ex.id} className="flex flex-col items-center">
              <div className="relative aspect-square w-full max-w-64">
                <motion.div
                  className="absolute inset-0"
                  style={{ background: gradient(t) }}
                  animate={{ borderRadius: SHAPES }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <Figure id={ex.id} paused={paused} className="absolute inset-[12%]" />
              </div>
              <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.3em]" style={{ color: t.a }}>
                {GROUPS[ex.group].label} · {ex.id}
              </p>
              <h2 className="font-display mt-1 text-2xl">{ex.name}</h2>
              <p className="mt-1 max-w-xs text-center text-xs text-white/45">{ex.execution}</p>
            </section>
          )
        })}
      </div>

      {todo.length > 0 && (
        <p className="mt-14 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">À animer</p>
      )}
      <ul className="mt-3 space-y-1 text-sm text-white/50">
        {todo.map((e) => (
          <li key={e.id}>
            {e.name} <span className="text-white/25">· {e.id}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
