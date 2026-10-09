// Tableau lisible des tags biomécaniques, par routine et par zone, avec le verdict pour un profil.
// Usage : node scripts/tags-table.mjs [profil]  -> écrit scripts/tags-table.out.md
import fs from 'node:fs'

globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
const { EXERCISES, GROUPS } = await import('../src/data/exercises.js')
const { MECHANICS } = await import('../src/data/mechanics.js')
const { PROFILES } = await import('../src/data/profiles.js')
const { assess, resolveProfile } = await import('../src/lib/profile.js')

const profile = PROFILES[process.argv[2] ?? 'samy']
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
