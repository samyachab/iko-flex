// Mémoire de ce qui a été travaillé (sur l'appareil) pour faire tourner les zones et les exercices
// d'une séance à l'autre : une zone ou un exercice pas fait depuis longtemps repasse devant.
// Format : { souplesse: { zones: { posterieure: 'YYYY-MM-DD' }, exercises: { 'pigeon': 'YYYY-MM-DD' } }, renfo: {...} }
const KEY = 'iko-flex:rotation'
const NEVER = 14 // jours : plafond, et valeur donnée à ce qui n'a jamais été fait

const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export function daysSince(dateKey) {
  if (!dateKey) return NEVER
  const [y, m, d] = dateKey.split('-').map(Number)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.min(NEVER, Math.round((today - new Date(y, m - 1, d)) / 86400000))
}

export function getRotation(key) {
  const r = load()[key] ?? {}
  return { zones: r.zones ?? {}, exercises: r.exercises ?? {} }
}

// À appeler quand une séance est validée : zones et exercices faits aujourd'hui
export function recordSession(key, exercises) {
  const all = load()
  const r = (all[key] ??= { zones: {}, exercises: {} })
  r.zones ??= {}
  r.exercises ??= {}
  const today = dayKey()
  for (const ex of exercises) {
    r.zones[ex.group] = today
    r.exercises[ex.id] = today
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // stockage indisponible : pas de rotation, le tirage reste équilibré
  }
}
