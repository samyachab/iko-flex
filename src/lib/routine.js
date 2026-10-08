import { EXERCISES } from '../data/exercises.js'
import { getSettings } from './settings.js'

export const ROUTINES = {
  souplesse: {
    key: 'souplesse',
    label: 'Routine Souplesse',
    emoji: '🔥',
    work: 45,
    sideWork: 45, // exercices unilatéraux : 45 s par côté minimum
    rest: 10,
    // Poids de chaque zone dans la séance : priorité psoas/hanches
    plan: { hanche: 3, posterieure: 2, epaules: 2, cheville: 2 },
    rounds: 1,
  },
  renfo: {
    key: 'renfo',
    label: 'Routine Renfo',
    emoji: '⚡',
    work: 50,
    sideWork: 30, // exercices unilatéraux : 30 s par côté
    rest: 10,
    // Circuit fait 2 fois
    plan: { tronc: 2, haut: 2, jambes: 2 },
    rounds: 2,
  },
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const enabledPool = (key, settings = getSettings()) =>
  EXERCISES.filter((e) => e.theme === key && !settings[key].disabled.includes(e.id))

const STEP = 15 // allongement par palier de 15 s
const SHORT = 12 // durée (min) à partir de laquelle on commence à allonger les exercices clés
const LONG = 30 // durée (min) où les exercices clés atteignent leur maximum

// Effort minimal / maximal d'un exercice (par côté si unilatéral)
// Sans dose définie (renfo) : durée de base, +10 s possibles quand la séance est longue
const doseOf = (ex, c) => ex.dose ?? (ex.unilateral ? [c.sideWork, c.sideWork + 10] : [c.work, c.work + 10])

// Durée totale d'un exercice dans la séance pour un effort donné : un côté = transition + effort
export const exerciseSeconds = (ex, c, work = doseOf(ex, c)[0]) => (ex.unilateral ? 2 * (c.rest + work) : c.rest + work)

// Ordre de remplissage des zones, proportionnel au plan :
// { hanche: 3, posterieure: 2, ... } -> hanche, posterieure, epaules, cheville, hanche, posterieure, ...
function slotOrder(plan) {
  const order = []
  const max = Math.max(...Object.values(plan))
  for (let i = 0; i < max; i++) for (const [g, n] of Object.entries(plan)) if (i < n) order.push(g)
  return order
}

// Tous les exercices actifs, dans l'ordre où on les ajoute à la séance :
// favori d'abord, puis tirage aléatoire équilibré entre les zones
function candidates(key, settings) {
  const config = ROUTINES[key]
  const pool = enabledPool(key, settings)
  const favorite = pool.find((e) => e.id === settings[key].favorite)
  const byGroup = {}
  for (const e of shuffle(pool)) if (e !== favorite) (byGroup[e.group] ??= []).push(e)
  const slots = slotOrder(config.plan)
  for (const g of Object.keys(byGroup)) if (!slots.includes(g)) slots.push(g)
  const out = favorite ? [favorite] : []
  for (let i = 0; out.length < pool.length && i < slots.length * pool.length; i++) {
    const next = byGroup[slots[i % slots.length]]?.shift()
    if (next) out.push(next)
  }
  return { list: out, favorite }
}

// Construit la séance pour la durée choisie :
// 1. les exercices clés (priority) sont déjà allongés selon la longueur de la séance (45 s à 12 min -> max à 30 min) ;
// 2. on ajoute des exercices tant que la durée le permet ;
// 3. le temps restant allonge les exercices qui gagnent à durer (clés d'abord), jusqu'à leur maximum ;
// 4. renfo : si tous les exercices sont pris et qu'il reste du temps, on fait un 3e tour.
export function buildRoutine(key, settings = getSettings()) {
  const config = ROUTINES[key]
  const target = settings[key].minutes * 60
  const { list, favorite } = candidates(key, settings)
  const k = Math.min(1, Math.max(0, (settings[key].minutes - SHORT) / (LONG - SHORT)))
  const work = new Map()
  const start = (ex) => {
    const [min, max] = doseOf(ex, config)
    return ex.priority ? Math.round((min + (max - min) * k) / STEP) * STEP : min
  }

  let rounds = config.rounds
  const picked = []
  let total = 0
  for (const ex of list) {
    const t = exerciseSeconds(ex, config, start(ex)) * rounds
    if (picked.length && total + t > target + 20) continue
    picked.push(ex)
    work.set(ex.id, start(ex))
    total += t
  }
  if (key === 'renfo' && picked.length === list.length && target - total >= total * 0.4) {
    total = (total / rounds) * 3
    rounds = 3
  }

  // Allongement par paliers, exercices clés puis maintiens statiques, tant qu'il reste du temps
  const extendable = [...picked].sort((a, b) => (b.priority ? 2 : 0) + (b.kind === 'static') - ((a.priority ? 2 : 0) + (a.kind === 'static')))
  let slack = target - total
  let grew = true
  while (grew) {
    grew = false
    for (const ex of extendable) {
      const inc = Math.min(STEP, doseOf(ex, config)[1] - work.get(ex.id))
      const cost = inc * (ex.unilateral ? 2 : 1) * rounds
      if (inc <= 0 || cost > slack + 10) continue
      work.set(ex.id, work.get(ex.id) + inc)
      slack -= cost
      grew = true
    }
  }

  // Ordre final : favori en premier, puis alternance des zones
  const groups = {}
  for (const e of picked) if (e !== favorite) (groups[e.group] ??= []).push(e)
  const circuit = favorite && picked.includes(favorite) ? [favorite] : []
  const lists = Object.values(groups)
  for (let i = 0; i < Math.max(0, ...lists.map((l) => l.length)); i++) {
    for (const l of shuffle(lists)) if (l[i]) circuit.push(l[i])
  }

  const exercises = []
  for (let r = 0; r < rounds; r++) exercises.push(...circuit)
  const totalSeconds = exercises.reduce((sum, ex) => sum + exerciseSeconds(ex, config, work.get(ex.id)), 0)
  return { ...config, rounds, exercises, doses: Object.fromEntries(work), totalSeconds }
}

// Aperçu (accueil, réglages) : moyenne de quelques tirages, la séance réelle varie légèrement
export function routineInfo(key, settings = getSettings()) {
  const runs = Array.from({ length: 5 }, () => buildRoutine(key, settings))
  const avg = (f) => Math.round(runs.reduce((s, r) => s + f(r), 0) / runs.length)
  return { minutes: avg((r) => r.totalSeconds / 60), count: avg((r) => r.exercises.length) }
}
