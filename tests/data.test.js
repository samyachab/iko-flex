// Cohérence de la bibliothèque : une faute de frappe dans une clé passerait sinon en silence
// (une mécanique inconnue n'est jamais filtrée, un exercice de programme tendon introuvable disparaît).
import { describe, expect, it } from 'vitest'
import { EQUIPMENT, EXERCISES, GROUPS } from '../src/data/exercises.js'
import { MECHANICS } from '../src/data/mechanics.js'
import { CONDITIONS, SPORTS } from '../src/data/conditions.js'
import { TENDON_PROGRAMS } from '../src/data/tendons.js'
import { DEFAULT_PROFILE, PROFILES } from '../src/data/profiles.js'
import { ANIMATIONS } from '../src/data/animations.js'

const ids = new Set(EXERCISES.map((e) => e.id))
const home = EXERCISES.filter((e) => e.theme === 'souplesse' || e.theme === 'renfo')
const unknown = (keys, known) => (keys ?? []).filter((k) => !(k in known))

describe('exercices', () => {
  it('identifiants uniques', () => {
    expect(ids.size).toBe(EXERCISES.length)
  })

  it.each(EXERCISES.map((e) => [e.id, e]))('%s : clés connues', (_, e) => {
    expect(['souplesse', 'renfo', 'salle']).toContain(e.theme)
    expect(GROUPS).toHaveProperty(e.group)
    expect(unknown(e.equip, EQUIPMENT)).toEqual([])
    expect(unknown(e.biomechanics, MECHANICS)).toEqual([])
    expect(unknown(e.contraindications, CONDITIONS)).toEqual([])
  })

  it.each(home.map((e) => [e.id, e]))('%s : animé, avec consigne, prévention et mécanique', (_, e) => {
    expect(ANIMATIONS).toHaveProperty(e.id)
    expect(e.cue).toBeTruthy()
    expect(e.warning).toBeTruthy()
    expect(e.biomechanics?.length).toBeGreaterThan(0)
  })

  it.each(home.filter((e) => e.theme === 'souplesse').map((e) => [e.id, e]))('%s : dose et type', (_, e) => {
    expect(['static', 'dynamic']).toContain(e.kind)
    expect(e.dose).toHaveLength(2)
    expect(e.dose[0]).toBeGreaterThan(0)
    expect(e.dose[1]).toBeGreaterThanOrEqual(e.dose[0])
  })

  it.each(home.filter((e) => e.theme === 'renfo').map((e) => [e.id, e]))('%s : programmation sur 3 niveaux', (_, e) => {
    expect(['reps', 'time']).toContain(e.prog?.measure)
    if (e.prog.measure === 'reps') expect(e.prog.tempo.length).toBeGreaterThan(0)
    expect(e.prog.rest).toBeGreaterThanOrEqual(0)
    expect(e.prog.levels).toHaveLength(3)
    for (const [sets, amount] of e.prog.levels) {
      expect(sets).toBeGreaterThan(0)
      expect(amount).toBeGreaterThan(0)
    }
  })
})

describe('conditions et sports', () => {
  it.each(Object.entries(CONDITIONS))('%s : mécaniques et exercices connus', (_, c) => {
    expect(['posture', 'douleur', 'objectif']).toContain(c.kind)
    expect(unknown(c.avoid, MECHANICS)).toEqual([])
    expect(unknown(Object.keys(c.adapt ?? {}), MECHANICS)).toEqual([])
    expect(unknown(Object.keys(c.favor ?? {}), MECHANICS)).toEqual([])
    const needs = Array.isArray(c.needs) ? c.needs : Object.keys(c.needs ?? {})
    expect(unknown(needs, MECHANICS)).toEqual([])
    expect((c.avoidIds ?? []).filter((id) => !ids.has(id))).toEqual([])
  })

  it.each(Object.entries(SPORTS))('%s : mécaniques connues', (_, s) => {
    expect(unknown(Object.keys(s.favor ?? {}), MECHANICS)).toEqual([])
  })
})

describe('programmes tendon', () => {
  it.each(Object.entries(TENDON_PROGRAMS))('%s : 3 phases, exercices programmés existants', (cond, p) => {
    expect(CONDITIONS).toHaveProperty(cond)
    expect(p.phases).toHaveLength(3)
    expect(p.phases.at(-1).weeks).toBeNull()
    for (const phase of p.phases) {
      expect(phase.exercises.length).toBeGreaterThan(0)
      for (const item of phase.exercises) {
        const ex = EXERCISES.find((e) => e.id === item.id)
        expect(ex, item.id).toBeDefined()
        expect(ex.prog, `${item.id} doit avoir une programmation`).toBeDefined()
      }
      expect(unknown(phase.allow, MECHANICS)).toEqual([])
    }
  })
})

describe('profils publics', () => {
  it('le profil par défaut existe', () => {
    expect(PROFILES).toHaveProperty(DEFAULT_PROFILE)
  })

  it.each(Object.entries(PROFILES))('%s : conditions, exercices et sport connus', (_, p) => {
    expect(unknown([...(p.posture_issues ?? []), ...(p.pain_points ?? []), ...(p.goals ?? [])], CONDITIONS)).toEqual([])
    expect(SPORTS).toHaveProperty(p.sport)
    expect((p.keys ?? []).filter((id) => !ids.has(id))).toEqual([])
    for (const [id, o] of Object.entries(p.rules?.overrides ?? {})) {
      expect(ids.has(id), id).toBe(true)
      if (o.replace_by) expect(ids.has(o.replace_by), o.replace_by).toBe(true)
    }
    expect(unknown(p.rules?.exclude_tags, MECHANICS)).toEqual([])
  })
})
