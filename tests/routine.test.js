// Générateur de séances : propriétés vérifiées sur de nombreux tirages (le tirage est aléatoire),
// pour chaque profil public, chaque durée proposée et les deux routines.
import { describe, expect, it } from 'vitest'
import { buildRoutine, buildTendonRoutine, exerciseSeconds } from '../src/lib/routine.js'
import { assess, resolveProfile } from '../src/lib/profile.js'
import { DURATIONS, getSettings } from '../src/lib/settings.js'
import { PROFILES } from '../src/data/profiles.js'

const RUNS = 15
const settingsWith = (key, patch) => {
  const s = getSettings()
  return { ...s, ...patch.root, [key]: { ...s[key], ...patch[key] } }
}

describe.each(['souplesse', 'renfo'])('routine %s', (key) => {
  describe.each(Object.keys(PROFILES))('profil %s', (pid) => {
    const rules = resolveProfile(PROFILES[pid])

    it.each(DURATIONS[key])('%i min : exercices permis, sans doublon, durée tenue', (minutes) => {
      const settings = settingsWith(key, { [key]: { minutes } })
      for (let i = 0; i < RUNS; i++) {
        const r = buildRoutine(key, settings, rules)
        const ids = r.exercises.map((e) => e.id)
        expect(new Set(ids).size).toBe(ids.length)
        expect(r.exercises.length).toBeGreaterThan(0)
        for (const ex of r.exercises) {
          expect(ex.theme).toBe(key)
          expect(assess(ex, rules).allowed, `${ex.id} interdit pour ${pid}`).toBe(true)
          const plan = r.plans[ex.id]
          expect(plan, ex.id).toBeDefined()
          if (!ex.prog) {
            expect(plan.work).toBeGreaterThanOrEqual(ex.dose[0])
            expect(plan.work).toBeLessThanOrEqual(ex.dose[1])
          }
        }
        // Jamais plus long que demandé (marge d'un palier), jamais vide de sens
        expect(r.totalSeconds).toBeLessThanOrEqual(minutes * 60 + 60)
        const sum = r.exercises.reduce((s, ex) => s + exerciseSeconds(ex, r, r.plans[ex.id]), 0)
        expect(r.totalSeconds).toBe(sum)
      }
    })
  })

  it('séance de 12 min : au moins 80 % du temps rempli (profil général)', () => {
    const rules = resolveProfile(PROFILES.general)
    for (let i = 0; i < RUNS; i++) {
      const r = buildRoutine(key, getSettings(), rules)
      expect(r.totalSeconds).toBeGreaterThanOrEqual(12 * 60 * 0.8)
    }
  })

  it('favoris toujours présents, exercices désactivés jamais', () => {
    const rules = resolveProfile(PROFILES.general)
    const first = buildRoutine(key, getSettings(), rules).exercises
    const favorites = first.slice(0, 2).map((e) => e.id)
    const disabled = [first[2].id]
    const settings = settingsWith(key, { [key]: { favorites, disabled } })
    for (let i = 0; i < RUNS; i++) {
      const ids = buildRoutine(key, settings, rules).exercises.map((e) => e.id)
      for (const f of favorites) expect(ids).toContain(f)
      expect(ids).not.toContain(disabled[0])
    }
  })

  it('matériel absent : les exercices qui en ont besoin sortent', () => {
    const rules = resolveProfile(PROFILES.general)
    const missing = ['kettlebell', 'halteres', 'elastique', 'rouleau', 'plots', 'support']
    const settings = settingsWith(key, { root: { missing } })
    for (let i = 0; i < RUNS; i++) {
      for (const ex of buildRoutine(key, settings, rules).exercises) expect(ex.equip ?? [], ex.id).toEqual([])
    }
  })

  it('exercices clés allongés quand la séance est longue', () => {
    if (key !== 'souplesse') return
    const keyId = 'couch-stretch'
    const rules = resolveProfile({ ...PROFILES.general, keys: [keyId] })
    const plan = (minutes) =>
      buildRoutine(key, settingsWith(key, { [key]: { minutes, favorites: [keyId] } }), rules).plans[keyId].work
    expect(plan(30)).toBeGreaterThan(plan(8))
  })
})

describe('niveau du renfo', () => {
  it('niveau choisi : séries et répétitions du niveau', () => {
    const rules = resolveProfile(PROFILES.general)
    for (const level of [1, 2, 3]) {
      const r = buildRoutine('renfo', settingsWith('renfo', { renfo: { level } }), rules)
      expect(r.level).toBe(level)
      for (const ex of r.exercises) {
        const [sets, amount] = ex.prog.levels[level - 1]
        expect(r.plans[ex.id].amount).toBe(amount)
        expect(r.plans[ex.id].baseSets).toBe(sets)
        expect(r.plans[ex.id].sets - sets).toBeLessThanOrEqual(1) // +1 série au plus avec le temps restant
      }
    }
  })

  it('niveau auto : 1 sans historique', () => {
    expect(buildRoutine('renfo', getSettings(), resolveProfile(PROFILES.general)).level).toBe(1)
  })
})

describe('focus tendon (proposé avant le renfo)', () => {
  it('2 exercices programmés par tendon au plus, dosage de la phase', () => {
    const rules = resolveProfile({ ...PROFILES.general, pain_points: ['tendinite_achille', 'tendinite_rotulienne'] })
    const r = buildTendonRoutine(getSettings(), rules)
    expect(r.tendon).toHaveLength(2)
    expect(r.exercises.length).toBeGreaterThan(0)
    expect(r.exercises.length).toBeLessThanOrEqual(4)
    for (const ex of r.exercises) {
      expect(ex.prog).toBeDefined()
      expect(assess(ex, rules).allowed).toBe(true)
      expect(r.notes[ex.id][0]).toMatch(/^Pour ton /)
    }
    // Phase Calmer : maintiens 4 x 45 s
    const iso = r.exercises.find((e) => e.id === 'spanish-squat')
    if (iso) expect(r.plans[iso.id]).toMatchObject({ sets: 4, amount: 45 })
  })

  it('sans zone de tendon : focus vide', () => {
    const r = buildTendonRoutine(getSettings(), resolveProfile(PROFILES.general))
    expect(r.exercises).toEqual([])
  })

  it('séance prévue : pas de question de ressenti tendon', () => {
    const rules = resolveProfile({ ...PROFILES.general, pain_points: ['tendinite_achille'] })
    expect(buildRoutine('renfo', getSettings(), rules).tendon).toBeUndefined()
  })
})
