// Vérification rapide des poses : affiche les articulations clés de chaque pose clé.
// Usage : node scripts/check-poses.mjs <id> [<id>...]   (y = 0 au sol, y négatif = en hauteur)
import { ANIMATIONS } from '../src/data/animations.js'
import { fullPose, solve } from '../src/lib/rig.js'

const KEYS = ['hip', 'neck', 'head', 'handN', 'handF', 'kneeN', 'kneeF', 'ankleN', 'ankleF', 'toeN', 'toeF']
for (const id of process.argv.slice(2)) {
  const anim = ANIMATIONS[id]
  if (!anim) {
    console.log(id, ': pas d’animation')
    continue
  }
  console.log(`\n== ${id}`)
  anim.keys.forEach((k, n) => {
    const j = solve(fullPose(anim.base, k.pose, anim.view), anim)
    console.log(`  pose ${n}: ` + KEYS.map((name) => `${name}(${j[name].map((v) => Math.round(v)).join(',')})`).join(' '))
  })
}
