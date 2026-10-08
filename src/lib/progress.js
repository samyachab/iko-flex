// Progression automatique : le niveau (1 facile, 2 moyen, 3 dur) dépend des séances validées de ce type.
// Un jour manqué ne coûte rien. Une vraie pause fait perdre de l'acquis progressivement (désentraînement) :
// au-delà d'une semaine sans séance, -0,5 séance d'expérience par jour d'arrêt. Jamais de remise à zéro brutale.
import { getHistory } from './streaks.js'

const FREE_GAP_DAYS = 7
const DECAY_PER_DAY = 0.5
export const LEVEL_THRESHOLDS = [0, 10, 30] // expérience pour atteindre le niveau 1, 2, 3
export const LEVEL_LABELS = { 1: 'Facile', 2: 'Moyen', 3: 'Dur' }

const parse = (k) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const daysBetween = (a, b) => Math.round((b - a) / 86400000)
const decay = (gap) => Math.max(0, gap - FREE_GAP_DAYS) * DECAY_PER_DAY

export function experience(type, history = getHistory(), today = new Date()) {
  const dates = Object.keys(history)
    .filter((k) => history[k].includes(type))
    .sort()
    .map(parse)
  let xp = 0
  let prev = null
  for (const d of dates) {
    if (prev) xp = Math.max(0, xp - decay(daysBetween(prev, d)))
    xp += 1
    prev = d
  }
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (prev) xp = Math.max(0, xp - decay(daysBetween(prev, t)))
  return Math.round(xp * 10) / 10
}

export function getLevel(type, history, today) {
  const xp = experience(type, history, today)
  return LEVEL_THRESHOLDS.filter((n) => xp >= n).length
}
