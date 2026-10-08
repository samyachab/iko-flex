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

// Durée d'un exercice dans la séance : un côté = un exercice à part entière (transition + effort)
export const exerciseSeconds = (ex, c) => (ex.unilateral ? 2 * (c.rest + c.sideWork) : c.rest + c.work)

// Nombre d'exercices différents (taille du circuit) pour la durée choisie,
// estimé avec la durée moyenne des exercices actifs (les unilatéraux comptent double)
export function routineInfo(key, settings = getSettings()) {
  const c = ROUTINES[key]
  const pool = enabledPool(key, settings)
  const avg = pool.reduce((s, e) => s + exerciseSeconds(e, c), 0) / Math.max(1, pool.length)
  const size = Math.max(1, Math.min(pool.length, Math.round((settings[key].minutes * 60) / (avg * c.rounds))))
  return { size, count: size * c.rounds, minutes: Math.round((size * avg * c.rounds) / 60) }
}

// Ordre de remplissage des zones, proportionnel au plan :
// { hanche: 3, posterieure: 2, ... } -> hanche, posterieure, epaules, cheville, hanche, posterieure, ...
function slotOrder(plan) {
  const order = []
  const max = Math.max(...Object.values(plan))
  for (let i = 0; i < max; i++) for (const [g, n] of Object.entries(plan)) if (i < n) order.push(g)
  return order
}

// Pioche aléatoire équilibrée par zone, exercice favori toujours inclus (en premier),
// puis alternance des zones pour éviter d'enchaîner deux fois la même.
export function buildRoutine(key, settings = getSettings()) {
  const config = ROUTINES[key]
  const { size } = routineInfo(key, settings)
  const pool = enabledPool(key, settings)
  const favorite = pool.find((e) => e.id === settings[key].favorite)

  const byGroup = {}
  for (const e of shuffle(pool)) if (e !== favorite) (byGroup[e.group] ??= []).push(e)

  const picked = favorite ? [favorite] : []
  const slots = slotOrder(config.plan)
  if (favorite) slots.splice(slots.indexOf(favorite.group), 1)
  // Zones absentes du plan (exercices ajoutés plus tard) : en fin de rotation
  for (const g of Object.keys(byGroup)) if (!slots.includes(g)) slots.push(g)
  for (let i = 0; picked.length < size && i < slots.length * size; i++) {
    const next = byGroup[slots[i % slots.length]]?.shift()
    if (next) picked.push(next)
  }

  const rest = picked.slice(favorite ? 1 : 0)
  const groups = {}
  for (const e of rest) (groups[e.group] ??= []).push(e)
  const circuit = favorite ? [favorite] : []
  const lists = Object.values(groups)
  for (let i = 0; i < Math.max(0, ...lists.map((l) => l.length)); i++) {
    for (const l of shuffle(lists)) if (l[i]) circuit.push(l[i])
  }

  const exercises = []
  for (let r = 0; r < config.rounds; r++) exercises.push(...circuit)
  return { ...config, exercises }
}
