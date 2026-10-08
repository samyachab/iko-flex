import { useEffect, useMemo, useRef } from 'react'
import { ANIMATIONS } from '../data/animations.js'
import { LEN, WID, frame, sampler, segments, solve } from '../lib/rig.js'

// Personnage "Souffle" : membres en capsules arrondies, animé par cinématique directe (voir lib/rig.js).
// Mise à jour des attributs SVG directement dans requestAnimationFrame (aucun re-render React).

const SPEED = 1.15 // > 1 = plus rapide que les durées écrites dans animations.js
export const INK = '#121212'

// Style "v2" (prototype, option 1) : membres galbés (capsules effilées), torse en V, cou, mains,
// ombre portée au sol. Demi-épaisseurs [début, fin] de chaque segment.
const TAPER = {
  thigh: [8, 5.6],
  shin: [5.6, 3.6],
  foot: [3.6, 2.6],
  upper: [5.4, 4.2],
  fore: [4.2, 3.2],
  torso: [9.6, 11.4],
  bar: [5.5, 5.5],
}

// Capsule effilée de a (rayon ra) à b (rayon rb), extrémités arrondies
function capsule(a, b, ra, rb) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 0.001
  const nx = -dy / len
  const ny = dx / len
  const p = (q, r, k) => `${(q[0] + nx * r * k).toFixed(2)} ${(q[1] + ny * r * k).toFixed(2)}`
  return `M${p(a, ra, 1)}L${p(b, rb, 1)}A${rb} ${rb} 0 0 0 ${p(b, rb, -1)}L${p(a, ra, -1)}A${ra} ${ra} 0 0 0 ${p(a, ra, 1)}Z`
}

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
          const [ra, rb] = w === 'bar' && anim.barWidth ? [anim.barWidth / 2, anim.barWidth / 2] : TAPER[w]
          el.setAttribute('d', capsule(j[a], j[b], ra, rb))
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
        els.current.neck?.setAttribute('d', capsule(j.neck, j.head, 4.4, 3.8))
        for (const h of ['handN', 'handF']) {
          els.current[h]?.setAttribute('cx', j[h][0])
          els.current[h]?.setAttribute('cy', j[h][1])
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
  const layers = { F: anim.view === 'side' ? 0.3 : 0.92, B: 0.6, N: 0.95, L: anim.legOpacity ?? 1 }
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
          <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#4a4340" />
            <stop offset="0.55" stopColor={color} />
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
        <g key={layer} stroke={color} strokeLinecap="round" fill={v2 ? `url(#body-${id})` : 'none'} opacity={layers[layer]}>
          {segs.map(([, , w, l], k) =>
            layerOf(w, l) !== layer ? null : v2 ? (
              <path key={k} ref={(el) => (els.current[k] = el)} stroke="none" />
            ) : (
              <line key={k} ref={(el) => (els.current[k] = el)} strokeWidth={w === 'bar' && anim.barWidth ? anim.barWidth : WID[w]} />
            ),
          )}
          {v2 && layer === 'F' && <circle ref={(el) => (els.current.handF = el)} r={3.8} stroke="none" />}
          {v2 && layer === 'N' && <circle ref={(el) => (els.current.handN = el)} r={3.8} stroke="none" />}
          {v2 && layer === 'B' && <path ref={(el) => (els.current.neck = el)} stroke="none" />}
          {layer === 'B' && <circle ref={(el) => (els.current.head = el)} r={v2 ? 9.6 : LEN.head} fill={v2 ? `url(#body-${id})` : color} stroke="none" />}
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
