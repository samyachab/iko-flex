import { useEffect, useMemo, useRef } from 'react'
import { ANIMATIONS } from '../data/animations.js'
import { LEN, WID, frame, sampler, segments, solve } from '../lib/rig.js'

// Personnage "Souffle" : membres en capsules arrondies, animé par cinématique directe (voir lib/rig.js).
// Mise à jour des attributs SVG directement dans requestAnimationFrame (aucun re-render React).

const SPEED = 1.15 // > 1 = plus rapide que les durées écrites dans animations.js
export const INK = '#121212'

export function hasAnimation(id) {
  return Boolean(ANIMATIONS[id])
}

export default function Figure({ id, paused = false, color = INK, className = '' }) {
  const anim = ANIMATIONS[id]
  const s = useMemo(() => anim && sampler(anim), [anim])
  const vb = useMemo(() => anim && frame(anim, s), [anim, s])
  const segs = useMemo(() => anim && segments(anim.view), [anim])
  const bands = useMemo(() => anim?.props?.filter((p) => p.type === 'band') ?? [], [anim])
  const weights = useMemo(() => anim?.props?.filter((p) => p.type === 'weight') ?? [], [anim])
  const els = useRef({})
  const time = useRef(0)

  useEffect(() => {
    if (!anim) return
    const draw = () => {
      const j = solve(s.at(time.current), anim)
      segs.forEach(([a, b], k) => {
        const el = els.current[k]
        if (!el) return
        el.setAttribute('x1', j[a][0])
        el.setAttribute('y1', j[a][1])
        el.setAttribute('x2', j[b][0])
        el.setAttribute('y2', j[b][1])
      })
      els.current.head?.setAttribute('cx', j.head[0])
      els.current.head?.setAttribute('cy', j.head[1])
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
      weights.forEach((w, k) => {
        const el = els.current[`weight${k}`]
        if (!el) return
        // Point d'accroche : une articulation, ou le milieu de deux (ex. kettlebell tenue à deux mains)
        const pts = [].concat(w.at).map((n) => j[n])
        el.setAttribute('cx', pts.reduce((a, p) => a + p[0], 0) / pts.length + (w.dx ?? 0))
        el.setAttribute('cy', pts.reduce((a, p) => a + p[1], 0) / pts.length + (w.dy ?? 0))
      })
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
  }, [anim, s, segs, bands, weights, paused])

  if (!anim) return null
  // Trois niveaux de sombre pour que les superpositions restent lisibles :
  // membres éloignés très clairs, tronc + tête intermédiaires, membres proches presque pleins.
  const layers = { F: anim.view === 'side' ? 0.3 : 0.92, B: 0.6, N: 0.95, L: anim.legOpacity ?? 1 }
  const layerOf = (w, l) => (anim.legOpacity != null && ['thigh', 'shin', 'foot'].includes(w) ? 'L' : l)
  const wall = anim.props?.find((p) => p.type === 'wall')
  const table = anim.props?.find((p) => p.type === 'table')
  const boxes = anim.props?.filter((p) => p.type === 'box') ?? []
  const mat = anim.props?.find((p) => p.type === 'mat')

  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.size} ${vb.size}`} className={className} aria-hidden="true">
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
      {/* legOpacity (option d'animation) : jambes en retrait, dessinées derrière tout le reste */}
      {['L', 'F', 'B', 'N'].map((layer) => (
        <g key={layer} stroke={color} strokeLinecap="round" fill="none" opacity={layers[layer]}>
          {segs.map(([, , w, l], k) =>
            layerOf(w, l) === layer ? (
              <line key={k} ref={(el) => (els.current[k] = el)} strokeWidth={w === 'bar' && anim.barWidth ? anim.barWidth : WID[w]} />
            ) : null,
          )}
          {layer === 'B' && <circle ref={(el) => (els.current.head = el)} r={LEN.head} fill={color} stroke="none" />}
        </g>
      ))}
      {/* Élastiques : trait fin par-dessus le corps */}
      {bands.map((_, k) => (
        <line key={k} ref={(el) => (els.current[`band${k}`] = el)} stroke={color} strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* Charges (kettlebell, haltères) : disque plein, toujours au premier plan */}
      {weights.map((w, k) => (
        <circle key={k} ref={(el) => (els.current[`weight${k}`] = el)} r={w.r ?? 7} fill={color} fillOpacity="0.95" />
      ))}
    </svg>
  )
}
