// Profils : une personne = des faits (conditions, sport) + les exceptions du coach.
// Les règles (éviter / adapter / privilégier) sont calculées depuis conditions.js par lib/profile.js.
//
//   posture_issues, pain_points : clés de CONDITIONS
//   sport  : clé de SPORTS
//   keys   : exercices clés, allongés en priorité quand la séance est longue
//   rules  : exceptions du coach, appliquées après les conditions
//     exclude_tags  : mécaniques en plus à éviter
//     force_include : mécaniques imposées, { mécanique: N } = toutes les N séances
//     adapt         : { mécanique: consigne } en plus de celles des conditions
//     favor         : { mécanique: poids } en plus de celui des conditions et du sport
//     overrides     : par exercice { exclude, include (même si une condition l'exclut), replace_by, warning }
//
//   plan   : (optionnel) { souplesse: {...}, renfo: {...} } remplace le poids des zones de ROUTINES
//
// ⚠ Ce fichier part dans le code public de l'appli : uniquement le profil général et des profils fictifs.
// Les vrais profils (données de santé) vont dans le coffre-fort ; en attendant, en local dans profiles.local.js.

export const PROFILES = {
  // Formulaire, première question "routine générale" : toute la bibliothèque, sans personnalisation
  general: {
    id: 'general',
    name: 'Routine générale',
    sport: 'aucun',
    posture_issues: [],
    pain_points: [],
    keys: [],
    rules: { exclude_tags: [], force_include: {}, overrides: {} },
  },

  // Profils fictifs pour tester le filtre dans le labo
  'test-genou': {
    id: 'test-genou',
    name: 'Test · genou + tibia',
    test: true,
    sport: 'course',
    posture_issues: [],
    pain_points: ['douleur_genou', 'periostite_tibiale'],
    keys: ['soleaire'],
    rules: { exclude_tags: [], force_include: {}, overrides: {} },
  },
  'test-dos-plat': {
    id: 'test-dos-plat',
    name: 'Test · dos plat + poignet',
    test: true,
    sport: 'yoga',
    posture_issues: ['dos_plat'],
    pain_points: ['douleur_poignet'],
    keys: [],
    rules: {
      exclude_tags: [],
      force_include: { abducteurs_renfo: 1 },
      overrides: { 'fentes-bulgares': { replace_by: 'fente-iso' } },
    },
  },
}

export const DEFAULT_PROFILE = 'general'
