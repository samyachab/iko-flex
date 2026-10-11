import { describe, expect, it } from 'vitest'
import { experience, getLevel } from '../src/lib/progress.js'

// n séances de souplesse, une par jour à partir du 1er janvier 2026
const daily = (n, start = new Date(2026, 0, 1)) => {
  const h = {}
  for (let i = 0; i < n; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    h[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`] = ['souplesse']
  }
  return h
}

describe('progression automatique', () => {
  it('une séance validée = 1 point, seul le type demandé compte', () => {
    const h = { '2026-01-01': ['souplesse'], '2026-01-02': ['renfo'], '2026-01-03': ['souplesse', 'renfo'] }
    const today = new Date(2026, 0, 3)
    expect(experience('souplesse', h, today)).toBe(2)
    expect(experience('renfo', h, today)).toBe(2)
  })

  it('niveau 1 au départ, 2 à 10 séances, 3 à 30', () => {
    expect(getLevel('souplesse', {}, new Date(2026, 0, 1))).toBe(1)
    expect(getLevel('souplesse', daily(9), new Date(2026, 0, 9))).toBe(1)
    expect(getLevel('souplesse', daily(10), new Date(2026, 0, 10))).toBe(2)
    expect(getLevel('souplesse', daily(29), new Date(2026, 0, 29))).toBe(2)
    expect(getLevel('souplesse', daily(30), new Date(2026, 0, 30))).toBe(3)
  })

  it('jusqu’à 7 jours sans séance : rien n’est perdu', () => {
    expect(experience('souplesse', daily(12), new Date(2026, 0, 12 + 7))).toBe(12)
  })

  it('au-delà de 7 jours : -0,5 par jour d’arrêt', () => {
    // dernière séance le 12, aujourd'hui le 29 : 17 jours, 10 au-delà de la franchise -> -5
    expect(experience('souplesse', daily(12), new Date(2026, 0, 29))).toBe(7)
  })

  it('la perte s’applique aussi entre deux séances', () => {
    const h = { ...daily(12), '2026-01-29': ['souplesse'] }
    expect(experience('souplesse', h, new Date(2026, 0, 29))).toBe(8)
  })

  it('jamais en dessous de zéro, même après des mois', () => {
    expect(experience('souplesse', daily(5), new Date(2027, 0, 1))).toBe(0)
    expect(getLevel('souplesse', daily(5), new Date(2027, 0, 1))).toBe(1)
  })
})
