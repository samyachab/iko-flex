import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CONDITIONS, SPORTS } from '../data/conditions.js'
import { EXERCISES } from '../data/exercises.js'
import { profileReport, resolveProfile } from '../lib/profile.js'
import { listAthletes, saveAthlete } from '../lib/cloud.js'
import { TONES, gradient, rise } from '../lib/theme.js'

const STATUS = {
  general: { label: 'Routine générale', color: 'rgba(255,255,255,0.45)' },
  draft: { label: 'À valider', color: '#FFC29A' },
  active: { label: 'Personnalisée', color: '#8BF1DA' },
}
const MAX_KEYS = 6
const EMPTY_RULES = { exclude_tags: [], force_include: {}, overrides: {} }
const HOME = EXERCISES.filter((e) => e.theme === 'souplesse' || e.theme === 'renfo')

const card = 'rounded-[2rem] border border-white/10 bg-white/[0.04] p-5'
const label = 'text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40'

const ago = (day) => {
  if (!day) return 'aucune séance'
  const [y, m, d] = day.split('-').map(Number)
  const n = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(y, m - 1, d)) / 86400000)
  return n <= 0 ? 'séance aujourd’hui' : n === 1 ? 'séance hier' : `dernière séance il y a ${n} j`
}

function Chip({ on, onClick, children, color = '#8BF1DA', disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-30 ${
        on ? 'font-semibold text-ink' : 'border-white/15 text-white/65'
      }`}
      style={on ? { background: color, borderColor: color } : undefined}
    >
      {children}
    </button>
  )
}

// Fiche d'une personne : conditions, sport, exercices clés, règles avancées, avec aperçu en direct
function AthleteEditor({ athlete, onBack, onSaved }) {
  const d = athlete.data ?? {}
  const [status, setStatus] = useState(athlete.status)
  const [sport, setSport] = useState(d.sport ?? 'aucun')
  const [issues, setIssues] = useState(d.posture_issues ?? [])
  const [pains, setPains] = useState(d.pain_points ?? [])
  const [goals, setGoals] = useState(d.goals ?? [])
  const [keys, setKeys] = useState(d.keys ?? [])
  const [rulesText, setRulesText] = useState(JSON.stringify({ ...EMPTY_RULES, ...d.rules }, null, 2))
  const [plan] = useState(d.plan)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  let rules = null
  try {
    rules = JSON.parse(rulesText)
  } catch {
    rules = null
  }
  const data = { sport, goals, posture_issues: issues, pain_points: pains, keys, rules: rules ?? EMPTY_RULES, ...(plan ? { plan } : {}) }
  const report = useMemo(() => profileReport(resolveProfile(data)), [JSON.stringify(data)])

  const toggle = (list, setList, id) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  const save = async () => {
    setBusy(true)
    setMessage(null)
    const res = await saveAthlete(athlete.id, { status, data })
    setBusy(false)
    if (res.error) return setMessage(res.error)
    setMessage('Enregistré. La personne verra sa fiche en rouvrant l’appli.')
    onSaved({ ...athlete, status, data })
  }

  const conditions = (kind) => Object.entries(CONDITIONS).filter(([, c]) => c.kind === kind)

  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 [--sb:3rem] [--st:1rem]">
      <motion.button {...rise(0)} onClick={onBack} className="rounded-full border border-white/15 px-4 py-2 text-sm">
        ← Toutes les fiches
      </motion.button>
      <motion.h1 {...rise(0.05)} className="font-display mt-5 text-4xl font-light tracking-tight">
        {athlete.name ?? 'Sans prénom'}
      </motion.h1>
      <motion.p {...rise(0.08)} className="mt-1 text-sm text-white/45">
        {athlete.email} · {athlete.sessions_count} séance{athlete.sessions_count > 1 ? 's' : ''} · {ago(athlete.last_session)}
      </motion.p>

      <div className="mt-6 flex flex-col gap-5">
        <motion.section {...rise(0.12)} className={card}>
          <p className={label}>Séances</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(STATUS).map(([k, s]) => (
              <Chip key={k} on={status === k} color={s.color === 'rgba(255,255,255,0.45)' ? '#EDE7DD' : s.color} onClick={() => setStatus(k)}>
                {s.label}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Seul « Personnalisée » applique la fiche ci-dessous. Sinon : routine générale.
          </p>
        </motion.section>

        <motion.section {...rise(0.16)} className={card}>
          <p className={label}>Sport</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(SPORTS).map(([k, s]) => (
              <Chip key={k} on={sport === k} onClick={() => setSport(k)}>
                {s.label}
              </Chip>
            ))}
          </div>

          <p className={`${label} mt-6`}>Objectifs</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {conditions('objectif').map(([k, c]) => (
              <Chip key={k} color="#9D8BFF" on={goals.includes(k)} onClick={() => toggle(goals, setGoals, k)}>
                {c.label}
              </Chip>
            ))}
          </div>

          <p className={`${label} mt-6`}>Posture</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {conditions('posture').map(([k, c]) => (
              <Chip key={k} on={issues.includes(k)} onClick={() => toggle(issues, setIssues, k)}>
                {c.label}
              </Chip>
            ))}
          </div>

          <p className={`${label} mt-6`}>Douleurs</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {conditions('douleur').map(([k, c]) => (
              <Chip key={k} color="#FFC29A" on={pains.includes(k)} onClick={() => toggle(pains, setPains, k)}>
                {c.label}
                {c.refer ? ' ⚕' : ''}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">⚕ = avis d’un kiné ou d’un médecin conseillé avant de s’entraîner seul.</p>
        </motion.section>

        <motion.section {...rise(0.2)} className={card}>
          <div className="flex items-baseline justify-between">
            <p className={label}>Exercices clés</p>
            <span className="text-xs text-white/40">
              {keys.length}/{MAX_KEYS}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/40">Tenus plus longtemps quand la séance est longue (ils ne sont pas imposés).</p>
          <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-y-auto">
            {[...HOME].sort((a, b) => keys.includes(b.id) - keys.includes(a.id)).map((e) => {
              const blocked = report.blocked.some((v) => v.ex.id === e.id)
              return (
                <Chip
                  key={e.id}
                  color={TONES[e.theme].a}
                  on={keys.includes(e.id)}
                  disabled={blocked || (!keys.includes(e.id) && keys.length >= MAX_KEYS)}
                  onClick={() => toggle(keys, setKeys, e.id)}
                >
                  {e.name}
                </Chip>
              )
            })}
          </div>
        </motion.section>

        <motion.section {...rise(0.24)} className={card}>
          <p className={label}>Aperçu</p>
          {report.refer.length > 0 && <p className="mt-3 text-sm text-[#FFC29A]">⚕ Avis d’un pro conseillé : {report.refer.join(', ')}</p>}
          <p className="mt-3 text-sm font-semibold">Écartés ({report.blocked.length})</p>
          <ul className="mt-1 space-y-1 text-xs text-white/55">
            {report.blocked.map((v) => (
              <li key={v.ex.id}>
                ✕ {v.ex.name} <span className="text-white/30">· {v.blockedBy.join(' · ')}</span>
              </li>
            ))}
            {report.blocked.length === 0 && <li className="text-white/30">Aucun</li>}
          </ul>
          <p className="mt-4 text-sm font-semibold">Besoins</p>
          <ul className="mt-1 space-y-1 text-xs text-white/55">
            {report.needs.map((n) => (
              <li key={n.mechanic} className={n.exercises.length ? '' : 'text-[#FFC29A]'}>
                {n.exercises.length ? '✓' : '✗ exercice à créer :'} {n.label}
                {n.every > 1 ? ` (1 séance sur ${n.every})` : ''}
                <span className="text-white/30"> · {n.exercises.length} exercice{n.exercises.length > 1 ? 's' : ''}</span>
              </li>
            ))}
            {report.needs.length === 0 && <li className="text-white/30">Aucun</li>}
          </ul>
          <p className="mt-4 text-sm font-semibold">Consignes personnalisées : {report.adapted.length} exercices</p>
        </motion.section>

        <motion.details {...rise(0.28)} className={card}>
          <summary className={`${label} cursor-pointer`}>Règles avancées</summary>
          <p className="mt-3 text-xs leading-relaxed text-white/40">
            exclude_tags, force_include {'{ mécanique: N }'}, adapt, favor, overrides {'{ id: { include, exclude, replace_by, warning } }'}.
          </p>
          <textarea
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            spellCheck={false}
            rows={10}
            className="mt-3 w-full select-text rounded-2xl border border-white/10 bg-black/30 p-3 font-mono text-xs text-white/80 outline-none focus:border-white/40"
          />
          {!rules && <p className="mt-2 text-xs text-[#FFC29A]">JSON invalide : corrige avant d’enregistrer.</p>}
        </motion.details>

        {message && <p className="text-sm text-white/70">{message}</p>}
        <motion.button
          {...rise(0.3)}
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={busy || !rules}
          className="w-full rounded-full py-4 text-base font-bold text-ink disabled:opacity-50"
          style={{ background: gradient(TONES.renfo, 90) }}
        >
          {busy ? '…' : 'Enregistrer la fiche'}
        </motion.button>
      </div>
    </div>
  )
}

// Espace coach : toutes les personnes inscrites, de la plus active à la moins active
export default function Coach({ account, onBack, onOwnProfileSaved }) {
  const [athletes, setAthletes] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    const res = await listAthletes()
    if (res.error) setError(res.error)
    else setAthletes(res.athletes)
  }
  useEffect(() => {
    load()
  }, [])

  if (selected) {
    return (
      <AthleteEditor
        athlete={selected}
        onBack={() => {
          setSelected(null)
          load()
        }}
        onSaved={(a) => {
          setSelected(a)
          if (a.id === account?.user.id) onOwnProfileSaved()
        }}
      />
    )
  }

  const toValidate = athletes?.filter((a) => a.status === 'draft').length ?? 0

  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 [--sb:3rem] [--st:1rem]">
      <motion.button {...rise(0)} onClick={onBack} className="rounded-full border border-white/15 px-4 py-2 text-sm">
        ← Retour
      </motion.button>
      <motion.h1 {...rise(0.05)} className="font-display mt-5 text-4xl font-light tracking-tight">
        Espace coach
      </motion.h1>
      <motion.p {...rise(0.08)} className="mt-1 text-sm text-white/45">
        {athletes
          ? `${athletes.length} inscrit${athletes.length > 1 ? 's' : ''}${toValidate ? ` · ${toValidate} fiche${toValidate > 1 ? 's' : ''} à valider` : ''}`
          : error ?? 'Chargement…'}
      </motion.p>

      <div className="mt-6 flex flex-col gap-3">
        {athletes?.map((a, i) => {
          const s = STATUS[a.status] ?? STATUS.general
          return (
            <motion.button
              key={a.id}
              {...rise(0.1 + Math.min(i, 8) * 0.03)}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(a)}
              className={`${card} text-left`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-2xl">{a.name ?? 'Sans prénom'}</span>
                <span className="shrink-0 text-xs font-semibold" style={{ color: s.color }}>
                  {s.label}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-white/40">{a.email}</p>
              <p className="mt-2 text-sm text-white/65">
                {a.sessions_count} séance{a.sessions_count > 1 ? 's' : ''} · {ago(a.last_session)}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
