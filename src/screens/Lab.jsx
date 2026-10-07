import { useState } from 'react'
import { motion } from 'framer-motion'
import Figure from '../components/Figure.jsx'
import { EXERCISES, GROUPS } from '../data/exercises.js'
import { ANIMATIONS } from '../data/animations.js'
import { TONES, gradient, SHAPES } from '../lib/theme.js'

// Page cachée (#lab) : toutes les animations en boucle, pour valider le style et les poses.
export default function Lab() {
  const [paused, setPaused] = useState(false)
  const done = EXERCISES.filter((e) => ANIMATIONS[e.id])
  const todo = EXERCISES.filter((e) => !ANIMATIONS[e.id] && e.theme !== 'salle')

  return (
    <div className="h-full overflow-y-auto px-6 pb-16 pt-10">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">Labo animations</p>
      <h1 className="font-display mt-2 text-4xl font-light">
        {done.length} / {done.length + todo.length}
      </h1>
      <button onClick={() => setPaused(!paused)} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm">
        {paused ? '▶ Lecture' : '⏸ Pause'}
      </button>

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
