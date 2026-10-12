// Zones sensibles (gênes, tendons) : gardées UNIQUEMENT sur le téléphone, jamais envoyées au coffre.
// Elles orientent les séances (exercices écartés, programme tendon) sans qu'aucune information sur l'état
// de santé ne quitte l'appareil. Effacées à la déconnexion. Si on change de téléphone, on les recoche
// dans le Profil (« Mes zones sensibles »).
// Format : { pain_points: ['tendinite_achille', ...], programs: { tendinite_achille: 'YYYY-MM-DD' } }
import { TENDON_PROGRAMS } from '../data/tendons.js'

export const ZONES_KEY = 'iko-flex:zones'

export function getZones() {
  try {
    const z = JSON.parse(localStorage.getItem(ZONES_KEY)) ?? {}
    return { pain_points: z.pain_points ?? [], programs: z.programs ?? {} }
  } catch {
    return { pain_points: [], programs: {} }
  }
}

// Enregistre la liste ; un programme tendon démarre le jour où sa zone est cochée
export function saveZones(pain_points) {
  const today = new Date().toISOString().slice(0, 10)
  const previous = getZones().programs
  const programs = Object.fromEntries(pain_points.filter((c) => TENDON_PROGRAMS[c]).map((c) => [c, previous[c] ?? today]))
  try {
    localStorage.setItem(ZONES_KEY, JSON.stringify({ pain_points, programs }))
  } catch {
    // stockage indisponible : les zones valent pour cette visite seulement
  }
  return { pain_points, programs }
}

// Ajoute les zones de l'appareil à une fiche (celle du coffre ne contient jamais de zone sensible)
export function withZones(data) {
  const z = getZones()
  if (!z.pain_points.length) return data
  return { ...data, pain_points: [...new Set([...(data.pain_points ?? []), ...z.pain_points])], programs: { ...z.programs, ...data.programs } }
}
