import { EXERCISES } from '../data/exercises.js'

export const ROUTINES = {
  souplesse: {
    key: 'souplesse',
    label: 'Routine Souplesse',
    emoji: '🔥',
    work: 45,
    rest: 10,
    // 9 exos × 45s + 9 transitions × 10s ≈ 8 min — priorité psoas/hanches
    plan: { hanche: 3, posterieure: 2, epaules: 2, cheville: 2 },
    rounds: 1,
  },
  renfo: {
    key: 'renfo',
    label: 'Routine Renfo',
    emoji: '⚡',
    work: 50,
    rest: 10,
    // Circuit de 6 exos × 2 tours = 12 × 50s + 12 × 10s = 12 min
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

// Pioche aléatoire équilibrée par sous-groupe, puis alterne les groupes
// pour éviter d'enchaîner deux fois la même zone.
export function buildRoutine(key) {
  const config = ROUTINES[key]
  const picks = Object.entries(config.plan).map(([group, count]) =>
    shuffle(EXERCISES.filter((e) => e.theme === key && e.group === group)).slice(0, count),
  )

  const circuit = []
  const maxLen = Math.max(...picks.map((p) => p.length))
  for (let i = 0; i < maxLen; i++) {
    for (const p of shuffle(picks)) if (p[i]) circuit.push(p[i])
  }

  const exercises = []
  for (let r = 0; r < config.rounds; r++) exercises.push(...circuit)

  return { ...config, exercises }
}

export const routineSeconds = (key) => {
  const c = ROUTINES[key]
  const n = Object.values(c.plan).reduce((s, v) => s + v, 0) * c.rounds
  return n * (c.work + c.rest)
}
