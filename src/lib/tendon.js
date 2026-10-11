// Suivi des programmes tendon : phase en cours (selon le temps écoulé et la douleur) et carnet de douleur.
// Stocké sur l'appareil. Date de départ : celle de la fiche (profile.programs), sinon le premier jour où
// l'appli a vu la douleur.
import { TENDON_PROGRAMS } from '../data/tendons.js'

const KEY = 'iko-flex:tendon'
const HIGH_PAIN = 5 // à partir de 5/10 après une séance : retour en phase « Calmer »

const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}
function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // stockage indisponible : le programme repart de la phase 1
  }
}

const weeksSince = (start) => {
  const [y, m, d] = start.split('-').map(Number)
  return Math.max(0, Math.floor((Date.now() - new Date(y, m - 1, d)) / (7 * 86400000)))
}

// Programmes actifs pour une fiche : un par douleur de tendon
export function activePrograms(profile, conditions) {
  const store = load()
  let changed = false
  const list = []
  for (const cond of conditions) {
    const program = TENDON_PROGRAMS[cond]
    if (!program) continue
    const entry = (store[cond] ??= {})
    const start = profile.programs?.[cond] ?? (entry.start ??= ((changed = true), dayKey()))
    const week = weeksSince(start)
    // Phase selon le temps : 2 semaines pour calmer, 6 pour renforcer, puis rebondir
    let index = 0
    let acc = 0
    for (let k = 0; k < program.phases.length; k++) {
      const w = program.phases[k].weeks
      if (w == null || week < acc + w) {
        index = k
        break
      }
      acc += w
      index = k + 1
    }
    index = Math.min(index, program.phases.length - 1)
    // Douleur forte à la dernière séance : on revient aux maintiens qui calment
    const lastPain = entry.pains?.at(-1)?.value
    if (lastPain != null && lastPain >= HIGH_PAIN) index = 0
    // Le coach peut fixer la phase (rules.tendon_phase = { condition: 0 | 1 | 2 })
    const forced = profile.rules?.tendon_phase?.[cond]
    if (forced != null) index = Math.min(Math.max(0, forced), program.phases.length - 1)
    list.push({ cond, program, index, phase: program.phases[index], week, start, lastPain })
  }
  if (changed) save(store)
  return list
}

// Douleur ressentie après une séance tendon (0 à 10)
export function recordPain(cond, value) {
  const store = load()
  const entry = (store[cond] ??= {})
  entry.pains = [...(entry.pains ?? []).filter((p) => p.day !== dayKey()), { day: dayKey(), value }].slice(-60)
  save(store)
}

export const painAdvice = (value) =>
  value >= HIGH_PAIN
    ? 'Douleur haute : on revient aux maintiens qui calment. Si ça ne baisse pas d’ici quelques jours, montre-le à un kiné.'
    : value > 3
      ? 'Un peu trop : garde la même charge la prochaine fois, sans forcer.'
      : 'Parfait, c’est la bonne zone. Vérifie demain matin que ce n’est pas pire.'
