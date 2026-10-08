// Réglages des routines, stockés sur l'appareil (LocalStorage).
// Par routine : durée, exercice toujours inclus (un seul), exercices désactivés.
const KEY = 'iko-flex:settings'

export const DURATIONS = { souplesse: [8, 12, 15, 20, 30], renfo: [8, 12, 16, 20, 30] }
export const MIN_ENABLED = 3 // une routine garde toujours au moins 3 exercices actifs

const DEFAULTS = {
  souplesse: { minutes: 12, favorite: null, disabled: [] },
  renfo: { minutes: 12, favorite: null, disabled: [], level: 'auto' }, // level : 'auto' | 1 | 2 | 3
}

export function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) ?? {}
    return {
      souplesse: { ...DEFAULTS.souplesse, ...saved.souplesse },
      renfo: { ...DEFAULTS.renfo, ...saved.renfo },
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // stockage indisponible : réglages valables pour cette session seulement
  }
}
