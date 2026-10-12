// Programmes tendon : quand une douleur de tendon est déclarée, une charge progressive en 3 phases.
//   1. Calmer    : maintiens isométriques (chaque jour) -> la douleur baisse dans l'heure qui suit
//   2. Renforcer : lent et lourd, ou excentrique (un jour sur deux, le tendon se reconstruit entre deux)
//   3. Rebondir  : retour progressif des impacts et de la vitesse
// Repère de douleur, pour toutes les phases : 3/10 maximum pendant l'effort, et pas pire le lendemain matin.
// Une douleur à 5/10 ou plus après une séance renvoie en phase 1 (lib/tendon.js).
//
// exercises[] : { id, sets?, amount?, rest? } -> sets/amount/rest remplacent le dosage de l'exercice
// allow       : mécaniques à nouveau permises dans cette phase (ex. les impacts en phase 3)
// missing     : exercice idéal pas encore dans la bibliothèque (affiché au coach)
// Ce sont des programmes d'entraînement, pas un traitement : douleur qui persiste = kiné ou médecin.

const ISO = { sets: 4, amount: 45, rest: 45 } // maintien qui calme : 4 x 45 s
const ISO_SIDE = { sets: 3, amount: 45, rest: 30 } // exercice d'un côté puis de l'autre : 3 x 45 s par côté
const CALM_NOTE = 'Maintien qui calme : la gêne doit baisser pendant ou après, 3/10 maximum.'
const HEAVY_NOTE = 'Lent et lourd : 3 s pour descendre, 3 s pour remonter. Gêne 3/10 maximum, pas pire demain matin.'
const JUMP_NOTE = 'Retour des sauts : si la gêne dépasse 3/10 ou monte le lendemain, reviens à la phase Renforcer.'

const CALM = { id: 'calmer', label: 'Calmer', weeks: 2, frequency: 'Chaque jour', goal: 'Des maintiens qui calment le tendon.', note: CALM_NOTE }
const BUILD = { id: 'renforcer', label: 'Renforcer', weeks: 6, frequency: 'Un jour sur deux', goal: 'Lent et lourd : le tendon se reconstruit.', note: HEAVY_NOTE }
const BOUNCE = { id: 'rebondir', label: 'Rebondir', weeks: null, frequency: '2 à 3 fois par semaine', goal: 'Le tendon réapprend à encaisser les sauts.', note: JUMP_NOTE }

export const TENDON_PROGRAMS = {
  tendinite_rotulienne: {
    tendon: 'tendon rotulien',
    phases: [
      { ...CALM, exercises: [{ id: 'spanish-squat', ...ISO }, { id: 'chaise', ...ISO }, { id: 'fente-iso', ...ISO_SIDE }] },
      { ...BUILD, exercises: [{ id: 'squat-incline-unipodal' }, { id: 'spanish-squat', sets: 3, amount: 45, rest: 45 }, { id: 'fentes-bulgares' }, { id: 'squat' }] },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'drop-squat-stanish' }, { id: 'squat-saute', sets: 2 }, { id: 'pogo', sets: 2 }] },
    ],
  },
  femoro_patellaire: {
    tendon: 'genou (autour de la rotule)',
    phases: [
      { ...CALM, exercises: [{ id: 'chaise', ...ISO }, { id: 'clamshells' }, { id: 'gainage-lateral' }] },
      { ...BUILD, exercises: [{ id: 'step-ups' }, { id: 'monster-walks' }, { id: 'pont-fessier' }, { id: 'squat' }] },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'horloge' }, { id: 'squat-saute', sets: 2 }, { id: 'step-ups' }] },
    ],
  },
  tendinite_achille: {
    tendon: 'tendon d’Achille',
    phases: [
      { ...CALM, exercises: [{ id: 'mollet-iso', ...ISO_SIDE }, { id: 'fente-iso-soleaire', ...ISO_SIDE }, { id: 'soleaire-assis' }] },
      {
        ...BUILD,
        note: 'Descente lente sur la marche (excentrique) : 3 s pour descendre, remonte avec les deux pieds. Gêne 3/10 maximum.',
        exercises: [{ id: 'extension-jumeaux' }, { id: 'alfredson-genou-plie' }, { id: 'soleaire-assis' }],
      },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'pogo', sets: 2 }, { id: 'cloche-pied', sets: 2 }, { id: 'extension-jumeaux' }] },
    ],
  },
  achille_insertion: {
    tendon: 'tendon d’Achille (au talon)',
    phases: [
      {
        ...CALM,
        note: 'Sur sol plat : monte sur la pointe et tiens. Jamais le talon sous le niveau du pied.',
        exercises: [{ id: 'mollet-iso', ...ISO_SIDE }, { id: 'mollets-debout' }, { id: 'soleaire-assis' }],
      },
      { ...BUILD, note: 'Lent et lourd, toujours sur sol plat : 3 s pour monter, 3 s pour descendre.', exercises: [{ id: 'soleaire-assis' }, { id: 'mollets-debout' }] },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'pogo', sets: 2 }, { id: 'mollets-debout' }] },
    ],
  },
  tendinopathie_fessiere: {
    tendon: 'tendons fessiers (côté de la hanche)',
    phases: [
      { ...CALM, exercises: [{ id: 'gainage-lateral', ...ISO_SIDE }, { id: 'pont-fessier' }] },
      { ...BUILD, exercises: [{ id: 'clamshells' }, { id: 'monster-walks' }, { id: 'step-ups' }, { id: 'horloge' }] },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'skater-jumps', sets: 2 }, { id: 'horloge' }, { id: 'monster-walks' }] },
    ],
  },
  ischio_proximal: {
    tendon: 'haut des ischios',
    phases: [
      {
        ...CALM,
        note: 'Pont tenu, amplitude courte : pas de tiraillement sous la fesse. 3/10 maximum.',
        exercises: [{ id: 'pont-fessier' }, { id: 'marche-pont' }],
        missing: 'Pont tenu sur les talons, genoux peu fléchis (isométrique ischios)',
      },
      { ...BUILD, note: 'Charge progressive, amplitude qui s’ouvre petit à petit. 3/10 maximum.', exercises: [{ id: 'pont-1-jambe' }, { id: 'sl-rdl' }, { id: 'hip-thrust-kb' }] },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'nordic-sol' }, { id: 'sl-rdl' }, { id: 'skater-jumps', sets: 2 }] },
    ],
  },
  coiffe_rotateurs: {
    tendon: 'épaule (coiffe des rotateurs)',
    phases: [
      {
        ...CALM,
        note: 'Charge légère, bras sous la hauteur des épaules, sans gêne.',
        exercises: [{ id: 'band-pull-apart' }, { id: 'prone-y' }],
        missing: 'Rotation externe tenue contre un mur ou un élastique (isométrique coiffe)',
      },
      { ...BUILD, exercises: [{ id: 'tirage-horizontal' }, { id: 'prone-y' }, { id: 'wall-angels' }] },
      { ...BOUNCE, allow: ['poussee'], exercises: [{ id: 'pompes-inclinees' }, { id: 'tirage-horizontal' }, { id: 'wall-angels' }] },
    ],
  },
  epicondylite: {
    tendon: 'coude',
    phases: [
      { ...CALM, exercises: [{ id: 'band-pull-apart' }], missing: 'Poignet relevé tenu, avant-bras posé (isométrique extenseurs du poignet)' },
      { ...BUILD, exercises: [{ id: 'tirage-horizontal' }], missing: 'Extension de poignet lente avec une petite charge (excentrique)' },
      { ...BOUNCE, allow: ['appui_poignet'], exercises: [{ id: 'pompes-inclinees' }, { id: 'tirage-horizontal' }] },
    ],
  },
  pubalgie: {
    tendon: 'aine (adducteurs)',
    phases: [
      { ...CALM, exercises: [{ id: 'pallof-press' }, { id: 'gainage-lateral', ...ISO_SIDE }], missing: 'Serrer un ballon entre les genoux, tenu (isométrique adducteurs)' },
      { ...BUILD, exercises: [{ id: 'copenhague' }, { id: 'pallof-press' }, { id: 'gainage-lateral-dynamique' }] },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'skater-jumps', sets: 2 }, { id: 'horloge' }, { id: 'pallof-press' }] },
    ],
  },
  fasciite_plantaire: {
    tendon: 'voûte plantaire',
    phases: [
      { ...CALM, note: 'Montée lente sur la pointe, orteils relevés si possible. 3/10 maximum.', exercises: [{ id: 'mollet-iso', ...ISO_SIDE }, { id: 'mollets-debout' }, { id: 'soleaire-assis' }] },
      { ...BUILD, exercises: [{ id: 'extension-jumeaux' }, { id: 'soleaire-assis' }, { id: 'mollets-debout' }] },
      { ...BOUNCE, allow: ['impact'], exercises: [{ id: 'pogo', sets: 2 }, { id: 'extension-jumeaux' }] },
    ],
  },
}
