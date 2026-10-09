// Profils : une personne = des faits (conditions, sport) + les exceptions du coach.
// Les règles (éviter / adapter / privilégier) sont calculées depuis conditions.js par lib/profile.js.
//
//   posture_issues, pain_points : clés de CONDITIONS
//   sport  : clé de SPORTS
//   keys   : exercices clés, allongés en priorité quand la séance est longue
//   plan   : (optionnel) poids des zones par routine, remplace celui de ROUTINES
//   rules  : exceptions du coach, appliquées après les conditions
//     exclude_tags  : mécaniques en plus à éviter
//     force_include : mécaniques à mettre dans chaque séance qui peut en contenir
//     overrides     : par exercice { exclude, include (même si une condition l'exclut), replace_by, warning }
//
// ⚠ Ce fichier part dans le code public de l'appli : uniquement des profils fictifs ou le tien.
// Les profils de vrais amis (données de santé) iront en base sécurisée, pas ici.

export const PROFILES = {
  samy: {
    id: 'samy',
    name: 'Samy',
    sport: 'course',
    posture_issues: ['hyperlordose', 'psoas_raide', 'epaules_enroulees', 'dorsiflexion_limitee'],
    pain_points: [],
    keys: ['lunge-psoas', 'couch-stretch', 'pectoral-porte', 'soleaire'],
    rules: { exclude_tags: [], force_include: [], overrides: {} },
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
    rules: { exclude_tags: [], force_include: [], overrides: {} },
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
      force_include: ['abducteurs_renfo'],
      overrides: { 'fentes-bulgares': { replace_by: 'fente-iso' } },
    },
  },
}

export const DEFAULT_PROFILE = 'samy'
