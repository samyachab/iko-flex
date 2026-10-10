import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cropToBlob, loadImage } from '../lib/image.js'
import { TONES, gradient } from '../lib/theme.js'

// Recadrage de la photo de profil : glisser pour déplacer, pincer (ou le curseur) pour zoomer.
// Le cercle montre ce qui sera gardé ; l'image couvre toujours tout le cercle.
const FRAME = 280
const MAX_ZOOM = 4

export default function PhotoCropper({ file, onCancel, onDone }) {
  const [source, setSource] = useState(null) // { img, url }
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 }) // coin haut-gauche de l'image dans le cadre
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const pointers = useRef(new Map())
  const pinch = useRef(null)

  useEffect(() => {
    let loaded
    loadImage(file)
      .then((s) => {
        loaded = s
        setSource(s)
      })
      .catch(() => setError('Cette image ne peut pas être lue. Essaie une autre photo.'))
    return () => loaded && URL.revokeObjectURL(loaded.url)
  }, [file])

  const w = source?.img.naturalWidth ?? 1
  const h = source?.img.naturalHeight ?? 1
  const base = FRAME / Math.min(w, h) // échelle qui couvre juste le cadre
  const scale = base * zoom

  // L'image doit toujours recouvrir le cadre
  const clamp = (p, s = scale) => ({
    x: Math.min(0, Math.max(FRAME - w * s, p.x)),
    y: Math.min(0, Math.max(FRAME - h * s, p.y)),
  })

  // Centrage au chargement
  useEffect(() => {
    if (source) setPos({ x: (FRAME - w * base) / 2, y: (FRAME - h * base) / 2 })
  }, [source])

  // Zoom autour du centre du cadre
  const zoomTo = (z) => {
    const next = Math.min(MAX_ZOOM, Math.max(1, z))
    const nextScale = base * next
    const cx = (FRAME / 2 - pos.x) / scale
    const cy = (FRAME / 2 - pos.y) / scale
    setZoom(next)
    setPos(clamp({ x: FRAME / 2 - cx * nextScale, y: FRAME / 2 - cy * nextScale }, nextScale))
  }

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom }
    }
  }
  const move = (e) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      zoomTo(pinch.current.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.dist))
    } else if (pointers.current.size === 1) {
      setPos((p) => clamp({ x: p.x + e.clientX - prev.x, y: p.y + e.clientY - prev.y }))
    }
  }
  const up = (e) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
  }

  const validate = async () => {
    setBusy(true)
    try {
      const blob = await cropToBlob(source.img, -pos.x / scale, -pos.y / scale, FRAME / scale)
      await onDone(blob)
    } catch {
      setError('Le recadrage n’a pas marché, réessaie.')
      setBusy(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="font-display text-3xl font-light">Recadre ta photo</h2>
      <p className="mt-2 text-sm text-white/45">Glisse pour déplacer, pince pour zoomer.</p>

      <div
        className="relative mt-6 overflow-hidden rounded-3xl bg-white/5"
        style={{ width: FRAME, height: FRAME, touchAction: 'none' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(e) => zoomTo(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08))}
      >
        {source && (
          <img
            src={source.url}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
            style={{ width: w * scale, height: h * scale, transform: `translate(${pos.x}px, ${pos.y}px)` }}
          />
        )}
        {/* Ce qui sera gardé : le cercle ; le reste est assombri */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 0 9999px rgba(18,18,18,0.6)', border: '2px solid rgba(255,255,255,0.7)' }}
        />
      </div>

      <input
        type="range"
        min={1}
        max={MAX_ZOOM}
        step={0.01}
        value={zoom}
        onChange={(e) => zoomTo(Number(e.target.value))}
        aria-label="Zoom"
        className="mt-6 w-full max-w-[280px] accent-[#FF7F7A]"
      />

      {error && <p className="mt-4 text-sm text-[#FFC29A]">{error}</p>}

      <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={validate}
          disabled={!source || busy}
          className="w-full rounded-full py-4 text-base font-bold text-ink disabled:opacity-50"
          style={{ background: gradient(TONES.souplesse, 90) }}
        >
          {busy ? 'Envoi…' : 'Valider'}
        </motion.button>
        <button onClick={onCancel} disabled={busy} className="text-sm text-white/50">
          Annuler
        </button>
      </div>
    </motion.div>
  )
}
