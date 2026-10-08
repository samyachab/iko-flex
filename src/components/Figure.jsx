import { useEffect, useMemo, useRef } from 'react'
import { ANIMATIONS } from '../data/animations.js'
import { LEN, WID, frame, sampler, segments, solve } from '../lib/rig.js'

// Personnage "Souffle" : membres en capsules arrondies, animé par cinématique directe (voir lib/rig.js).
// Mise à jour des attributs SVG directement dans requestAnimationFrame (aucun re-render React).

const SPEED = 1.15 // > 1 = plus rapide que les durées écrites dans animations.js
export const INK = '#121212'

// Style "v2" (prototype, option 1) : silhouette athlétique dessinée à partir du même squelette.
// Chaque partie du corps suit un profil [position le long du segment (0 -> 1), demi-épaisseur] :
// cuisses et mollets galbés, torse avec poitrine, taille et bassin, pieds avec talon, mains en moufle.
const PROFILE = {
  thigh: [[0, 8.4], [0.22, 8.9], [0.62, 6.8], [1, 5.3]],
  shin: [[0, 5.3], [0.22, 5.9], [0.62, 4.1], [1, 3.2]],
  foot: [[0, 3.7], [0.3, 3.4], [0.75, 2.8], [1, 2.2]],
  upper: [[0, 5.9], [0.35, 5.5], [1, 4.1]],
  fore: [[0, 4.1], [0.28, 4.5], [1, 2.9]],
  // du bassin (0) à la base du cou (1)
  torso: [[0, 10], [0.2, 10.4], [0.45, 8.7], [0.72, 11.6], [0.9, 12.2], [1, 9.5]],
  neck: [[0, 4.6], [1, 3.9]],
}

const f2 = (v) => v.toFixed(2)

// Forme lisse autour du segment a -> b selon un profil, bouts arrondis.
// ext : prolonge le segment avant a (ex. talon derrière la cheville)
function limb(a, b, profile, ext = 0) {
  let dx = b[0] - a[0]
  let dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 0.001
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const start = [a[0] - ux * ext, a[1] - uy * ext]
  dx = b[0] - start[0]
  dy = b[1] - start[1]
  const side = (k) =>
    profile.map(([t, r]) => [start[0] + dx * t + nx * r * k, start[1] + dy * t + ny * r * k])
  // Courbe lisse (Catmull-Rom -> Bézier) passant par les points d'un bord
  const curve = (pts) => {
    let d = ''
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]
      d += `C${f2(p1[0] + (p2[0] - p0[0]) / 6)} ${f2(p1[1] + (p2[1] - p0[1]) / 6)} ${f2(p2[0] - (p3[0] - p1[0]) / 6)} ${f2(p2[1] - (p3[1] - p1[1]) / 6)} ${f2(p2[0])} ${f2(p2[1])}`
    }
    return d
  }
  const left = side(1)
  const right = side(-1).reverse()
  const r0 = profile[0][1]
  const r1 = profile[profile.length - 1][1]
  return `M${f2(left[0][0])} ${f2(left[0][1])}${curve(left)}A${r1} ${r1} 0 0 0 ${f2(right[0][0])} ${f2(right[0][1])}${curve(right)}A${r0} ${r0} 0 0 0 ${f2(left[0][0])} ${f2(left[0][1])}Z`
}

const angleOf = (a, b) => (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI

export function hasAnimation(id) {
  return Boolean(ANIMATIONS[id])
}

export default function Figure({ id, paused = false, color = INK, className = '', variant = 'v1' }) {
  const v2 = variant === 'v2'
  const anim = ANIMATIONS[id]
  const s = useMemo(() => anim && sampler(anim), [anim])
  const vb = useMemo(() => anim && frame(anim, s), [anim, s])
  const segs = useMemo(() => anim && segments(anim.view), [anim])
  const bands = useMemo(() => anim?.props?.filter((p) => p.type === 'band') ?? [], [anim])
  const weights = useMemo(() => anim?.props?.filter((p) => p.type === 'weight') ?? [], [anim])
  // Rouleaux tenus entre deux articulations (ex. deadbug press) : suivent le corps comme une charge
  const heldRollers = useMemo(() => anim?.props?.filter((p) => p.type === 'roller' && p.at) ?? [], [anim])
  const els = useRef({})
  const time = useRef(0)

  useEffect(() => {
    if (!anim) return
    const draw = () => {
      const j = solve(s.at(time.current), anim)
      segs.forEach(([a, b, w], k) => {
        const el = els.current[k]
        if (!el) return
        if (v2) {
          const prof = w === 'bar' ? [[0, (anim.barWidth ?? 11) / 2], [1, (anim.barWidth ?? 11) / 2]] : PROFILE[w]
          el.setAttribute('d', limb(j[a], j[b], prof, w === 'foot' ? 3 : 0))
          return
        }
        el.setAttribute('x1', j[a][0])
        el.setAttribute('y1', j[a][1])
        el.setAttribute('x2', j[b][0])
        el.setAttribute('y2', j[b][1])
      })
      els.current.head?.setAttribute('cx', j.head[0])
      els.current.head?.setAttribute('cy', j.head[1])
      if (v2) {
        // Tête ovale orientée comme le cou, cou dessiné, mains en moufle dans l'axe de l'avant-bras
        const ha = angleOf(j.neck, j.head)
        els.current.head?.setAttribute('transform', `rotate(${f2(-ha)} ${f2(j.head[0])} ${f2(j.head[1])})`)
        els.current.neck?.setAttribute('d', limb(j.neck, [(j.neck[0] + j.head[0]) / 2, (j.neck[1] + j.head[1]) / 2], PROFILE.neck))
        for (const [h, e] of [['handN', 'elbowN'], ['handF', 'elbowF']]) {
          const el = els.current[h]
          if (!el) continue
          const fa = angleOf(j[e], j[h])
          const r = (fa * Math.PI) / 180
          const cx = j[h][0] + Math.sin(r) * 2.2
          const cy = j[h][1] + Math.cos(r) * 2.2
          el.setAttribute('cx', f2(cx))
          el.setAttribute('cy', f2(cy))
          el.setAttribute('transform', `rotate(${f2(-fa)} ${f2(cx)} ${f2(cy)})`)
        }
        // Ombre portée : sous les points d'appui (articulations proches du sol)
        const sh = els.current.shadow
        if (sh) {
          const xs = Object.values(j).filter((q) => q[1] > -14).map((q) => q[0])
          const lo = xs.length ? Math.min(...xs) : j.hip[0]
          const hi = xs.length ? Math.max(...xs) : j.hip[0]
          sh.setAttribute('cx', (lo + hi) / 2)
          sh.setAttribute('rx', (hi - lo) / 2 + 14)
        }
      }
      bands.forEach((b, k) => {
        const el = els.current[`band${k}`]
        if (!el) return
        const a = j[b.from]
        const c = typeof b.to === 'string' ? j[b.to] : b.to
        el.setAttribute('x1', a[0])
        el.setAttribute('y1', a[1])
        el.setAttribute('x2', c[0])
        el.setAttribute('y2', c[1])
      })
      const attach = (el, w) => {
        if (!el) return
        // Point d'accroche : une articulation, ou le milieu de deux (ex. kettlebell tenue à deux mains)
        const pts = [].concat(w.at).map((n) => j[n])
        el.setAttribute('cx', pts.reduce((a, p) => a + p[0], 0) / pts.length + (w.dx ?? 0))
        el.setAttribute('cy', pts.reduce((a, p) => a + p[1], 0) / pts.length + (w.dy ?? 0))
      }
      weights.forEach((w, k) => attach(els.current[`weight${k}`], w))
      heldRollers.forEach((w, k) => attach(els.current[`roller${k}`], w))
    }
    draw()
    // Pas de coupure si "réduire les animations" est actif : la démo du mouvement est le contenu lui-même.
    if (paused) return
    let last = performance.now()
    let raf = requestAnimationFrame(function tick(now) {
      // Plafond large : si le navigateur ralentit les frames, le mouvement garde sa vitesse réelle
      time.current += Math.min(0.5, (now - last) / 1000) * SPEED
      last = now
      draw()
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [anim, s, segs, bands, weights, heldRollers, paused, v2])

  if (!anim) return null
  // Trois niveaux de sombre pour que les superpositions restent lisibles :
  // membres éloignés très clairs, tronc + tête intermédiaires, membres proches presque pleins.
  const layers = v2
    ? { F: anim.view === 'side' ? 0.38 : 0.95, B: 0.9, N: 1, L: anim.legOpacity ?? 1 }
    : { F: anim.view === 'side' ? 0.3 : 0.92, B: 0.6, N: 0.95, L: anim.legOpacity ?? 1 }
  const layerOf = (w, l) => (anim.legOpacity != null && ['thigh', 'shin', 'foot'].includes(w) ? 'L' : l)
  const wall = anim.props?.find((p) => p.type === 'wall')
  const table = anim.props?.find((p) => p.type === 'table')
  const boxes = anim.props?.filter((p) => p.type === 'box') ?? []
  const mat = anim.props?.find((p) => p.type === 'mat')
  const floorRollers = anim.props?.filter((p) => p.type === 'roller' && !p.at) ?? []
  const cones = anim.props?.filter((p) => p.type === 'cone') ?? []

  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.size} ${vb.size}`} className={className} aria-hidden="true">
      {v2 && (
        <defs>
          <radialGradient id={`shadow-${id}`}>
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
          {/* Volume : lumière douce venant du haut-gauche sur chaque partie du corps */}
          <linearGradient id={`body-${id}`} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="#5a4a44" />
            <stop offset="0.45" stopColor="#241f1d" />
            <stop offset="1" stopColor={color} />
          </linearGradient>
        </defs>
      )}
      {v2 && anim.ground !== false && <ellipse ref={(el) => (els.current.shadow = el)} cy={1} ry={4.5} fill={`url(#shadow-${id})`} />}
      {anim.ground !== false && (
        <line x1={vb.x + 8} x2={vb.x + vb.size - 8} y1={0.5} y2={0.5} stroke={color} strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {mat && (
        <rect x={mat.x1} y={mat.y1} width={mat.x2 - mat.x1} height={mat.y2 - mat.y1} rx="8" fill={color} fillOpacity="0.08" />
      )}
      {wall && anim.view === 'side' && (
        <g stroke={color} strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round">
          <line x1={wall.x} x2={wall.x} y1={0} y2={wall.top ?? vb.y + 6} />
          {wall.lintel && <line x1={wall.x} x2={wall.x + wall.lintel} y1={wall.top} y2={wall.top} />}
        </g>
      )}
      {wall && anim.view === 'front' && (
        <rect
          x={vb.x + vb.size * 0.18}
          y={vb.y + vb.size * 0.08}
          width={vb.size * 0.64}
          height={-vb.y - vb.size * 0.08}
          rx="10"
          fill={color}
          fillOpacity="0.07"
        />
      )}
      {/* Opacité appliquée au groupe : pas de surépaisseur sombre aux articulations */}
      {table && (
        <g stroke={color} strokeOpacity="0.3" strokeLinecap="round">
          <line x1={table.x1} x2={table.x2} y1={table.top} y2={table.top} strokeWidth="5" />
          <line x1={table.x1 + 6} x2={table.x1 + 6} y1={table.top} y2={0} strokeWidth="3" />
          <line x1={table.x2 - 6} x2={table.x2 - 6} y1={table.top} y2={0} strokeWidth="3" />
        </g>
      )}
      {boxes.map((b, k) => (
        <rect
          key={k}
          x={b.x1}
          y={b.top}
          width={b.x2 - b.x1}
          height={-b.top}
          rx="4"
          fill={color}
          fillOpacity="0.14"
          stroke={color}
          strokeOpacity="0.3"
          strokeWidth="2"
        />
      ))}
      {/* Rouleau au sol (vu de profil : disque ; vu de dessus : barre arrondie), dessiné sous le corps */}
      {floorRollers.map((r, k) =>
        r.r ? (
          <circle key={k} cx={r.x} cy={-r.r} r={r.r} fill={color} fillOpacity="0.14" stroke={color} strokeOpacity="0.3" strokeWidth="2" />
        ) : (
          <rect key={k} x={r.x1} y={r.y1} width={r.x2 - r.x1} height={r.y2 - r.y1} rx={(r.x2 - r.x1) / 2} fill={color} fillOpacity="0.14" stroke={color} strokeOpacity="0.3" strokeWidth="2" />
        ),
      )}
      {cones.map((c, k) => (
        <path key={k} d={`M${c.x - 6} 0 L${c.x} ${-(c.h ?? 11)} L${c.x + 6} 0 Z`} fill={color} fillOpacity="0.3" strokeLinejoin="round" stroke={color} strokeOpacity="0.3" strokeWidth="2" />
      ))}
      {/* legOpacity (option d'animation) : jambes en retrait, dessinées derrière tout le reste */}
      {['L', 'F', 'B', 'N'].map((layer) => (
        <g
          key={layer}
          stroke={v2 ? '#ffffff' : color}
          strokeOpacity={v2 ? 0.14 : 1}
          strokeLinecap="round"
          fill={v2 ? `url(#body-${id})` : 'none'}
          opacity={layers[layer]}
        >
          {segs.map(([, , w, l], k) =>
            layerOf(w, l) !== layer ? null : v2 ? (
              <path key={k} ref={(el) => (els.current[k] = el)} strokeWidth="0.8" />
            ) : (
              <line key={k} ref={(el) => (els.current[k] = el)} strokeWidth={w === 'bar' && anim.barWidth ? anim.barWidth : WID[w]} />
            ),
          )}
          {v2 && layer === 'F' && <ellipse ref={(el) => (els.current.handF = el)} rx={3.4} ry={4.6} stroke="none" />}
          {v2 && layer === 'N' && <ellipse ref={(el) => (els.current.handN = el)} rx={3.4} ry={4.6} stroke="none" />}
          {v2 && layer === 'B' && <path ref={(el) => (els.current.neck = el)} stroke="none" />}
          {layer === 'B' &&
            (v2 ? (
              <ellipse ref={(el) => (els.current.head = el)} rx={8.4} ry={10} fill={`url(#body-${id})`} strokeWidth="0.8" />
            ) : (
              <circle ref={(el) => (els.current.head = el)} r={LEN.head} fill={color} stroke="none" />
            ))}
        </g>
      ))}
      {/* Élastiques : trait fin par-dessus le corps */}
      {bands.map((_, k) => (
        <line key={k} ref={(el) => (els.current[`band${k}`] = el)} stroke={color} strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
      ))}
      {heldRollers.map((r, k) => (
        <circle key={k} ref={(el) => (els.current[`roller${k}`] = el)} r={r.r ?? 6} fill={color} fillOpacity="0.35" stroke={color} strokeOpacity="0.6" strokeWidth="2" />
      ))}
      {/* Charges (kettlebell, haltères) : disque plein, toujours au premier plan */}
      {weights.map((w, k) => (
        <circle key={k} ref={(el) => (els.current[`weight${k}`] = el)} r={w.r ?? 7} fill={color} fillOpacity="0.95" />
      ))}
    </svg>
  )
}
