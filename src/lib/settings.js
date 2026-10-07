// Réglages des routines, stockés sur l'appareil (LocalStorage).
// Par routine : durée, exercice toujours inclus (un seul), exercices désactivés.
const KEY = 'iko-flex:settings'

export const DURATIONS = { souplesse: [5, 8, 10, 12, 15], renfo: [6, 8, 12, 16, 20] }
export const MIN_ENABLED = 3 // une routine garde toujours au moins 3 exercices actifs

const DEFAULTS = {
  souplesse: { minutes: 8, favorite: null, disabled: [] },
  renfo: { minutes: 12, favorite: null, disabled: [] },
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
