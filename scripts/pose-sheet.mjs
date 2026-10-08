// Planche-contact des poses clés : une vignette SVG par pose, pour relire les animations d'un coup d'œil.
// Usage : node scripts/pose-sheet.mjs scripts/pose-sheet.out.html [<id>...]   (sans id : toutes les animations)
import { writeFileSync } from 'node:fs'
import { ANIMATIONS } from '../src/data/animations.js'
import { LEN, WID, fullPose, segments, solve } from '../src/lib/rig.js'

const [out, ...ids] = process.argv.slice(2)
const list = ids.length ? ids : Object.keys(ANIMATIONS)
const OP = { F: 0.3, B: 0.6, N: 0.95 }

function cell(anim, pose) {
  const j = solve(pose, anim)
  let minX = Infinity, maxX = -Infinity, minY = Infinity
  for (const k in j) {
    minX = Math.min(minX, j[k][0] - 12)
    maxX = Math.max(maxX, j[k][0] + 12)
    minY = Math.min(minY, j[k][1] - 12)
  }
  const props = anim.props ?? []
  for (const p of props) {
    if (p.x1 != null) (minX = Math.min(minX, p.x1)), (maxX = Math.max(maxX, p.x2)), (minY = Math.min(minY, p.top ?? p.y1 ?? minY))
    if (p.x != null) (minX = Math.min(minX, p.x - 10)), (maxX = Math.max(maxX, p.x + 10))
  }
  const maxY = Math.max(10, ...Object.values(j).map((v) => v[1] + 12))
  const size = Math.max(maxX - minX, maxY - minY) + 10
  const vb = `${(minX + maxX) / 2 - size / 2} ${(minY + maxY) / 2 - size / 2} ${size} ${size}`
  const front = anim.view === 'front'
  let s = `<svg viewBox="${vb}" width="190" height="190" style="background:#f4efe6">`
  s += `<line x1="-500" x2="500" y1="0.5" y2="0.5" stroke="#999" />`
  for (const p of props) {
    if (p.type === 'wall' && p.x != null) s += `<line x1="${p.x}" x2="${p.x}" y1="0" y2="${p.top ?? -200}" stroke="#aaa" stroke-width="3"/>`
    if (p.type === 'box' || p.type === 'table') s += `<rect x="${p.x1}" y="${p.top}" width="${p.x2 - p.x1}" height="${-p.top}" fill="#ccc"/>`
    if (p.type === 'mat') s += `<rect x="${p.x1}" y="${p.y1}" width="${p.x2 - p.x1}" height="${p.y2 - p.y1}" fill="#ddd"/>`
    if (p.type === 'cone') s += `<path d="M${p.x - 6} 0 L${p.x} ${-(p.h ?? 11)} L${p.x + 6} 0 Z" fill="#d80"/>`
    if (p.type === 'roller') {
      if (p.r && p.at) {
        const pts = [].concat(p.at).map((n) => j[n])
        const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length + (p.dx ?? 0)
        const cy = pts.reduce((a, q) => a + q[1], 0) / pts.length + (p.dy ?? 0)
        s += `<circle cx="${cx}" cy="${cy}" r="${p.r}" fill="#9cf"/>`
      } else if (p.r) s += `<circle cx="${p.x}" cy="${-p.r}" r="${p.r}" fill="#9cf"/>`
      else s += `<rect x="${p.x1}" y="${p.y1}" width="${p.x2 - p.x1}" height="${p.y2 - p.y1}" rx="6" fill="#9cf"/>`
    }
  }
  for (const [a, b, w, l] of segments(anim.view)) {
    const op = !front && l === 'F' ? OP.F : OP[l] ?? 0.9
    s += `<line x1="${j[a][0]}" y1="${j[a][1]}" x2="${j[b][0]}" y2="${j[b][1]}" stroke="#121212" stroke-opacity="${op}" stroke-width="${w === 'bar' && anim.barWidth ? anim.barWidth : WID[w]}" stroke-linecap="round"/>`
  }
  s += `<circle cx="${j.head[0]}" cy="${j.head[1]}" r="${LEN.head}" fill="#121212" fill-opacity="0.6"/>`
  for (const p of props) {
    if (p.type === 'band') {
      const a = j[p.from]
      const c = typeof p.to === 'string' ? j[p.to] : p.to
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="#c00" stroke-width="2"/>`
    }
    if (p.type === 'weight') {
      const pts = [].concat(p.at).map((n) => j[n])
      s += `<circle cx="${pts.reduce((a, q) => a + q[0], 0) / pts.length + (p.dx ?? 0)}" cy="${pts.reduce((a, q) => a + q[1], 0) / pts.length + (p.dy ?? 0)}" r="${p.r ?? 7}" fill="#333"/>`
    }
  }
  return s + '</svg>'
}

let html = '<!doctype html><meta charset="utf-8"><body style="font:12px sans-serif;background:#222;color:#eee">'
for (const id of list) {
  const anim = ANIMATIONS[id]
  if (!anim) continue
  html += `<div style="display:inline-block;margin:4px 10px 4px 0;vertical-align:top"><div>${id}</div><div style="display:flex;gap:3px">`
  anim.keys.forEach((k) => (html += cell(anim, fullPose(anim.base, k.pose, anim.view))))
  html += "</div></div>"
}
writeFileSync(out, html)
console.log(`${list.length} animations -> ${out}`)
