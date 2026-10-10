import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Figure from '../components/Figure.jsx'
import { CONDITIONS, SPORTS } from '../data/conditions.js'
import { EQUIPMENT } from '../data/exercises.js'
import { buildProposal, textConditions, visibleSteps } from '../data/onboarding.js'
import { analyzeText } from '../lib/analyze.js'
import { submitIntake } from '../lib/cloud.js'
import { DURATIONS, getSettings, saveSettings } from '../lib/settings.js'
import { EASE, SHAPES, TONES, gradient } from '../lib/theme.js'

// Questionnaire d'accueil, pensé TDAH : une seule question à l'écran, de grosses cartes, une barre de
// progression, passage automatique dès qu'on choisit, « Passer » partout, reprise là où on s'était arrêté.
const SAVE_KEY = 'iko-flex:onboarding'
const AUTO_NEXT = 280 // ms : le temps de voir son choix s'allumer
const t = TONES.souplesse

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) ?? null
  } catch {
    return null
  }
}
const persist = (state) => {
  try {
    if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(state))
    else localStorage.removeItem(SAVE_KEY)
  } catch {
    // stockage indisponible : pas de reprise, rien de grave
  }
}

function Option({ on, onClick, label, hint }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={on}
      className={`w-full rounded-3xl border px-5 py-4 text-left transition-colors ${
        on ? 'border-transparent text-ink' : 'border-white/10 bg-white/[0.05] text-white/90'
      }`}
      style={on ? { background: gradient(t, 100) } : undefined}
    >
      <span className="block text-lg font-semibold leading-snug">{label}</span>
      {hint && <span className={`mt-1 block text-sm leading-snug ${on ? 'text-ink/70' : 'text-white/45'}`}>{hint}</span>}
    </motion.button>
  )
}

function MinutesPicker({ value, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      {['souplesse', 'renfo'].map((key) => (
        <div key={key}>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">{key === 'souplesse' ? 'Souplesse' : 'Renfo'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DURATIONS[key].map((m) => {
              const on = value[key] === m
              return (
                <button
                  key={m}
                  onClick={() => onChange({ ...value, [key]: m })}
                  className="rounded-full px-5 py-3 text-base font-semibold transition-colors"
                  style={on ? { background: gradient(TONES[key], 90), color: '#121212' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
                >
                  {m} min
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Récap : ce que le coach va recevoir, en mots simples
function Recap({ answers, onRemove }) {
  const proposal = buildProposal(answers)
  const understood = answers.text?.trim() ? analyzeText(answers.text).conditions : []
  // Gardé = encore dans la fiche finale (ex. « ischios courts » disparaît avec l'hyperlordose : c'est le paradoxe)
  const inProposal = new Set([...proposal.goals, ...proposal.posture_issues, ...proposal.pain_points])
  const kept = textConditions(answers).filter((c) => inProposal.has(c))
  const labels = (ids) => ids.map((id) => CONDITIONS[id]?.label).filter(Boolean)
  const rows = [
    ['Objectifs', labels(proposal.goals)],
    ['Sport', [SPORTS[proposal.sport]?.label].filter(Boolean)],
    ['Posture', labels(proposal.posture_issues)],
    ['Douleurs', labels(proposal.pain_points)],
  ].filter(([, v]) => v.length)
  return (
    <div className="flex flex-col gap-3">
      {understood.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-5 py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Ce que j’ai compris de ton message</p>
          <p className="mt-1 text-xs text-white/40">Touche ce qui ne te correspond pas pour le retirer.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {understood.map((c) => {
              const on = kept.includes(c)
              return (
                <button
                  key={c}
                  onClick={() => onRemove(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${on ? 'border-white/30 text-white/85' : 'border-white/10 text-white/30 line-through'}`}
                >
                  {CONDITIONS[c]?.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {rows.map(([title, items]) => (
        <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.05] px-5 py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">{title}</p>
          <p className="mt-1 text-base leading-snug text-white/85">{items.join(' · ')}</p>
        </div>
      ))}
      {answers.red_flags === true && (
        <p className="rounded-3xl border border-[#FFC29A]/40 px-5 py-4 text-sm leading-relaxed text-[#FFC29A]">
          Vu ce que tu décris, montre cette douleur à un kiné ou un médecin avant de t’entraîner dessus. En attendant, ta
          routine générale reste douce.
        </p>
      )}
    </div>
  )
}

export default function Onboarding({ name, onDone }) {
  const saved = load()
  const [answers, setAnswers] = useState(saved?.answers ?? {})
  const [index, setIndex] = useState(saved?.index ?? 0)
  const [phase, setPhase] = useState('questions') // 'questions' | 'recap' | 'sent'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const steps = visibleSteps(answers)
  const step = steps[Math.min(index, steps.length - 1)]
  const value = answers[step.id]
  // Progression
  // (tant que les choix ne sont pas faits, on compte le parcours le plus long, pour ne pas sauter en arrière)
  const longest = visibleSteps({ mode: 'custom', how: 'both', consent: true, ...answers })
  const progress = phase === 'questions' ? (longest.findIndex((x) => x.id === step.id) + 1) / (longest.length + 1) : 1

  useEffect(() => {
    persist(phase === 'sent' ? null : { answers, index })
  }, [answers, index, phase])

  const next = (nextAnswers = answers) => {
    const list = visibleSteps(nextAnswers)
    const i = list.findIndex((s) => s.id === step.id)
    if (nextAnswers.mode === 'general') return send(nextAnswers)
    if (i + 1 < list.length) setIndex(i + 1)
    else setPhase('recap')
  }
  const back = () => {
    if (phase === 'recap') return setPhase('questions')
    setIndex(Math.max(0, index - 1))
  }
  const answer = (v) => {
    const nextAnswers = { ...answers, [step.id]: v }
    setAnswers(nextAnswers)
    if (step.type === 'single' || step.type === 'consent') setTimeout(() => next(nextAnswers), AUTO_NEXT)
  }
  const toggle = (v) => {
    const list = value ?? []
    if (list.includes(v)) return answer(list.filter((x) => x !== v))
    if (step.max && list.length >= step.max) return
    answer([...list, v])
  }

  async function send(final = answers) {
    setBusy(true)
    setError(null)
    // Réglages tout de suite : durées et matériel servent même avant la validation du coach
    const s = getSettings()
    if (final.minutes) {
      s.souplesse.minutes = final.minutes.souplesse
      s.renfo.minutes = final.minutes.renfo
    }
    if (final.equipment) s.missing = Object.keys(EQUIPMENT).filter((k) => !final.equipment.includes(k))
    if (final.level && final.level !== '?') s.renfo.level = final.level
    saveSettings(s)

    const res = await submitIntake({
      mode: final.mode,
      answers: final,
      proposal: final.mode === 'custom' ? buildProposal(final) : {},
      redFlags: final.red_flags === true,
    })
    setBusy(false)
    if (res.error) return setError(res.error)
    if (final.mode === 'general') return finish()
    setPhase('sent')
  }
  const finish = () => {
    persist(null)
    onDone()
  }

  // Valeur par défaut de l'étape minutes : les réglages actuels
  useEffect(() => {
    if (step.type === 'minutes' && !value) {
      const s = getSettings()
      setAnswers((a) => ({ ...a, minutes: { souplesse: s.souplesse.minutes, renfo: s.renfo.minutes } }))
    }
  }, [step.id])

  const screenKey = phase === 'questions' ? step.id : phase

  return (
    <div className="safe-top safe-bottom flex h-full flex-col px-6 [--sb:1.5rem] [--st:1rem]">
      {/* Barre du haut : retour, progression, passer */}
      {phase !== 'sent' && (
        <div className="flex items-center gap-4">
          <button
            onClick={back}
            disabled={phase === 'questions' && index === 0}
            aria-label="Question précédente"
            className="h-10 w-10 shrink-0 rounded-full border border-white/15 text-lg disabled:opacity-0"
          >
            ←
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: gradient(t, 90) }}
              animate={{ width: `${Math.max(6, progress * 100)}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
          {phase === 'questions' && !['mode', 'how'].includes(step.id) && step.type !== 'consent' ? (
            <button onClick={() => next({ ...answers, [step.id]: answers[step.id] ?? (step.type === 'multi' ? [] : step.type === 'text' ? '' : '?') })} className="shrink-0 text-sm text-white/45">
              Passer
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-8 flex min-h-0 flex-1 flex-col"
        >
          {phase === 'questions' && (
            <>
              {step.id === 'mode' && name && <p className="text-sm text-white/45">Bienvenue {name}.</p>}
              {step.test && <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em]" style={{ color: t.a }}>Petit test · 10 secondes</p>}
              <h1 className="font-display mt-2 text-[2.1rem] font-light leading-tight tracking-tight">{step.title}</h1>
              {step.subtitle && <p className="mt-3 text-base leading-relaxed text-white/55">{step.subtitle}</p>}

              {step.animation && (
                <div className="relative mx-auto mt-5 aspect-square w-40 shrink-0">
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: gradient(t) }}
                    animate={{ borderRadius: SHAPES }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <Figure id={step.animation} className="absolute inset-[12%]" />
                </div>
              )}

              <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4">
                {(step.type === 'single' || step.type === 'consent') &&
                  step.options.map((o) => <Option key={String(o.value)} {...o} on={value === o.value} onClick={() => answer(o.value)} />)}
                {step.type === 'multi' &&
                  step.options.map((o) => <Option key={o.value} {...o} on={(value ?? []).includes(o.value)} onClick={() => toggle(o.value)} />)}
                {step.type === 'minutes' && value && <MinutesPicker value={value} onChange={answer} />}
                {step.type === 'text' && (
                  <textarea
                    value={value ?? ''}
                    onChange={(e) => answer(e.target.value)}
                    placeholder={step.placeholder}
                    rows={7}
                    maxLength={1500}
                    className="w-full select-text rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-base leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-white/40"
                  />
                )}
              </div>

              {(step.type === 'multi' || step.type === 'minutes' || step.type === 'text') && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => next({ ...answers, [step.id]: value ?? (step.type === 'text' ? '' : []) })}
                  className="w-full shrink-0 rounded-full py-4 text-base font-bold text-ink"
                  style={{ background: gradient(t, 90) }}
                >
                  {step.type === 'multi' && step.max ? `Continuer · ${(value ?? []).length}/${step.max}` : 'Continuer'}
                </motion.button>
              )}
            </>
          )}

          {phase === 'recap' && (
            <>
              <h1 className="font-display text-[2.1rem] font-light leading-tight tracking-tight">C’est tout bon.</h1>
              <p className="mt-3 text-base leading-relaxed text-white/55">Voilà ta fiche. Ton coach pourra encore l’ajuster.</p>
              <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-4">
                <Recap
                  answers={answers}
                  onRemove={(c) => {
                    const removed = answers.text_removed ?? []
                    setAnswers({ ...answers, text_removed: removed.includes(c) ? removed.filter((x) => x !== c) : [...removed, c] })
                  }}
                />
              </div>
              {error && <p className="mb-3 text-sm text-[#FFC29A]">{error}</p>}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => send()}
                disabled={busy}
                className="w-full shrink-0 rounded-full py-4 text-base font-bold text-ink disabled:opacity-60"
                style={{ background: gradient(t, 90) }}
              >
                {busy ? '…' : 'Créer ma routine'}
              </motion.button>
            </>
          )}

          {phase === 'sent' && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <motion.div
                className="h-28 w-28"
                style={{ background: gradient(t) }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, borderRadius: SHAPES }}
                transition={{ scale: { type: 'spring', stiffness: 160, damping: 14 }, borderRadius: { duration: 9, repeat: Infinity } }}
              />
              <h1 className="font-display mt-8 text-[2.1rem] font-light leading-tight">C’est prêt !</h1>
              <p className="mt-3 max-w-xs text-base leading-relaxed text-white/55">
                Tes séances suivent maintenant ta fiche, avec tes durées et ton matériel. Ton coach pourra l’affiner.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={finish}
                className="mt-10 w-full rounded-full py-4 text-base font-bold text-ink"
                style={{ background: gradient(t, 90) }}
              >
                C’est parti
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && phase === 'questions' && <p className="mt-3 text-sm text-[#FFC29A]">{error}</p>}
    </div>
  )
}

