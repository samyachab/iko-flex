// Squelette du personnage : longueurs, cinématique directe, interpolation des poses et cadrage.
// Module pur (sans React) : utilisé par Figure.jsx et par les scripts de vérification des poses.
import { STAND } from '../data/animations.js'

export const LEN = { torso: 50, neck: 6, head: 10.5, upper: 28, fore: 27, thigh: 38, shin: 36, foot: 11 }
export const WID = { torso: 21, upper: 10, fore: 8.5, thigh: 14, shin: 11, foot: 7, bar: 11 }

const rad = (d) => (d * Math.PI) / 180
const step = (p, a, len) => [p[0] + Math.sin(rad(a)) * len, p[1] + Math.cos(rad(a)) * len]
const ease = (u) => 0.5 - Math.cos(Math.PI * u) / 2

const mirror = (arr) => arr && arr.map((a) => -a)

export function fullPose(base, over, view) {
  const p = { ...STAND, ...base, ...over, fs: { ...base?.fs, ...over?.fs } }
  if (view === 'front') {
    if (!over?.armF && !base?.armF) p.armF = mirror(p.armN)
    if (!over?.legF && !base?.legF) p.legF = mirror(p.legN)
  }
  return p
}

const lerp = (a, b, u) => a + (b - a) * u
const lerpArr = (a, b, u) => a.map((v, k) => lerp(v, b[k], u))

function blend(a, b, u) {
  return {
    x: lerp(a.x, b.x, u),
    y: a.y != null && b.y != null ? lerp(a.y, b.y, u) : undefined,
    torso: lerp(a.torso, b.torso, u),
    pelvis: lerp(a.pelvis ?? a.torso, b.pelvis ?? b.torso, u),
    head: lerp(a.head ?? a.torso, b.head ?? b.torso, u),
    armN: lerpArr(a.armN, b.armN, u),
    armF: lerpArr(a.armF, b.armF, u),
    legN: lerpArr(a.legN, b.legN, u),
    legF: lerpArr(a.legF, b.legF, u),
    fs: blendFs(a.fs, b.fs, u),
  }
}

// Raccourcis de perspective (segment qui pointe vers/loin de la caméra), 1 = longueur normale.
function blendFs(a = {}, b = {}, u) {
  const out = {}
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = lerp(a[k] ?? 1, b[k] ?? 1, u)
  return out
}

// Positions des articulations, puis recalage vertical : le point le plus bas touche le sol (y = 0),
// sauf si l'animation fixe la hauteur du bassin (hipHeight, ex. assis sur une table).
export function solve(p, anim) {
  const view = anim.view
  const front = view === 'front'
  const f = (k) => p.fs?.[k] ?? 1
  const hip = [p.x, 0]
  const neck = step(hip, p.torso, LEN.torso * f('torso'))
  const head = step(neck, p.head ?? p.torso, (LEN.neck + LEN.head) * f('head'))
  const sh = front ? 15 : 0
  const hp = front ? 8 : 0
  // Axe des épaules / du bassin, perpendiculaire au tronc (pelvis permet de garder le bassin fixe quand le buste tourne)
  const side = (sign, a = p.torso) => [Math.cos(rad(a - 180)) * sign, Math.sin(rad(a - 180)) * sign]
  const off = (pt, d, sign, a) => {
    const [dx, dy] = side(sign, a)
    return [pt[0] + dx * d, pt[1] + dy * d]
  }

  const j = { hip, neck, head }
  for (const [s, sign] of [['N', 1], ['F', -1]]) {
    const arm = p[`arm${s}`]
    const leg = p[`leg${s}`]
    j[`sh${s}`] = off(neck, sh, sign)
    j[`elbow${s}`] = step(j[`sh${s}`], arm[0], LEN.upper * f(`upper${s}`))
    j[`hand${s}`] = step(j[`elbow${s}`], arm[1], LEN.fore * f(`fore${s}`))
    j[`hip${s}`] = off(hip, hp, sign, p.pelvis ?? p.torso)
    j[`knee${s}`] = step(j[`hip${s}`], leg[0], LEN.thigh * f(`thigh${s}`))
    j[`ankle${s}`] = step(j[`knee${s}`], leg[1], LEN.shin * f(`shin${s}`))
    j[`toe${s}`] = step(j[`ankle${s}`], leg[2], LEN.foot * f(`foot${s}`))
  }

  const fixed = p.y ?? anim.hipHeight
  if (fixed != null) {
    for (const k in j) j[k] = [j[k][0], j[k][1] - fixed]
    return j
  }
  let bottom = -Infinity
  for (const [a, b, w] of segments(view)) bottom = Math.max(bottom, j[a][1] + WID[w] / 2, j[b][1] + WID[w] / 2)
  bottom = Math.max(bottom, j.head[1] + LEN.head)
  for (const k in j) j[k] = [j[k][0], j[k][1] - bottom]
  return j
}

// [articulation A, articulation B, largeur, couche] dans l'ordre de dessin.
// Couches : F = membres éloignés, B = tronc + tête, N = membres proches.
export function segments(view) {
  const list = [
    ['shF', 'elbowF', 'upper', 'F'],
    ['elbowF', 'handF', 'fore', 'F'],
    ['hipF', 'kneeF', 'thigh', 'F'],
    ['kneeF', 'ankleF', 'shin', 'F'],
    ['ankleF', 'toeF', 'foot', 'F'],
    ['hip', 'neck', 'torso', 'B'],
    ['hipN', 'kneeN', 'thigh', 'N'],
    ['kneeN', 'ankleN', 'shin', 'N'],
    ['ankleN', 'toeN', 'foot', 'N'],
    ['shN', 'elbowN', 'upper', 'N'],
    ['elbowN', 'handN', 'fore', 'N'],
  ]
  if (view === 'front') list.splice(5, 0, ['shF', 'shN', 'bar', 'B'], ['hipF', 'hipN', 'bar', 'B'])
  return list
}

export function sampler(anim) {
  const keys = anim.keys.map((k) => ({ ...k, pose: fullPose(anim.base, k.pose, anim.view) }))
  const total = keys.reduce((s, k) => s + k.hold + k.move, 0)
  return {
    total,
    at(t) {
      let r = ((t % total) + total) % total
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        if (r < k.hold) return blend(k.pose, k.pose, 0)
        r -= k.hold
        if (r < k.move) return blend(k.pose, keys[(i + 1) % keys.length].pose, ease(r / k.move))
        r -= k.move
      }
      return blend(keys[0].pose, keys[0].pose, 0)
    },
  }
}

// Cadrage fixe calculé sur tout le cycle : le personnage ne "saute" jamais dans le cadre.
export function frame(anim, s) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let n = 0; n <= 60; n++) {
    const j = solve(s.at((s.total * n) / 60), anim)
    for (const k in j) {
      const r = k === 'head' ? LEN.head : WID.thigh / 2
      minX = Math.min(minX, j[k][0] - r)
      maxX = Math.max(maxX, j[k][0] + r)
      minY = Math.min(minY, j[k][1] - r)
      maxY = Math.max(maxY, j[k][1] + r)
    }
  }
  // Les accessoires fixes (box, mur, banc) doivent rester dans le cadre
  for (const pr of anim.props ?? []) {
    if (pr.type === 'box' || pr.type === 'table') {
      minX = Math.min(minX, pr.x1)
      maxX = Math.max(maxX, pr.x2)
      minY = Math.min(minY, pr.top)
    }
    if (pr.type === 'wall' && pr.x != null) {
      minX = Math.min(minX, pr.x - 4)
      maxX = Math.max(maxX, pr.x + 4)
    }
  }
  // Cadre carré centré sur le mouvement (avec sol : y = 0 sous le personnage ; vue de dessus : pas de sol)
  const pad = 10
  const bottom = anim.ground === false ? maxY : Math.max(maxY, 0)
  const size = Math.max(maxX - minX, bottom - minY) + pad * 2
  const cx = (minX + maxX) / 2
  const cy = (minY + bottom) / 2
  return { x: cx - size / 2, y: cy - size / 2, size }
}
