// Réglages des routines, stockés sur l'appareil (LocalStorage).
// Par routine : durée, exercices toujours inclus (favoris, MAX_FAVORITES au plus), exercices désactivés.
// Commun : missing = matériel que l'utilisateur n'a pas (les exercices qui en ont besoin sont retirés).
const KEY = 'iko-flex:settings'

export const DURATIONS = { souplesse: [8, 12, 15, 20, 30], renfo: [8, 12, 16, 20, 30] }
export const MIN_ENABLED = 3 // une routine garde toujours au moins 3 exercices actifs
export const MAX_FAVORITES = 3 // favoris par routine : le reste de la séance reste une surprise

const DEFAULTS = {
  souplesse: { minutes: 12, favorites: [], disabled: [] },
  renfo: { minutes: 12, favorites: [], disabled: [], level: 'auto' }, // level : 'auto' | 1 | 2 | 3
  missing: [],
}

export function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) ?? {}
    // Ancien format : un seul favori (favorite) -> liste de favoris
    const routine = (key) => {
      const { favorite, ...s } = { ...DEFAULTS[key], ...saved[key] }
      return { ...s, favorites: s.favorites?.length ? s.favorites : favorite ? [favorite] : [] }
    }
    return {
      souplesse: routine('souplesse'),
      renfo: routine('renfo'),
      missing: saved.missing ?? [],
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
