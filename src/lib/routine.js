import { EXERCISES } from '../data/exercises.js'
import { getSettings } from './settings.js'
import { getLevel } from './progress.js'

export const ROUTINES = {
  souplesse: {
    key: 'souplesse',
    label: 'Routine Souplesse',
    emoji: '🔥',
    work: 45,
    sideWork: 45, // exercices unilatéraux : 45 s par côté minimum
    rest: 10,
    // Poids de chaque zone dans la séance : priorité psoas/hanches
    plan: { hanche: 3, posterieure: 2, epaules: 2, cheville: 2, dos: 1, roller: 1 },
    // Chaque séance touche au moins un exercice par zone ; si le temps manque, zones prises dans cet ordre
    coverage: ['posterieure', 'epaules', 'hanche', 'cheville', 'dos', 'roller'],
    rounds: 1,
  },
  renfo: {
    key: 'renfo',
    label: 'Routine Renfo',
    emoji: '⚡',
    work: 50,
    sideWork: 30, // secours pour un exercice renfo sans programmation (prog)
    rest: 10,
    // Séries par exercice (voir prog dans exercises.js), un exercice après l'autre
    plan: { tronc: 2, haut: 2, jambes: 2, cheville: 1, plio: 1 },
    coverage: ['tronc', 'jambes', 'haut', 'cheville', 'plio'],
    rounds: 1,
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

// Effort minimal / maximal d'un exercice au temps (par côté si unilatéral)
const doseOf = (ex, c) => ex.dose ?? (ex.unilateral ? [c.sideWork, c.sideWork + 10] : [c.work, c.work + 10])

// Durée d'une série d'un exercice programmé (prog) : répétitions x tempo, ou secondes
export const setSeconds = (ex, amount) =>
  ex.prog.measure === 'time' ? amount : amount * ex.prog.tempo.reduce((s, [, sec]) => s + sec, 0)

// Durée totale d'un exercice dans la séance. plan = { work } (au temps) ou { sets, amount } (programmé).
// Un côté = transition + effort ; entre deux séries : récupération de l'exercice.
export function exerciseSeconds(ex, c, plan) {
  if (ex.prog) {
    const sides = ex.unilateral ? 2 : 1
    const set = setSeconds(ex, plan.amount)
    return c.rest + plan.sets * sides * set + plan.sets * (sides - 1) * c.rest + (plan.sets - 1) * ex.prog.rest
  }
  const work = plan?.work ?? doseOf(ex, c)[0]
  return ex.unilateral ? 2 * (c.rest + work) : c.rest + work
}

// Ordre de remplissage des zones, proportionnel au plan :
// { hanche: 3, posterieure: 2, ... } -> hanche, posterieure, epaules, cheville, hanche, posterieure, ...
function slotOrder(plan) {
  const order = []
  const max = Math.max(...Object.values(plan))
  for (let i = 0; i < max; i++) for (const [g, n] of Object.entries(plan)) if (i < n) order.push(g)
  return order
}

// Exercices actifs mélangés et rangés par zone, + favori à part
function candidates(key, settings) {
  const pool = enabledPool(key, settings)
  const favorite = pool.find((e) => e.id === settings[key].favorite)
  const byGroup = {}
  for (const e of shuffle(pool)) if (e !== favorite) (byGroup[e.group] ??= []).push(e)
  return { byGroup, favorite }
}

// Construit la séance pour la durée choisie :
// 1. les exercices clés (priority) sont déjà allongés selon la longueur de la séance (45 s à 12 min -> max à 30 min) ;
// 2. favori, puis un exercice par zone dans l'ordre de couverture (le plus court qui rentre si besoin),
//    puis on complète en alternant les zones tant que la durée le permet ;
// 3. le temps restant allonge les exercices qui gagnent à durer (clés d'abord), jusqu'à leur maximum ;
// 4. renfo : si tous les exercices sont pris et qu'il reste du temps, on fait un 3e tour.
export function buildRoutine(key, settings = getSettings()) {
  const config = ROUTINES[key]
  const target = settings[key].minutes * 60
  const chosen = settings[key].level
  const level = chosen && chosen !== 'auto' ? chosen : getLevel(key)
  const { byGroup, favorite } = candidates(key, settings)
  const k = Math.min(1, Math.max(0, (settings[key].minutes - SHORT) / (LONG - SHORT)))
  const plans = new Map()
  const start = (ex) => {
    if (ex.prog) {
      const [sets, amount] = ex.prog.levels[level - 1]
      return { sets, amount, baseSets: sets }
    }
    const [min, max] = doseOf(ex, config)
    return { work: ex.priority ? Math.round((min + (max - min) * k) / STEP) * STEP : min }
  }

  const picked = []
  let total = 0
  const tryAdd = (ex) => {
    const plan = start(ex)
    const t = exerciseSeconds(ex, config, plan)
    if (picked.length && total + t > target + 20) return false
    picked.push(ex)
    plans.set(ex.id, plan)
    total += t
    return true
  }
  const take = (group, ex) => byGroup[group].splice(byGroup[group].indexOf(ex), 1)

  if (favorite) tryAdd(favorite)
  // Couverture : au moins une zone de chaque, les plus importantes d'abord si la séance est courte
  for (const g of config.coverage) {
    if (favorite?.group === g || !byGroup[g]?.length) continue
    const ex = byGroup[g].find(tryAdd)
    if (ex) take(g, ex)
  }
  // Complément : alternance des zones selon leur poids dans le plan
  const slots = slotOrder(config.plan)
  for (const g of Object.keys(byGroup)) if (!slots.includes(g)) slots.push(g)
  const left = () => Object.values(byGroup).reduce((n, l) => n + l.length, 0)
  for (let i = 0, misses = 0; left() && misses < slots.length; i++) {
    const g = slots[i % slots.length]
    const ex = byGroup[g]?.find(tryAdd)
    if (ex) {
      take(g, ex)
      misses = 0
    } else misses++
  }

  // Temps restant : étirements clés puis maintiens allongés par paliers ; exercices programmés : +1 série max
  const weight = (e) => (e.priority ? 2 : 0) + (e.kind === 'static' ? 1 : 0)
  const extendable = [...picked].sort((a, b) => weight(b) - weight(a))
  let slack = target - total
  let grew = true
  while (grew) {
    grew = false
    for (const ex of extendable) {
      const plan = plans.get(ex.id)
      let next
      if (ex.prog) {
        if (plan.sets > plan.baseSets) continue
        next = { ...plan, sets: plan.sets + 1 }
      } else {
        const inc = Math.min(STEP, doseOf(ex, config)[1] - plan.work)
        if (inc <= 0) continue
        next = { work: plan.work + inc }
      }
      const cost = exerciseSeconds(ex, config, next) - exerciseSeconds(ex, config, plan)
      if (cost > slack + 10) continue
      plans.set(ex.id, next)
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
  for (let r = 0; r < config.rounds; r++) exercises.push(...circuit)
  const totalSeconds = exercises.reduce((sum, ex) => sum + exerciseSeconds(ex, config, plans.get(ex.id)), 0)
  return { ...config, level, exercises, plans: Object.fromEntries(plans), totalSeconds }
}

// Aperçu (accueil, réglages) : moyenne de quelques tirages, la séance réelle varie légèrement
export function routineInfo(key, settings = getSettings()) {
  const runs = Array.from({ length: 5 }, () => buildRoutine(key, settings))
  const avg = (f) => Math.round(runs.reduce((s, r) => s + f(r), 0) / runs.length)
  return { minutes: avg((r) => r.totalSeconds / 60), count: avg((r) => r.exercises.length) }
}
