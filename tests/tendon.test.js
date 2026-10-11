import { describe, expect, it, vi } from 'vitest'
import { activePrograms, painAdvice, recordPain } from '../src/lib/tendon.js'

const NOW = new Date(2026, 5, 15, 12)
const DAY = 86400000
const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const weeksAgo = (w) => keyOf(new Date(NOW.getTime() - w * 7 * DAY))
const at = (date) => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(date)
}
const profile = (extra = {}) => ({ pain_points: ['tendinite_achille'], ...extra })
const phaseAt = (w, extra) => {
  at(NOW)
  return activePrograms(profile({ programs: { tendinite_achille: weeksAgo(w) }, ...extra }), ['tendinite_achille'])[0]
}

describe('programmes tendon', () => {
  it('ignore les conditions sans programme', () => {
    expect(activePrograms({}, ['hyperlordose', 'douleur_genou'])).toEqual([])
  })

  it('phase selon le temps : 2 semaines Calmer, 6 semaines Renforcer, puis Rebondir', () => {
    expect(phaseAt(0).phase.id).toBe('calmer')
    expect(phaseAt(1).phase.id).toBe('calmer')
    expect(phaseAt(2).phase.id).toBe('renforcer')
    expect(phaseAt(7).phase.id).toBe('renforcer')
    expect(phaseAt(8).phase.id).toBe('rebondir')
    expect(phaseAt(52).phase.id).toBe('rebondir')
  })

  it('sans date sur la fiche : départ le premier jour vu, gardé sur l’appareil', () => {
    at(NOW)
    const first = activePrograms(profile(), ['tendinite_achille'])[0]
    expect(first.index).toBe(0)
    at(new Date(NOW.getTime() + 3 * 7 * DAY))
    const later = activePrograms(profile(), ['tendinite_achille'])[0]
    expect(later.start).toBe(first.start)
    expect(later.phase.id).toBe('renforcer')
  })

  it('douleur ≥ 5/10 à la dernière séance : retour en phase Calmer', () => {
    at(NOW)
    recordPain('tendinite_achille', 6)
    expect(phaseAt(10).phase.id).toBe('calmer')
    recordPain('tendinite_achille', 2) // même jour : remplace la note précédente
    expect(phaseAt(10).phase.id).toBe('rebondir')
  })

  it('douleur 4/10 : pas de retour en arrière', () => {
    at(NOW)
    recordPain('tendinite_achille', 4)
    expect(phaseAt(3).phase.id).toBe('renforcer')
  })

  it('le coach peut fixer la phase, bornée aux phases existantes', () => {
    expect(phaseAt(0, { rules: { tendon_phase: { tendinite_achille: 2 } } }).phase.id).toBe('rebondir')
    expect(phaseAt(10, { rules: { tendon_phase: { tendinite_achille: 0 } } }).phase.id).toBe('calmer')
    expect(phaseAt(0, { rules: { tendon_phase: { tendinite_achille: 9 } } }).phase.id).toBe('rebondir')
  })

  it('le carnet garde 60 notes au plus', () => {
    for (let i = 0; i < 70; i++) {
      at(new Date(2026, 0, 1 + i, 12))
      recordPain('tendinite_achille', 1)
    }
    expect(JSON.parse(localStorage.getItem('iko-flex:tendon')).tendinite_achille.pains).toHaveLength(60)
  })

  it('conseil selon la douleur', () => {
    expect(painAdvice(2)).toMatch(/bonne zone/)
    expect(painAdvice(3)).toMatch(/bonne zone/)
    expect(painAdvice(4)).toMatch(/même charge/)
    expect(painAdvice(5)).toMatch(/kiné/)
  })
})
