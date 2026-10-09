// Contrôle d'un profil : exercices écartés (et pourquoi), consignes ajoutées, besoins couverts,
// puis 20 séances simulées (avec rotation) pour voir ce qui sort vraiment.
// Usage : node scripts/profile-check.mjs [profil] [minutes]   (sans argument : tous les profils, 12 min)
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}

const { PROFILES } = await import('../src/data/profiles.js')
const { needsFor, profileReport, resolveProfile } =await import('../src/lib/profile.js')
const { buildRoutine } = await import('../src/lib/routine.js')
const { getSettings } = await import('../src/lib/settings.js')
const { recordSession } = await import('../src/lib/rotation.js')

const [only, minutesArg] = process.argv.slice(2)
const minutes = Number(minutesArg) || 12
const SESSIONS = 20

for (const profile of Object.values(PROFILES)) {
  if (only && profile.id !== only) continue
  store.clear()
  const rules = resolveProfile(profile)
  const report = profileReport(rules)
  console.log(`\n══════ ${profile.name} (${profile.id}) ══════`)
  console.log(`Conditions : ${rules.conditions.join(', ') || 'aucune'} · sport : ${profile.sport}`)
  if (report.refer.length) console.log(`⚕ Avis d'un pro conseillé : ${report.refer.join(', ')}`)

  console.log(`\nÉcartés (${report.blocked.length}) :`)
  for (const v of report.blocked) console.log(`  ✕ ${v.ex.id.padEnd(22)} ${v.blockedBy.join(' · ')}`)
  for (const v of report.forced) console.log(`  ! ${v.ex.id.padEnd(22)} gardé par le coach malgré : ${v.blockedBy.join(' · ')}`)

  console.log(`\nConsignes ajoutées (${report.adapted.length}) :`)
  for (const v of report.adapted) console.log(`  ~ ${v.ex.id.padEnd(22)} ${v.notes.join(' | ')}`)

  console.log(`\nBesoins :`)
  for (const n of report.needs) {
    console.log(`  ${n.exercises.length ? '✓' : '✗ NON COUVERT'} ${n.label.padEnd(24)} ${n.exercises.map((e) => e.id).join(', ')}`)
  }

  console.log(`\nPrivilégiés (top 10) : ${report.favored.slice(0, 10).map((v) => `${v.ex.id}(${v.score})`).join(', ')}`)

  const settings = getSettings()
  for (const key of ['souplesse', 'renfo']) {
    settings[key].minutes = minutes
    const counts = {}
    const missed = {}
    for (let i = 0; i < SESSIONS; i++) {
      const r = buildRoutine(key, settings, rules)
      for (const ex of new Set(r.exercises)) counts[ex.id] = (counts[ex.id] ?? 0) + 1
      for (const m of needsFor(key, rules)) {
        if (!r.exercises.some((e) => e.biomechanics?.includes(m))) missed[m] = (missed[m] ?? 0) + 1
      }
      recordSession(key, r.exercises)
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])
    console.log(`\n${key} ${minutes} min, ${SESSIONS} séances : ${top.length} exercices différents · besoins : ${needsFor(key, rules).join(', ') || 'aucun'}`)
    console.log('  ' + top.map(([id, n]) => `${id} ${n}`).join(', '))
    const miss = Object.entries(missed)
    console.log(miss.length ? `  besoins manqués : ${miss.map(([m, n]) => `${m} ${n}/${SESSIONS}`).join(', ')}` : '  besoins : présents à chaque séance')
  }
}
