import { describe, expect, it, vi } from 'vitest'
import { assess, needsFor, profileReport, resolveProfile } from '../src/lib/profile.js'
import { EXERCISES } from '../src/data/exercises.js'
import { PROFILES } from '../src/data/profiles.js'

const home = EXERCISES.filter((e) => e.theme === 'souplesse' || e.theme === 'renfo')
const byId = (id) => EXERCISES.find((e) => e.id === id)
const person = (extra = {}) => ({ id: 't', sport: 'aucun', posture_issues: [], pain_points: [], keys: [], rules: {}, ...extra })
const withMechanic = (m) => home.filter((e) => e.biomechanics.includes(m))

describe('filtre du profil', () => {
  it('profil général : toute la bibliothèque, sans consigne en plus', () => {
    const rules = resolveProfile(PROFILES.general)
    for (const ex of home) {
      const v = assess(ex, rules)
      expect(v.allowed, ex.id).toBe(true)
      expect(v.notes).toEqual([])
    }
  })

  it('une mécanique à éviter retire tous ses exercices', () => {
    const rules = resolveProfile(person({ pain_points: ['douleur_genou'] }))
    const risky = [...withMechanic('impact'), ...withMechanic('flexion_genou_profonde')]
    expect(risky.length).toBeGreaterThan(0)
    for (const ex of risky) expect(assess(ex, rules).allowed, ex.id).toBe(false)
  })

  it('contre-indication explicite', () => {
    const rules = resolveProfile(person({ pain_points: ['douleur_epaule'] }))
    const v = assess(byId('passages-baton'), rules)
    expect(v.allowed).toBe(false)
    expect(v.blockedBy.join()).toMatch(/contre-indiqué/)
  })

  it('exercice précis écarté (avoidIds)', () => {
    const rules = resolveProfile(person({ pain_points: ['achille_insertion'] }))
    expect(assess(byId('soleaire'), rules).allowed).toBe(false)
  })

  it('consignes adaptées à la condition', () => {
    const rules = resolveProfile(person({ pain_points: ['douleur_genou'] }))
    const ex = withMechanic('appui_genou').find((e) => assess(e, rules).allowed)
    expect(assess(ex, rules).notes).toContain('Pour toi : mets un coussin sous le genou.')
  })

  it('le coach passe avant les conditions : include, exclude, replace_by, warning', () => {
    const pogo = byId('pogo')
    const rules = resolveProfile(
      person({
        pain_points: ['douleur_genou'],
        rules: {
          overrides: {
            pogo: { include: true, warning: 'Mot du coach' },
            deadbug: { exclude: true },
            'fentes-bulgares': { replace_by: 'fente-iso' },
          },
        },
      }),
    )
    const v = assess(pogo, rules)
    expect(v.allowed).toBe(true)
    expect(v.forced).toBe(true)
    expect(v.notes[0]).toBe('Mot du coach')
    expect(assess(byId('deadbug'), rules).allowed).toBe(false)
    expect(assess(byId('fentes-bulgares'), rules).allowed).toBe(false)
    expect(assess(byId('fente-iso'), rules).score).toBeGreaterThanOrEqual(4)
  })

  it('mécanique exclue par le coach', () => {
    const rules = resolveProfile(person({ rules: { exclude_tags: ['appui_poignet'] } }))
    for (const ex of withMechanic('appui_poignet')) expect(assess(ex, rules).allowed, ex.id).toBe(false)
  })

  it('sport et conditions favorisent leurs mécaniques', () => {
    const rules = resolveProfile(person({ sport: 'course' }))
    const ex = withMechanic('dorsiflexion')[0]
    expect(assess(ex, rules).score).toBeGreaterThan(0)
  })

  it('besoins : la fréquence la plus haute gagne', () => {
    const rules = resolveProfile(person({ pain_points: ['tendinite_achille'], rules: { force_include: { mollet_renfo: 3 } } }))
    expect(rules.needs.get('mollet_renfo')).toBe(1)
  })

  it('un besoin ne s’applique qu’à la routine où sa mécanique est bien représentée', () => {
    const rules = resolveProfile(person({ pain_points: ['tendinite_achille'] }))
    expect(needsFor('renfo', rules)).toContain('mollet_renfo')
  })

  it('programme tendon en phase Rebondir : les impacts reviennent', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 5, 15, 12))
    const early = resolveProfile(person({ pain_points: ['tendinite_achille'], programs: { tendinite_achille: '2026-06-10' } }))
    expect(assess(byId('pogo'), early).allowed).toBe(false)
    const late = resolveProfile(person({ pain_points: ['tendinite_achille'], programs: { tendinite_achille: '2026-03-01' } }))
    expect(late.programs[0].phase.id).toBe('rebondir')
    expect(assess(byId('pogo'), late).allowed).toBe(true)
  })

  it('exercices de la phase en cours : listés pour le focus tendon (la séance prévue reste inchangée)', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 5, 15, 12))
    const rules = resolveProfile(person({ pain_points: ['tendinite_achille'], programs: { tendinite_achille: '2026-06-10' } }))
    expect(rules.tendonIds.has('mollet-iso')).toBe(true)
    expect(rules.programs[0].phase.id).toBe('calmer')
  })

  it('douleurs à montrer à un professionnel signalées au coach', () => {
    const report = profileReport(resolveProfile(person({ pain_points: ['sciatique'] })))
    expect(report.refer.length).toBe(1)
    expect(report.blocked.length).toBeGreaterThan(0)
  })
})
