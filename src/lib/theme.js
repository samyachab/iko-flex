// Palettes "Souffle" : chaud pour la souplesse, frais pour le renfo, neutre pour les transitions.
export const TONES = {
  souplesse: { a: '#FFC29A', b: '#FF7F7A', c: '#E07AB0', glow: 'rgba(255,127,122,0.35)' },
  renfo: { a: '#8BF1DA', b: '#5FA8FF', c: '#9D8BFF', glow: 'rgba(95,168,255,0.35)' },
  rest: { a: '#EDE7DD', b: '#BDB5A9', c: '#8F887E', glow: 'rgba(237,231,221,0.18)' },
}

// Avatars du profil : mêmes dégradés "Souffle", quelques teintes en plus
export const AVATARS = {
  aurore: { label: 'Aurore', ...TONES.souplesse },
  lagon: { label: 'Lagon', ...TONES.renfo },
  sable: { label: 'Sable', ...TONES.rest },
  braise: { label: 'Braise', a: '#FFD36E', b: '#FF8A4C', c: '#E0455B', glow: 'rgba(255,138,76,0.35)' },
  foret: { label: 'Forêt', a: '#C8F28B', b: '#5FD39A', c: '#2E9E8F', glow: 'rgba(95,211,154,0.35)' },
  nuit: { label: 'Nuit', a: '#B9A6FF', b: '#7C6CF2', c: '#4B4FD8', glow: 'rgba(124,108,242,0.35)' },
}

export const gradient = (t, angle = 135) => `linear-gradient(${angle}deg, ${t.a}, ${t.b} 55%, ${t.c})`

// Formes de morphing des blobs (border-radius à 8 valeurs)
export const SHAPES = [
  '58% 42% 37% 63% / 55% 38% 62% 45%',
  '41% 59% 62% 38% / 44% 58% 42% 56%',
  '63% 37% 45% 55% / 38% 55% 45% 62%',
  '58% 42% 37% 63% / 55% 38% 62% 45%',
]

// Courbes partagées : une sortie douce "expo", et un ressort sans rebond pour les apparitions.
export const EASE = [0.22, 1, 0.36, 1]
export const SOFT_SPRING = { type: 'spring', stiffness: 140, damping: 22, mass: 0.9 }

// Apparition en cascade : seulement opacity + transform (pas de filter: blur, trop coûteux sur mobile).
export const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease: EASE },
})
