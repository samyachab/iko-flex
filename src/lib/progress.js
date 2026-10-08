// Progression automatique et invisible : le niveau (1 débutant, 2 intermédiaire, 3 avancé)
// dépend du nombre de séances validées de ce type, sans repartir de zéro pour un jour manqué.
// Seule une vraie pause (30 jours sans séance de ce type) remet le compteur à zéro.
import { getHistory } from './streaks.js'

const RESET_GAP_DAYS = 30
export const LEVEL_THRESHOLDS = [0, 10, 30] // séances validées pour atteindre le niveau 1, 2, 3

const parse = (k) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const daysBetween = (a, b) => Math.round((b - a) / 86400000)

export function experience(type, history = getHistory(), today = new Date()) {
  const dates = Object.keys(history)
    .filter((k) => history[k].includes(type))
    .sort()
    .map(parse)
  let xp = 0
  let prev = null
  for (const d of dates) {
    xp = prev && daysBetween(prev, d) >= RESET_GAP_DAYS ? 1 : xp + 1
    prev = d
  }
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (prev && daysBetween(prev, t) >= RESET_GAP_DAYS) xp = 0
  return xp
}

export function getLevel(type, history, today) {
  const xp = experience(type, history, today)
  return LEVEL_THRESHOLDS.filter((n) => xp >= n).length
}
