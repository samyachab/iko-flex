// Tableau lisible des tags biomécaniques, par routine et par zone, avec le verdict pour un profil.
// Usage : node scripts/tags-table.mjs [profil, général par défaut]  -> écrit scripts/tags-table.out.md
import fs from 'node:fs'

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
const { EXERCISES, GROUPS } = await import('../src/data/exercises.js')
const { MECHANICS } = await import('../src/data/mechanics.js')
const { addProfiles, allProfiles, assess, resolveProfile } = await import('../src/lib/profile.js')
// Profils personnels locaux (hors git), s'ils existent sur cet ordinateur
try {
  addProfiles((await import('../src/data/profiles.local.js')).LOCAL_PROFILES)
} catch {
  // pas de profil local : seulement le général et les fictifs
}

const profile = allProfiles()[process.argv[2] ?? 'general']
const rules = resolveProfile(profile)
const out = 'scripts/tags-table.out.md'

const verdict = (ex) => {
  const v = assess(ex, rules)
  if (!v.allowed) return `✕ écarté (${v.blockedBy.join(', ')})`
  const parts = []
  if (v.forced) parts.push('gardé malgré : ' + v.blockedBy.join(', '))
  if (rules.keys.has(ex.id)) parts.push('★ clé')
  if (v.needs.length) parts.push('besoin : ' + v.needs.map((m) => MECHANICS[m].label).join(', '))
  if (v.score) parts.push(`priorité +${v.score}`)
  if (v.notes.length) parts.push('consigne : « ' + v.notes.map((n) => n.replace(/^Pour toi : /, '')).join(' / ') + ' »')
  return parts.join(' · ') || '—'
}

const lines = [
  `# Tags biomécaniques des exercices`,
  ``,
  `Profil : **${profile.name}** · ${rules.conditions.join(', ') || 'aucune condition'}`,
  ``,
  `Corrige directement la colonne « Ce que fait l'exercice » si un tag est faux ou manque : le reste se recalcule.`,
  ``,
]
for (const theme of ['souplesse', 'renfo']) {
  lines.push(`## ${theme === 'souplesse' ? 'Souplesse' : 'Renfo'}`, '')
  const groups = [...new Set(EXERCISES.filter((e) => e.theme === theme).map((e) => e.group))]
  for (const g of groups) {
    lines.push(`### ${GROUPS[g].label}`, '', `| Exercice | Ce que fait l'exercice | Pour ${profile.name} |`, '|---|---|---|')
    for (const ex of EXERCISES.filter((e) => e.theme === theme && e.group === g)) {
      const mech = (ex.biomechanics ?? []).map((m) => MECHANICS[m]?.label ?? `⚠ ${m}`).join(', ')
      const contra = ex.contraindications?.length ? ` · contre-indiqué si ${ex.contraindications.join(', ')}` : ''
      lines.push(`| ${ex.name} | ${mech}${contra} | ${verdict(ex)} |`)
    }
    lines.push('')
  }
}
lines.push('## Lexique', '', '| Tag | Signification |', '|---|---|')
for (const m of Object.values(MECHANICS)) lines.push(`| ${m.label} | ${m.desc} |`)

fs.writeFileSync(out, lines.join('\n') + '\n')
console.log(`écrit : ${out}`)
