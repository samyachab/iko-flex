// Filtre intelligent : croise les conditions de la personne avec la mécanique des exercices.
// Ordre de priorité, du plus fort au plus faible :
//   1. coach (overrides.include / exclude / replace_by)
//   2. sécurité : contre-indication ou mécanique à éviter -> l'exercice sort
//   3. besoins (needs) : au moins un exercice de la mécanique par séance
//   4. préférences (favor, sport) : l'exercice revient plus souvent
//   5. rotation et réglages de la personne (lib/routine.js)
import { CONDITIONS, SPORTS } from '../data/conditions.js'
import { MECHANICS } from '../data/mechanics.js'
import { DEFAULT_PROFILE, PROFILES } from '../data/profiles.js'
import { EXERCISES } from '../data/exercises.js'

const KEY = 'iko-flex:profile'

export function getProfileId() {
  try {
    const id = localStorage.getItem(KEY)
    return PROFILES[id] ? id : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

export function setProfileId(id) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    // stockage indisponible : profil par défaut
  }
}

const push = (map, k, v) => map.set(k, [...(map.get(k) ?? []), v])

// Conditions -> règles sur les mécaniques
export function resolveProfile(profile) {
  const rules = profile.rules ?? {}
  const conditions = [...(profile.posture_issues ?? []), ...(profile.pain_points ?? [])].filter((c) => CONDITIONS[c])
  const avoid = new Map() // mécanique -> conditions qui l'interdisent
  const adapt = new Map() // mécanique -> consignes en plus
  const favor = new Map() // mécanique -> poids
  const needs = new Set(rules.force_include ?? [])
  const addFavor = (obj) => {
    for (const [m, w] of Object.entries(obj ?? {})) favor.set(m, (favor.get(m) ?? 0) + w)
  }

  for (const id of conditions) {
    const c = CONDITIONS[id]
    for (const m of c.avoid ?? []) push(avoid, m, c.label)
    for (const [m, text] of Object.entries(c.adapt ?? {})) push(adapt, m, text)
    addFavor(c.favor)
    for (const m of c.needs ?? []) needs.add(m)
  }
  addFavor(SPORTS[profile.sport]?.favor)
  for (const m of rules.exclude_tags ?? []) push(avoid, m, 'règle du coach')

  const overrides = rules.overrides ?? {}
  const replaced = new Map() // exercice remplacé -> remplaçant
  for (const [id, o] of Object.entries(overrides)) if (o.replace_by) replaced.set(id, o.replace_by)

  return {
    profile,
    conditions,
    avoid,
    adapt,
    favor,
    needs,
    overrides,
    replaced,
    substitutes: new Set(replaced.values()),
    keys: new Set(profile.keys ?? []),
    refer: conditions.filter((c) => CONDITIONS[c].refer),
  }
}

const cache = new Map()
// Règles du profil actif (calculées une fois par profil)
export function currentRules(id = getProfileId()) {
  if (!cache.has(id)) cache.set(id, resolveProfile(PROFILES[id]))
  return cache.get(id)
}

// Verdict pour un exercice : autorisé ou non (et pourquoi), score de préférence, consignes en plus
export function assess(ex, rules = currentRules()) {
  const o = rules.overrides[ex.id] ?? {}
  const mech = ex.biomechanics ?? []
  const blockedBy = []
  for (const c of ex.contraindications ?? []) {
    if (rules.conditions.includes(c)) blockedBy.push(`contre-indiqué : ${CONDITIONS[c].label}`)
  }
  for (const m of mech) if (rules.avoid.has(m)) blockedBy.push(`${MECHANICS[m].label} (${rules.avoid.get(m).join(', ')})`)
  if (o.exclude) blockedBy.push('retiré par le coach')
  if (rules.replaced.has(ex.id)) blockedBy.push(`remplacé par ${rules.replaced.get(ex.id)}`)

  // Un remplaçant prend la place (et la fréquence) de l'exercice remplacé
  const score = mech.reduce((s, m) => s + (rules.favor.get(m) ?? 0), 0) + (rules.substitutes.has(ex.id) ? 4 : 0)
  const notes = [...new Set(mech.flatMap((m) => rules.adapt.get(m) ?? []))]
  if (o.warning) notes.unshift(o.warning)
  return {
    allowed: Boolean(o.include) || blockedBy.length === 0,
    forced: Boolean(o.include) && blockedBy.length > 0,
    blockedBy,
    score,
    notes,
    needs: mech.filter((m) => rules.needs.has(m)),
  }
}

// Besoins qui s'appliquent à une routine : la mécanique doit y être bien représentée (au moins un tiers
// de ses exercices permis). Ex. psoas_etirement est dans 1 renfo sur 6 : besoin de la souplesse seulement,
// sinon les fentes bulgares seraient imposées à chaque séance de renfo.
export function needsFor(theme, rules = currentRules()) {
  return [...rules.needs].filter((m) => {
    const all = EXERCISES.filter((e) => e.biomechanics?.includes(m) && assess(e, rules).allowed)
    return all.length && all.filter((e) => e.theme === theme).length * 3 >= all.length
  })
}

// Bilan pour le coach : exercices écartés, besoins couverts ou non (= exercice à créer)
export function profileReport(rules = currentRules(), themes = ['souplesse', 'renfo']) {
  const pool = EXERCISES.filter((e) => themes.includes(e.theme))
  const verdicts = pool.map((ex) => ({ ex, ...assess(ex, rules) }))
  const needs = [...rules.needs].map((m) => ({
    mechanic: m,
    label: MECHANICS[m]?.label ?? m,
    exercises: verdicts.filter((v) => v.allowed && v.ex.biomechanics?.includes(m)).map((v) => v.ex),
  }))
  return {
    blocked: verdicts.filter((v) => !v.allowed),
    forced: verdicts.filter((v) => v.forced),
    adapted: verdicts.filter((v) => v.allowed && v.notes.length),
    favored: verdicts.filter((v) => v.allowed && v.score > 0).sort((a, b) => b.score - a.score),
    needs,
    uncovered: needs.filter((n) => !n.exercises.length),
    refer: rules.refer.map((c) => CONDITIONS[c].label),
  }
}
