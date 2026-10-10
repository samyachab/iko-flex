// Historique des séances validées, stocké en LocalStorage.
// Format v2 : { v: 2, days: { 'YYYY-MM-DD': ['souplesse', 'renfo'] } }
// Les séries (actuelle + record) sont recalculées depuis l'historique.
const KEY = 'iko-flex:streaks'
const TYPES = ['souplesse', 'renfo']

const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const shift = (d, n) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() + n)
  return x
}

const parse = (k) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// v1 ne gardait que { count, last } par type : on recrée les jours correspondants.
function migrate(old) {
  const days = {}
  for (const type of TYPES) {
    const s = old?.[type]
    if (!s?.last) continue
    for (let n = 0; n < s.count; n++) {
      const k = dayKey(shift(parse(s.last), -n))
      days[k] = [...new Set([...(days[k] ?? []), type])]
    }
  }
  return { v: 2, days }
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    if (!raw) return { v: 2, days: {} }
    return raw.v === 2 ? raw : migrate(raw)
  } catch {
    return { v: 2, days: {} }
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // stockage indisponible : la séance reste validée à l'écran
  }
}

function stats(days, type) {
  const has = (d) => days[dayKey(d)]?.includes(type)
  const today = new Date()

  // Série vivante : se termine aujourd'hui, ou hier si pas encore faite aujourd'hui.
  let d = has(today) ? today : shift(today, -1)
  let count = 0
  while (has(d)) {
    count++
    d = shift(d, -1)
  }

  let best = 0
  let run = 0
  let prev = null
  for (const k of Object.keys(days).filter((k) => days[k].includes(type)).sort()) {
    const cur = parse(k)
    run = prev && Math.round((cur - prev) / 86400000) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = cur
  }

  return { count, best, doneToday: Boolean(has(today)) }
}

export function getStreaks() {
  const { days } = load()
  return Object.fromEntries(TYPES.map((t) => [t, stats(days, t)]))
}

// 4 semaines alignées du lundi au dimanche, la semaine en cours en dernier.
export function getCalendar(weeks = 4) {
  const { days } = load()
  const today = new Date()
  const monday = shift(today, -((today.getDay() + 6) % 7))
  const start = shift(monday, -7 * (weeks - 1))
  const todayKey = dayKey(today)
  return Array.from({ length: weeks * 7 }, (_, n) => {
    const k = dayKey(shift(start, n))
    return { key: k, types: days[k] ?? [], isToday: k === todayKey, isFuture: k > todayKey }
  })
}

export function completeSession(type) {
  const data = load()
  const k = dayKey()
  data.days[k] = [...new Set([...(data.days[k] ?? []), type])]
  save(data)
  return stats(data.days, type).count
}

// Demande au navigateur de ne pas purger les données en cas de manque de place.
export function requestPersistence() {
  navigator.storage?.persist?.().catch(() => {})
}

// Ajoute des jours venus du coffre-fort (autre appareil) : { 'YYYY-MM-DD': ['souplesse'] }
export function mergeHistory(days) {
  const data = load()
  for (const [k, types] of Object.entries(days)) data.days[k] = [...new Set([...(data.days[k] ?? []), ...types])]
  save(data)
}

// Historique brut (jours -> types de séances validées), pour la progression automatique
export function getHistory() {
  return load().days
}
