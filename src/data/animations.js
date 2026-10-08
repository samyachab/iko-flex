// Animations des exercices, jouées par le personnage de src/components/Figure.jsx.
//
// Conventions (personnage de profil, tourné vers la droite) :
// - Chaque segment a un angle ABSOLU en degrés : 0 = vers le bas, 90 = vers l'avant (droite),
//   180 = vers le haut, -90 = vers l'arrière (gauche). Au-delà de 180 = penché vers l'arrière.
// - torso : du bassin vers la nuque (180 = debout). head : direction de la tête (défaut = torso).
// - armN / armF : [bras, avant-bras] du côté proche / éloigné.
// - legN / legF : [cuisse, tibia, pied]. Pied debout à plat = 90.
// - Les angles sont interpolés tels quels : choisir le signe qui donne le bon sens de rotation
//   (ex. tibia qui monte derrière : 0 -> -165, pas 0 -> 195 qui passerait par devant).
// - x : décalage horizontal du bassin. La hauteur est calculée seule (le point le plus bas touche le sol).
// - fs : raccourci de perspective par segment (ex. { shinN: 0.4 } = tibia qui pointe vers la caméra).
// - hipHeight (au niveau de l'animation) : bassin à hauteur fixe au lieu de se poser au sol.
// - y (dans une pose) : hauteur fixe du bassin pour cette pose (ex. monter sur une box).
// - ground: false + props mat : vue de dessus (personnage allongé vu d'en haut, pas de sol).
// - props : wall { x } (profil) ou mur de fond (face), table/box { x1, x2, top }, band { from, to },
//   weight { at, r, dx, dy } (charge qui suit une ou deux articulations), mat { x1, y1, x2, y2 }.
// - view 'front' : vue de face. Les membres "F" sont alors le miroir des membres "N" s'ils ne sont pas donnés.
//
// keys : poses successives. hold = pause sur la pose (s), move = durée du passage à la suivante (s).
// La boucle revient à la première pose.

import { EXTRA_ANIMATIONS } from './animations-extra.js'

export const STAND = {
  x: 0,
  torso: 180,
  armN: [6, 8],
  armF: [-6, -4],
  legN: [2, 0, 90],
  legF: [-2, 0, 90],
}

export const ANIMATIONS = {
  // Fente basse, genou arrière au sol : rétroversion + bassin vers l'avant, bras au ciel.
  'lunge-psoas': {
    view: 'side',
    base: {
      torso: 180,
      armN: [-28, 68],
      armF: [-32, 64],
      legN: [85, 0, 90],
      legF: [-10, -90, -100],
    },
    keys: [
      { pose: {}, hold: 1.2, move: 2.6 },
      {
        pose: { x: 8, torso: 186, head: 182, armN: [178, 182], armF: [172, 176], legN: [88, -14, 90], legF: [-22.6, -90, -100] },
        hold: 3.2,
        move: 2.4,
      },
    ],
  },

  // Allongé sur le dos, table top : bras et jambe opposés s'allongent, en alternance.
  deadbug: {
    view: 'side',
    base: {
      torso: -90,
      head: -90,
      armN: [180, 180],
      armF: [180, 180],
      legN: [180, 90, 180],
      legF: [180, 90, 180],
    },
    keys: [
      { pose: {}, hold: 0.6, move: 1.6 },
      { pose: { armN: [268, 266], legF: [97, 93, 150] }, hold: 1, move: 1.6 },
      { pose: {}, hold: 0.6, move: 1.6 },
      { pose: { armF: [268, 266], legN: [97, 93, 150] }, hold: 1, move: 1.6 },
    ],
  },

  // Vue de face, dos au mur : les bras glissent du "W" au "Y".
  'wall-slides': {
    view: 'front',
    props: [{ type: 'wall' }],
    base: {
      torso: 180,
      armN: [118, 178],
      legN: [4, 0, 90],
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.6 },
      { pose: { armN: [158, 166] }, hold: 0.8, move: 2.6 },
    ],
  },

  // Genou arrière au sol contre le mur, tibia plaqué au mur : on redresse le buste et on avance le bassin.
  'couch-stretch': {
    view: 'side',
    props: [{ type: 'wall', x: -17 }],
    base: {
      torso: 152,
      armN: [40, 70],
      armF: [36, 66],
      legN: [-15, 180, 180],
      legF: [85, 0, 90],
    },
    keys: [
      { pose: {}, hold: 1, move: 2.4 },
      { pose: { x: 6.2, torso: 182, armN: [-28, 68], armF: [-32, 64], legN: [-25, 180, 180], legF: [90, -10, 90] }, hold: 3, move: 2.2 },
    ],
  },

  // Debout sur une jambe : talon aux fesses, genoux serrés, bassin poussé vers l'avant.
  'quadri-debout': {
    view: 'side',
    base: { armF: [40, 70] },
    keys: [
      { pose: {}, hold: 0.6, move: 1.6 },
      { pose: { armN: [-18, -14], legN: [-5, -160, -100] }, hold: 1, move: 1.4 },
      { pose: { x: 2, torso: 182, armN: [-23, -18], legN: [-14, -166, -104] }, hold: 2.6, move: 1.6 },
    ],
  },

  // Vue de face : grand écart de jambes, on descend sur une jambe, l'autre tendue pointe vers le ciel.
  cossack: {
    view: 'front',
    base: {
      armN: [10, -120],
      legN: [28, 28, 90],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1.8 },
      { pose: { x: 23.5, legN: [63, -39, 90], legF: [-51.9, -51.9, -150] }, hold: 1.4, move: 1.8 },
      { pose: {}, hold: 0.4, move: 1.8 },
      { pose: { x: -23.5, legN: [51.9, 51.9, 150], legF: [-63, 39, -90] }, hold: 1.4, move: 1.8 },
    ],
  },

  // Fente très longue, mains au sol à l'intérieur du pied avant : le bassin descend et s'ouvre.
  spiderman: {
    view: 'side',
    base: {
      torso: 114,
      armN: [-20, -20],
      armF: [-24, -24],
      legN: [95, -20, 90],
      legF: [-74, -74, 15],
    },
    keys: [
      { pose: {}, hold: 1, move: 2.2 },
      { pose: { x: 4, torso: 118, armN: [-14, -28], armF: [-18, -30], legN: [98, -26, 90], legF: [-78, -78, 15] }, hold: 2.6, move: 2 },
    ],
  },

  // Jambe avant repliée sous le buste, jambe arrière tendue : on s'enroule vers l'avant sur les avant-bras.
  pigeon: {
    view: 'side',
    base: {
      torso: 178,
      armN: [8, 8],
      armF: [4, 4],
      legN: [84, -100, -100],
      legF: [-85, -88, -95],
      fs: { shinN: 0.75 },
    },
    keys: [
      { pose: {}, hold: 1, move: 2.6 },
      { pose: { torso: 108, head: 100, armN: [30, 90], armF: [26, 90] }, hold: 3.2, move: 2.4 },
    ],
  },

  // Vue de face, assis en appui sur les mains derrière, pieds écartés au sol :
  // pivot "essuie-glace", un genou tourne vers l'intérieur pendant que l'autre s'ouvre, en alternance.
  'hanches-9090': {
    view: 'front',
    base: {
      torso: 180,
      armN: [38, 30],
      legN: [140, 0, 90],
      legF: [-140, 0, -90],
      fs: { torso: 0.85 },
    },
    keys: [
      { pose: {}, hold: 0.3, move: 1.3 },
      {
        pose: { legN: [100, -89, 90], legF: [-302, -86.6, -90], fs: { shinN: 0.36, thighF: 0.25, shinF: 0.9 } },
        hold: 0.7,
        move: 1.3,
      },
      { pose: {}, hold: 0.3, move: 1.3 },
      {
        pose: { legN: [302, 86.6, 90], legF: [-100, 89, -90], fs: { thighN: 0.25, shinN: 0.9, shinF: 0.36 } },
        hold: 0.7,
        move: 1.3,
      },
    ],
  },

  // Assis au bord d'une table : on tend la jambe en regardant le plafond, on plie en rentrant le menton.
  'nerve-flossing': {
    view: 'side',
    hipHeight: 52,
    props: [{ type: 'table', x1: -34, x2: 30, top: -45 }],
    base: {
      torso: 168,
      head: 150,
      armN: [-10, -6],
      armF: [-14, -8],
      legN: [90, -8, 70],
      legF: [88, 4, 80],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 1.4 },
      { pose: { head: 218, torso: 178, legN: [90, 88, 150] }, hold: 0.5, move: 1.4 },
    ],
  },

  // Allongé sur le dos, l'autre jambe au sol : genou ramené à la poitrine (mains derrière la cuisse),
  // puis on tend la jambe pied vers le plafond, pointe de pied tirée vers soi.
  'ischio-actif': {
    view: 'side',
    base: {
      torso: -90,
      head: -90,
      armN: [150, 80],
      armF: [146, 82],
      legN: [200, 110, 200],
      legF: [90, 90, 180],
    },
    keys: [
      { pose: {}, hold: 0.5, move: 1.5 },
      { pose: { legN: [188, 188, 278] }, hold: 1, move: 1.5 },
    ],
  },

  // ───────── Épaules ─────────

  // Face au montant de porte, avant-bras posé dessus (bras en chandelier) :
  // on avance à travers la porte, la poitrine passe devant le montant et s'ouvre.
  'pectoral-porte': {
    view: 'side',
    props: [{ type: 'wall', x: 13, top: -168 }],
    base: {
      armN: [95, 180],
      armF: [5, 5],
      legN: [12, 0, 90],
      legF: [-8, 0, 90],
      fs: { upperN: 0.43 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 1 },
      { pose: { x: 10, torso: 177, armN: [95, 180], legN: [20, -3, 90], legF: [-12.5, -12.5, 90], fs: { upperN: 0.05 } }, hold: 0, move: 0.1 },
      { pose: { x: 11, torso: 177, armN: [-95, 180], legN: [20, -3, 90], legF: [-12.5, -12.5, 90], fs: { upperN: 0.05 } }, hold: 0, move: 1.4 },
      { pose: { x: 20, torso: 172, armN: [-95, 180], legN: [30, -5, 90], legF: [-19.7, -19.7, 90], fs: { upperN: 0.54 } }, hold: 2.8, move: 1.4 },
      { pose: { x: 11, torso: 177, armN: [-95, 180], legN: [20, -3, 90], legF: [-12.5, -12.5, 90], fs: { upperN: 0.05 } }, hold: 0, move: 0.1 },
      { pose: { x: 10, torso: 177, armN: [95, 180], legN: [20, -3, 90], legF: [-12.5, -12.5, 90], fs: { upperN: 0.05 } }, hold: 0, move: 1 },
    ],
  },

  // Vue de dos : mains jointes derrière le dos, une main tire le poignet opposé,
  // la tête s'incline vers l'épaule opposée (étirement du trapèze supérieur).
  trapezes: {
    view: 'front',
    base: {
      armN: [8, -35],
      armF: [-8, 35],
      legN: [3, 0, 90],
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2 },
      { pose: { head: 207, armN: [-24, -31], armF: [-15, 25] }, hold: 3.2, move: 2 },
    ],
  },

  // Vue de face : élastique large entre les mains, bras tendus qui passent de devant à au-dessus de la tête.
  'passages-baton': {
    view: 'front',
    props: [{ type: 'band', from: 'handN', to: 'handF' }],
    base: { armN: [30, 30], legN: [5, 0, 90] },
    keys: [
      { pose: {}, hold: 0.4, move: 1.8 },
      { pose: { armN: [158, 158] }, hold: 0.4, move: 1.8 },
    ],
  },

  // Vue depuis la tête, le long de la colonne : allongé sur le côté, épaules et genoux empilés.
  // Le bras du dessus part du bras du dessous, passe par le ciel et s'ouvre de l'autre côté
  // comme la page d'un livre ; les épaules tournent avec lui, le bassin et les genoux ne bougent pas.
  'open-book': {
    view: 'front',
    legOpacity: 0.3,
    barWidth: 22,
    base: {
      torso: -90,
      pelvis: -90,
      head: -90,
      armN: [90, 90],
      armF: [64, 64],
      legN: [100, 90, 90],
      legF: [100, 90, 90],
      fs: { torso: 0.05, head: 0.05, thighN: 0.75, thighF: 0.75, shinN: 0.12, shinF: 0.12, footN: 0.1, footF: 0.1 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.6 },
      { pose: { torso: -118, armF: [296, 296] }, hold: 2.4, move: 2.4 },
    ],
  },

  // ───────── Chevilles ─────────

  // Fente face au mur : le genou avant avance jusqu'au mur sans décoller le talon.
  'knee-to-wall': {
    view: 'side',
    props: [{ type: 'wall', x: 48 }],
    base: {
      torso: 172,
      armN: [33, 126],
      armF: [29, 124],
      legN: [45.5, 4.6, 90],
      legF: [-31.7, -33.6, 90],
    },
    keys: [
      { pose: {}, hold: 0.6, move: 1.6 },
      { pose: { x: 10, torso: 165, armN: [9, 142], armF: [6, 140], legN: [57.3, -19.4, 90], legF: [-40.7, -44.4, 90] }, hold: 1.2, move: 1.6 },
    ],
  },

  // Fente courte face au mur, mains au mur : le genou arrière plie, talon au sol.
  soleaire: {
    view: 'side',
    props: [{ type: 'wall', x: 63 }],
    base: {
      torso: 170,
      armN: [55.7, 104],
      armF: [52, 102],
      legN: [-21.6, -30, 90],
      legF: [36.4, 3.9, 90],
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2 },
      { pose: { torso: 168, armN: [54.2, 112.8], armF: [51, 110], legN: [-2.7, -57.1, 90], legF: [54.6, -9.6, 90] }, hold: 2.6, move: 2 },
    ],
  },

  // ───────── Renfo : tronc ─────────

  // À quatre pattes : bras et jambe opposés se tendent, en alternance.
  'bird-dog': {
    view: 'side',
    base: {
      torso: 110,
      head: 100,
      armN: [0, 0],
      armF: [0, 0],
      legN: [0, -90, -90],
      legF: [0, -90, -90],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1.4 },
      { pose: { armN: [95, 95], legF: [-92, -92, -100] }, hold: 1.4, move: 1.4 },
      { pose: {}, hold: 0.4, move: 1.4 },
      { pose: { armF: [95, 95], legN: [-92, -92, -100] }, hold: 1.4, move: 1.4 },
    ],
  },

  // Gainage sur les avant-bras : rétroversion du bassin, tout est serré (pulsations courtes).
  'planche-rkc': {
    view: 'side',
    base: {
      torso: 98,
      head: 96,
      armN: [0, 90],
      armF: [0, 90],
      legN: [-82, -82, 0],
      legF: [-82, -82, 0],
    },
    keys: [
      { pose: {}, hold: 1.2, move: 0.8 },
      { pose: { torso: 101, legN: [-79, -82, 0], legF: [-79, -82, 0] }, hold: 2.4, move: 0.8 },
    ],
  },

  // ───────── Renfo : haut du corps ─────────

  // Vue de face, dos au mur : bras en "but de foot" qui glissent jusqu'en haut.
  'wall-angels': {
    view: 'front',
    props: [{ type: 'wall' }],
    base: { armN: [95, 180], legN: [4, 0, 90] },
    keys: [
      { pose: {}, hold: 0.6, move: 2.2 },
      { pose: { armN: [168, 172] }, hold: 0.6, move: 2.2 },
    ],
  },

  // Vue de face : bras tendus devant (vers nous), on écarte l'élastique jusqu'en "T".
  'band-pull-apart': {
    view: 'front',
    props: [{ type: 'band', from: 'handN', to: 'handF' }],
    base: { armN: [90, 90], legN: [5, 0, 90], fs: { upperN: 0.15, foreN: 0.15, upperF: 0.15, foreF: 0.15 } },
    keys: [
      { pose: {}, hold: 0.4, move: 1.2 },
      { pose: { fs: { upperN: 1, foreN: 1, upperF: 1, foreF: 1 } }, hold: 1, move: 1.4 },
    ],
  },

  // Position de pompe bras tendus, bassin fixe : la poitrine descend entre les omoplates (omoplates serrées),
  // puis les épaules remontent en écartant les omoplates (dos qui s'arrondit).
  'pompes-scapulaires': {
    view: 'side',
    base: {
      torso: 100.9,
      head: 96,
      armN: [0, 0],
      armF: [0, 0],
      legN: [-69.2, -69.2, 0],
      legF: [-69.2, -69.2, 0],
      fs: { upperN: 0.85, foreN: 0.85, upperF: 0.85, foreF: 0.85 },
    },
    keys: [
      { pose: {}, hold: 0.5, move: 0.9 },
      { pose: { torso: 112, head: 106, fs: { torso: 1.059, upperN: 1.038, foreN: 1.038, upperF: 1.038, foreF: 1.038 } }, hold: 0.5, move: 0.9 },
    ],
  },

  // ───────── Renfo : jambes ─────────

  // Vue de face, demi-squat avec élastique aux genoux : pas latéraux.
  'monster-walks': {
    view: 'front',
    props: [{ type: 'band', from: 'kneeN', to: 'kneeF' }],
    base: { armN: [15, -110], legN: [25, -10, 90] },
    keys: [
      { pose: {}, hold: 0.2, move: 0.9 },
      { pose: { x: 6, legN: [32, -8, 90], legF: [-32, 8, -90] }, hold: 0.2, move: 0.9 },
      { pose: { x: 12 }, hold: 0.2, move: 0.9 },
      { pose: { x: 6, legN: [32, -8, 90], legF: [-32, 8, -90] }, hold: 0.2, move: 0.9 },
    ],
  },

  // Sur le dos, un pied au sol, l'autre jambe tendue : on monte le bassin.
  'pont-1-jambe': {
    view: 'side',
    base: {
      torso: -90,
      head: -90,
      armN: [90, 90],
      armF: [90, 90],
      legN: [140, 0, 90],
      legF: [140, 140, 230],
    },
    keys: [
      { pose: {}, hold: 0.5, move: 1.3 },
      { pose: { x: -5.9, torso: -62, head: -70, armN: [72, 90], armF: [72, 90], legN: [97, -12, 90], legF: [97, 97, 180] }, hold: 1.4, move: 1.3 },
    ],
  },

  // Kettlebell contre la poitrine : on descend bas, dos droit, puis on remonte.
  'goblet-squat': {
    view: 'side',
    props: [{ type: 'weight', at: ['handN', 'handF'], r: 8, dy: 5 }],
    base: {
      armN: [15, 165],
      armF: [12, 162],
      legN: [0, 0, 90],
      legF: [0, 0, 90],
    },
    keys: [
      { pose: {}, hold: 0.5, move: 1.6 },
      { pose: { x: -22, torso: 150, head: 160, armN: [45, 190], armF: [42, 187], legN: [77.9, -21.4, 90], legF: [76, -22, 90] }, hold: 0.8, move: 1.4 },
    ],
  },

  // Pied arrière sur un banc, haltères en main : on descend en contrôle sur la jambe avant.
  'fentes-bulgares': {
    view: 'side',
    props: [
      { type: 'box', x1: -82, x2: -46, top: -34 },
      { type: 'weight', at: 'handN', r: 5.5, dy: 2 },
      { type: 'weight', at: 'handF', r: 5.5, dy: 2 },
    ],
    base: {
      torso: 176,
      armN: [2, 0],
      armF: [-2, -2],
      legN: [36.6, -1, 90],
      legF: [-25.3, -96.9, -66],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1.8 },
      { pose: { x: -4, torso: 170, armN: [6, 4], armF: [2, 0], legN: [83.2, -19, 90], legF: [-39.9, -139, -66] }, hold: 0.6, move: 1.4 },
    ],
  },

  // Montée explosive sur la box, genou opposé qui monte, bras de sprinteur.
  'step-ups': {
    view: 'side',
    props: [{ type: 'box', x1: 15, x2: 65, top: -28 }],
    base: {
      x: 4,
      y: 70,
      armN: [10, 20],
      armF: [-10, 10],
      legN: [84.9, -12.6, 90],
      legF: [15.4, -33.9, 90],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 0.8 },
      { pose: { x: 31, y: 104, torso: 178, armN: [-40, 20], armF: [45, 140], legN: [13.4, -9.3, 90], legF: [95, 0, 90] }, hold: 0.5, move: 1.1 },
    ],
  },

  ...EXTRA_ANIMATIONS,
}
