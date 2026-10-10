import { useState } from 'react'
import { motion } from 'framer-motion'
import Figure from '../components/Figure.jsx'
import { EXERCISES, GROUPS } from '../data/exercises.js'
import { ANIMATIONS } from '../data/animations.js'
import { EXTRA_ANIMATIONS } from '../data/animations-extra.js'
import { TONES, gradient, SHAPES } from '../lib/theme.js'
import VoicePicker from '../components/VoicePicker.jsx'
import { experience, getLevel } from '../lib/progress.js'
import { allProfiles, currentRules, getProfileId, profileReport, setProfileId } from '../lib/profile.js'

// Profil actif : ce que le filtre écarte, adapte et impose (les vrais profils viendront avec la connexion)
function ProfilePanel() {
  const active = getProfileId()
  const report = profileReport(currentRules(active))
  const pick = (id) => {
    setProfileId(id)
    window.location.reload()
  }
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 text-sm">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40">Profil actif</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.values(allProfiles()).map((p) => (
          <button
            key={p.id}
            onClick={() => pick(p.id)}
            className={`rounded-full border px-4 py-2 ${p.id === active ? 'border-white/60 bg-white/10' : 'border-white/15 text-white/60'}`}
          >
            {p.name}
          </button>
        ))}
      </div>
      {report.refer.length > 0 && <p className="mt-3 text-[#FFC29A]">⚕ Avis d’un pro conseillé : {report.refer.join(', ')}</p>}
      <p className="mt-4 font-semibold">Écartés ({report.blocked.length})</p>
      <ul className="mt-1 space-y-1 text-xs text-white/55">
        {report.blocked.map((v) => (
          <li key={v.ex.id}>
            ✕ {v.ex.name} <span className="text-white/30">· {v.blockedBy.join(' · ')}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold">Besoins (au moins un par séance)</p>
      <ul className="mt-1 space-y-1 text-xs text-white/55">
        {report.needs.map((n) => (
          <li key={n.mechanic} className={n.exercises.length ? '' : 'text-[#FFC29A]'}>
            {n.exercises.length ? '✓' : '✗ à créer :'} {n.label}{' '}
            <span className="text-white/30">· {n.exercises.map((e) => e.name).join(', ')}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold">Consignes ajoutées : {report.adapted.length} exercices</p>
    </section>
  )
}

// Exercices de la dernière extension (à relire en priorité)
const NEW_IDS = new Set([...Object.keys(EXTRA_ANIMATIONS), 'ischio-actif'])
// Bibliothèque générale : classiques pour tous, ajoutés le 10 octobre 2026 (à relire en priorité)
const GENERAL_IDS = new Set([
  'pince-assise',
  'pince-debout',
  'pince-debout-croisee',
  'ischio-sangle',
  'ischio-pied-sureleve',
  'papillon',
  'cobra',
  'quadri-allonge',
  'epaule-croise',
  'triceps-tete',
  'poignets',
  'nuque',
  'lateral-debout',
  'biceps-mur',
  'squat',
  'fentes-avant',
  'pont-fessier',
  'hip-thrust-kb',
  'mollets-debout',
  'superman',
  'crunch',
  'leg-raises',
  'russian-twist',
  'mountain-climbers',
  'shoulder-taps',
  'pompes-inclinees',
  'dips-chaise',
  'heel-touches',
  'bicycle-crunch',
  'hollow-hold',
  'toe-touch-crunch',
  'flutter-kicks',
  'sit-in',
  'plank-genou-coude',
  'gainage-lateral-dynamique',
  'squat-saute',
  'jumping-jacks',
  'burpees',
])

const FILTERS = {
  generale: { label: 'Générale', test: (e) => GENERAL_IDS.has(e.id) },
  nouveaux: { label: 'Nouveaux', test: (e) => NEW_IDS.has(e.id) },
  souplesse: { label: 'Souplesse', test: (e) => e.theme === 'souplesse' },
  renfo: { label: 'Renfo', test: (e) => e.theme === 'renfo' },
  tous: { label: 'Tous', test: () => true },
}

// Page cachée (#lab) : toutes les animations en boucle, pour valider le style et les poses.
export default function Lab({ onBack }) {
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState('generale')
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

      <ProfilePanel />

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
