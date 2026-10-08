// Animations de l'extension de la banque d'exercices (mêmes conventions que animations.js).
// Accessoires en plus : roller { x, r } (rouleau posé au sol), roller { at, r } (tenu entre deux articulations),
// roller { x1, y1, x2, y2 } (rouleau vu de dessus, dans la longueur), cone { x } (plot au sol).

export const EXTRA_ANIMATIONS = {
  // ───────── Souplesse : hanches & chaîne postérieure ─────────

  // Sur le dos, cheville posée sur le genou opposé : les mains tirent la cuisse d'appui vers la poitrine.
  'fessier-croise': {
    view: 'side',
    base: {
      torso: -90,
      head: -90,
      armN: [80, 90],
      armF: [84, 90],
      legN: [160, 115, 115],
      legF: [140, 0, 90],
      fs: { thighN: 0.6, shinN: 0.51 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.2 },
      { pose: { armN: [150, 80], armF: [146, 82], legN: [175, 220, 220], legF: [195, 105, 195] }, hold: 3, move: 2 },
    ],
  },

  // ───────── Souplesse : hanches & bassin (2e extension) ─────────

  // Depuis la planche (mains fixes au sol) : le genou remonte sous le ventre, le pied proche vient à l'extérieur
  // de la main, le bras du même côté monte vers le plafond, retour en planche, puis l'autre côté (en alternance).
  // Hauteur du bassin fixée (y) pour que les mains ne décollent jamais.
  'spiderman-rotation': {
    view: 'side',
    base: {
      torso: 114,
      head: 108,
      armN: [0, 0],
      armF: [0, 0],
      legN: [-66, -66, 60],
      legF: [-66, -66, 60],
    },
    keys: [
      { pose: { y: 39, legN: [-66, -66, 60], legF: [-66, -66, 60], armN: [0, 0], armF: [0, 0] }, hold: 0.2, move: 0.35 },
      { pose: { x: 4, y: 45, torso: 106, head: 102, armN: [-5, -5], armF: [-5, -5], legN: [-15, -115, -60], legF: [-64, -64, 50] }, hold: 0, move: 0.35 },
      { pose: { x: 10, y: 46, torso: 103, head: 100, armN: [-12, -12], armF: [-12, -12], legN: [75, -100, 0], legF: [-64, -64, 40] }, hold: 0, move: 0.4 },
      { pose: { x: 19, y: 36, armN: [-20, -20], armF: [-22, -22], head: 110, legN: [95, -20, 90], legF: [-74, -74, 15] }, hold: 0.1, move: 0.9 },
      { pose: { x: 19, y: 36, armN: [180, 180], armF: [-21, -21], torso: 117, head: 165, legN: [95, -20, 90], legF: [-74, -74, 15] }, hold: 0.8, move: 0.9 },
      { pose: { x: 19, y: 36, armN: [-20, -20], armF: [-22, -22], head: 110, legN: [95, -20, 90], legF: [-74, -74, 15] }, hold: 0.1, move: 0.4 },
      { pose: { x: 10, y: 46, torso: 103, head: 100, armN: [-12, -12], armF: [-12, -12], legN: [75, -100, 0], legF: [-64, -64, 40] }, hold: 0, move: 0.35 },
      { pose: { x: 4, y: 45, torso: 106, head: 102, armN: [-5, -5], armF: [-5, -5], legN: [-15, -115, -60], legF: [-64, -64, 50] }, hold: 0, move: 0.35 },
      { pose: { y: 39, legN: [-66, -66, 60], legF: [-66, -66, 60], armN: [0, 0], armF: [0, 0] }, hold: 0.2, move: 0.35 },
      { pose: { x: 4, y: 45, torso: 106, head: 102, armF: [-5, -5], armN: [-5, -5], legF: [-15, -115, -60], legN: [-64, -64, 50] }, hold: 0, move: 0.35 },
      { pose: { x: 10, y: 46, torso: 103, head: 100, armF: [-12, -12], armN: [-12, -12], legF: [75, -100, 0], legN: [-64, -64, 40] }, hold: 0, move: 0.4 },
      { pose: { x: 19, y: 36, armF: [-20, -20], armN: [-22, -22], head: 110, legF: [95, -20, 90], legN: [-74, -74, 15] }, hold: 0.1, move: 0.9 },
      { pose: { x: 19, y: 36, armF: [180, 180], armN: [-21, -21], torso: 117, head: 165, legF: [95, -20, 90], legN: [-74, -74, 15] }, hold: 0.8, move: 0.9 },
      { pose: { x: 19, y: 36, armF: [-20, -20], armN: [-22, -22], head: 110, legF: [95, -20, 90], legN: [-74, -74, 15] }, hold: 0.1, move: 0.4 },
      { pose: { x: 10, y: 46, torso: 103, head: 100, armF: [-12, -12], armN: [-12, -12], legF: [75, -100, 0], legN: [-64, -64, 40] }, hold: 0, move: 0.35 },
      { pose: { x: 4, y: 45, torso: 106, head: 102, armF: [-5, -5], armN: [-5, -5], legF: [-15, -115, -60], legN: [-64, -64, 50] }, hold: 0, move: 0.35 },
    ],
  },

  // Vue de face, squat très profond, kettlebell contre la poitrine : les coudes, à l'intérieur des genoux,
  // repoussent les genoux vers l'extérieur, puis relâchent.
  'prying-squat': {
    view: 'front',
    props: [{ type: 'weight', at: ['handN', 'handF'], r: 8, dy: 3 }],
    base: {
      torso: 180,
      head: 180,
      armN: [22.9, -122.5],
      legN: [110, 0, 90],
      fs: { torso: 0.8, thighN: 0.7, thighF: 0.7, footN: 0.5, footF: 0.5 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 1.6 },
      { pose: { armN: [40, -108], legN: [104, -10, 90], fs: { thighN: 0.9, thighF: 0.9 } }, hold: 1.4, move: 1.6 },
    ],
  },

  // Vue de face, assis en 90/90 : on pousse sur les tibias pour monter à genoux, bassin tendu vers l'avant,
  // on redescend, les genoux basculent comme des essuie-glaces, et on monte de l'autre côté.
  'shin-box-lift': {
    view: 'front',
    base: {
      torso: 180,
      armN: [14, -24],
      legN: [140, 0, 90],
      legF: [-140, 0, -90],
      fs: { torso: 0.85 },
    },
    keys: [
      { pose: {}, hold: 0.2, move: 1 },
      { pose: { legN: [100, -89, 90], legF: [-302, -86.6, -90], fs: { torso: 0.85, shinN: 0.36, thighF: 0.25, shinF: 0.9 } }, hold: 0.2, move: 1.2 },
      { pose: { x: 16, legN: [33.5, -90, 90], legF: [-374.2, -86.4, -90], fs: { torso: 1, shinN: 0.36, thighF: 0.86, shinF: 0.89 } }, hold: 0.8, move: 1.2 },
      { pose: { legN: [100, -89, 90], legF: [-302, -86.6, -90], fs: { torso: 0.85, shinN: 0.36, thighF: 0.25, shinF: 0.9 } }, hold: 0.2, move: 1 },
      { pose: {}, hold: 0.2, move: 1 },
      { pose: { legN: [302, 86.6, 90], legF: [-100, 89, -90], fs: { torso: 0.85, thighN: 0.25, shinN: 0.9, shinF: 0.36 } }, hold: 0.2, move: 1.2 },
      { pose: { x: -16, legN: [374.2, 86.4, 90], legF: [-33.5, 90, -90], fs: { torso: 1, thighN: 0.86, shinN: 0.89, shinF: 0.36 } }, hold: 0.8, move: 1.2 },
      { pose: { legN: [302, 86.6, 90], legF: [-100, 89, -90], fs: { torso: 0.85, thighN: 0.25, shinN: 0.9, shinF: 0.36 } }, hold: 0.2, move: 1 },
    ],
  },

  // Vue de face, assis : la jambe tendue part vers nous (pointe de pied vers le haut). L'autre genou monte,
  // le pied passe par-dessus et se pose au sol de l'autre côté du genou tendu ; le bras opposé enlace
  // le genou plié et le tire vers l'épaule opposée, buste bien droit.
  'fessier-assis': {
    view: 'front',
    base: {
      torso: 180,
      armN: [22, 8],
      armF: [29, 90],
      legN: [200, -25.5, -60],
      legF: [0, 0, 180],
      fs: { torso: 0.9, thighN: 0.7, footN: 0.5, thighF: 0.15, shinF: 0.05, footF: 0.8 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.2 },
      { pose: { head: 186, armF: [19.8, 95], legN: [210, -20, -60], fs: { shinN: 0.87 } }, hold: 3.2, move: 2 },
    ],
  },

  // Allongé au bord du lit, une cuisse tirée contre la poitrine, l'autre jambe pend dans le vide.
  'psoas-table': {
    view: 'side',
    hipHeight: 55.5,
    props: [{ type: 'table', x1: -86, x2: 3, top: -45 }],
    base: {
      torso: -90,
      head: -90,
      armN: [140, 115],
      armF: [136, 117],
      legN: [76, 8, 80],
      legF: [200, 110, 200],
    },
    keys: [
      { pose: {}, hold: 1, move: 2.6 },
      { pose: { legN: [60, -6, 84] }, hold: 3.2, move: 2.4 },
    ],
  },

  // Vu de dessus : allongé bras en croix, un genou plié bascule de l'autre côté, la tête tourne à l'opposé.
  'torsion-colonne': {
    view: 'front',
    ground: false,
    hipHeight: 0,
    props: [{ type: 'mat', x1: -82, y1: -84, x2: 82, y2: 92 }],
    base: {
      armN: [90, 90],
      legN: [4, 0, 0],
      legF: [-4, 0, 0],
      fs: { footN: 0.3, footF: 0.3 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.6 },
      { pose: { head: 190, legF: [60, -34, -34], fs: { thighF: 0.9, shinF: 0.7 } }, hold: 3, move: 2.4 },
    ],
  },

  // Vu de dessus (grenouille) : à quatre pattes genoux très écartés, tibias parallèles ;
  // le bassin recule entre les genoux et on descend des mains sur les coudes.
  adducteurs: {
    view: 'front',
    ground: false,
    hipHeight: 0,
    props: [{ type: 'mat', x1: -78, y1: -92, x2: 78, y2: 72 }],
    base: {
      y: 0,
      torso: 180,
      armN: [170, 170],
      legN: [70, 0, 90],
      fs: { upperN: 0.15, foreN: 0.15, upperF: 0.15, foreF: 0.15, footN: 0.5, footF: 0.5 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.6 },
      { pose: { y: -13, armN: [170, 175], legN: [90, 0, 90], fs: { upperN: 0.1, foreN: 1, upperF: 0.1, foreF: 1 } }, hold: 3, move: 2.4 },
    ],
  },

  // ───────── Souplesse : dos & colonne ─────────

  // À quatre pattes : dos rond, menton rentré (rétroversion), puis dos légèrement creusé, regard devant.
  'cat-cow': {
    view: 'side',
    base: {
      torso: 108,
      head: 40,
      armN: [0, 0],
      armF: [0, 0],
      legN: [4, -90, -90],
      legF: [4, -90, -90],
      fs: { torso: 0.97 },
    },
    keys: [
      { pose: {}, hold: 0.8, move: 1.8 },
      { pose: { torso: 112, head: 130, legN: [-4, -90, -90], legF: [-4, -90, -90], fs: { torso: 1 } }, hold: 0.6, move: 1.8 },
    ],
  },

  // À genoux, coudes posés sur une chaise, mains derrière la tête : la poitrine descend vers le sol.
  'extension-thoracique': {
    view: 'side',
    props: [{ type: 'box', x1: 62, x2: 100, top: -47 }],
    base: {
      torso: 100,
      head: 96,
      armN: [90, -110],
      armF: [86, -112],
      legN: [0, -90, -90],
      legF: [0, -90, -90],
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.4 },
      { pose: { torso: 84, head: 80, armN: [117, -105], armF: [113, -107] }, hold: 2.6, move: 2.2 },
    ],
  },

  // À genoux, fesses sur les talons, bras tendus loin devant : on s'allonge en respirant.
  'grand-dorsal': {
    view: 'side',
    base: {
      torso: 100,
      head: 104,
      armN: [98, 94],
      armF: [95, 92],
      legN: [77, -90, -90],
      legF: [77, -90, -90],
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.6 },
      { pose: { x: -3, torso: 90, head: 96, armN: [96, 93], armF: [93, 91] }, hold: 3, move: 2.4 },
    ],
  },

  // Rouleau sous le haut du dos, pieds au sol, mains derrière la tête : on roule du milieu au haut du dos.
  'roller-thoracique': {
    view: 'side',
    props: [{ type: 'roller', x: -33, r: 7.5 }],
    base: {
      y: 19.7,
      torso: -100,
      head: -96,
      armN: [200, -16],
      armF: [196, -18],
      legN: [121.4, -0.7, 90],
      legF: [121.4, -0.7, 90],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 1.6 },
      { pose: { x: 9, y: 20.5, legN: [117.1, -17.5, 90], legF: [117.1, -17.5, 90] }, hold: 0.3, move: 1.6 },
    ],
  },

  // Vu depuis la tête, dans l'axe du rouleau (rouleau = disque sous le dos) : allongé dessus, genoux pliés,
  // les bras partent du plafond et s'ouvrent en croix jusqu'au sol, la poitrine s'ouvre avec la gravité.
  'roller-pectoral': {
    view: 'front',
    hipHeight: 25.5,
    legOpacity: 0.3,
    barWidth: 18,
    props: [{ type: 'roller', x: 0, r: 7.5 }],
    base: {
      torso: 180,
      head: 180,
      armN: [178, 178],
      legN: [160, 10, 90],
      fs: { torso: 0.05, head: 0.05, thighN: 0.4, thighF: 0.4, footN: 0.3, footF: 0.3 },
    },
    keys: [
      { pose: {}, hold: 0.6, move: 3 },
      { pose: { armN: [70, 66] }, hold: 3.6, move: 2.4 },
    ],
  },

  // Assis, mains au sol derrière, mollet sur le rouleau : on roule du haut au bas du mollet.
  'roller-mollets': {
    view: 'side',
    props: [{ type: 'roller', x: 50, r: 6.5 }],
    base: {
      y: 14,
      torso: 210,
      armN: [-6, -14],
      armF: [-10, -16],
      legN: [95, 95, 180],
      legF: [130, 0, 90],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 2 },
      { pose: { x: -22, legN: [95, 95, 150] }, hold: 0.4, move: 2 },
    ],
  },

  // Vue de face, sur le côté en appui sur l'avant-bras, rouleau sous l'extérieur de la cuisse.
  'roller-tfl': {
    view: 'front',
    props: [{ type: 'roller', x: 20, r: 7.5 }],
    base: {
      y: 30,
      torso: -108,
      pelvis: -100,
      head: -100,
      armN: [0, 90],
      armF: [20, 0],
      legN: [90, 90, 175],
      legF: [90, 0, 90],
      fs: { upperN: 0.9, foreN: 0.25, footF: 0.5 },
    },
    keys: [
      { pose: {}, hold: 0.3, move: 1.8 },
      { pose: { x: -14 }, hold: 0.3, move: 1.8 },
    ],
  },

  // Planche sur les coudes, rouleau sous les cuisses : on roule de la hanche au-dessus du genou.
  'roller-quadriceps': {
    view: 'side',
    props: [{ type: 'roller', x: -19, r: 7.5 }],
    base: {
      y: 24,
      torso: 99,
      head: 96,
      armN: [-8, 90],
      armF: [-8, 90],
      legN: [-88, -88, -10],
      legF: [-88, -88, -10],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 1.8 },
      { pose: { x: 10, armN: [-20, 90], armF: [-20, 90] }, hold: 0.3, move: 1.8 },
    ],
  },

  // ───────── Souplesse : épaules ─────────

  // Vue de face, élastique derrière le dos : les bras s'ouvrent et partent en arrière, poitrine ouverte.
  'pectoraux-elastique': {
    view: 'front',
    props: [{ type: 'band', from: 'handN', to: 'handF' }],
    base: { armN: [70, 70], legN: [5, 0, 90], fs: { upperN: 0.55, foreN: 0.55, upperF: 0.55, foreF: 0.55 } },
    keys: [
      { pose: {}, hold: 0.6, move: 2 },
      { pose: { armN: [78, 80], fs: { upperN: 1, foreN: 1, upperF: 1, foreF: 1 } }, hold: 3, move: 2 },
    ],
  },

  // ───────── Souplesse : mollets & chevilles ─────────

  // Fente face au mur, mains au mur, jambe arrière tendue talon au sol : on avance le bassin.
  jumeaux: {
    view: 'side',
    props: [{ type: 'wall', x: 63 }],
    base: {
      torso: 170,
      armN: [56, 104],
      armF: [52, 102],
      legN: [-22, -22, 90],
      legF: [29.5, 9.7, 90],
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2 },
      { pose: { x: 5, torso: 167, armN: [62, 112], armF: [58, 110], legN: [-26.2, -26.2, 90], legF: [36.6, -4.6, 90] }, hold: 2.8, move: 2 },
    ],
  },

  // Chien tête en bas (V inversé), mains et pieds au sol : on pédale, un talon se plaque au sol
  // pendant que l'autre genou plie, en alternance.
  'chien-tete-en-bas': {
    view: 'side',
    base: {
      torso: 50,
      head: 32,
      armN: [50, 50],
      armF: [50, 50],
      legN: [2, -50.1, 50],
      legF: [-23, -23, 90],
    },
    keys: [
      { pose: {}, hold: 0.5, move: 1.2 },
      { pose: { legN: [-23, -23, 90], legF: [2, -50.1, 50] }, hold: 0.5, move: 1.2 },
    ],
  },

  // À genoux assis sur les talons, dessus des pieds au sol : on se penche en arrière sur les mains.
  'tibial-anterieur': {
    view: 'side',
    base: {
      torso: 180,
      armN: [10, 30],
      armF: [6, 28],
      legN: [77, -90, -90],
      legF: [77, -90, -90],
    },
    keys: [
      { pose: {}, hold: 0.8, move: 2.4 },
      { pose: { torso: 208, head: 200, armN: [-10, -14], armF: [-14, -16], legN: [70, -82, -90], legF: [70, -82, -90] }, hold: 3, move: 2.2 },
    ],
  },

  // ───────── Renfo : tronc ─────────

  // Deadbug : une main presse le rouleau contre le genou opposé, l'autre bras et l'autre jambe s'allongent.
  'deadbug-press': {
    view: 'side',
    props: [{ type: 'roller', at: ['handN', 'kneeF'], r: 5.5 }],
    base: {
      torso: -90,
      head: -90,
      armN: [167.6, 91.5],
      armF: [180, 180],
      legN: [180, 90, 180],
      legF: [195, 105, 195],
    },
    keys: [
      { pose: {}, hold: 0.5, move: 1.6 },
      { pose: { armF: [268, 266], legN: [97, 93, 150] }, hold: 1, move: 1.6 },
    ],
  },

  // Sur le dos, genoux pliés : on les ramène vers la poitrine jusqu'à décoller les fesses, sans élan.
  'crunch-inverse': {
    view: 'side',
    base: {
      torso: -90,
      head: -90,
      armN: [90, 90],
      armF: [86, 90],
      legN: [180, 90, 180],
      legF: [180, 90, 180],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1.4 },
      { pose: { torso: -76, head: -80, armN: [76, 90], armF: [72, 90], legN: [218, 140, 230], legF: [218, 140, 230] }, hold: 0.6, move: 2 },
    ],
  },

  // Planche sur les coudes, corps aligné : fesses serrées, ventre rentré (respiration calme).
  'gainage-simple': {
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
      { pose: {}, hold: 1.6, move: 1.2 },
      { pose: { torso: 99, head: 97, legN: [-81, -82, 0], legF: [-81, -82, 0] }, hold: 1.6, move: 1.2 },
    ],
  },

  // Planche sur les coudes -> on monte sur une main puis l'autre -> on redescend, bassin fixe.
  'gainage-militaire': {
    view: 'side',
    base: {
      x: 5,
      torso: 101,
      head: 98,
      armN: [0, 90],
      armF: [0, 90],
      legN: [-79, -79, 60],
      legF: [-79, -79, 60],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 0.7 },
      { pose: { x: 2, torso: 107, head: 104, armN: [-4, 0], armF: [0, 60], legN: [-73, -73, 60], legF: [-73, -73, 60] }, hold: 0.1, move: 0.6 },
      { pose: { x: 0, torso: 114, head: 110, armN: [0, 0], armF: [0, 0], legN: [-66, -66, 60], legF: [-66, -66, 60] }, hold: 0.4, move: 0.7 },
      { pose: { x: 2, torso: 107, head: 104, armN: [0, 60], armF: [-4, 0], legN: [-73, -73, 60], legF: [-73, -73, 60] }, hold: 0.1, move: 0.6 },
    ],
  },

  // Vue de face, gainage latéral sur un coude : le bassin monte jusqu'à aligner le corps.
  'gainage-lateral': {
    view: 'front',
    base: {
      torso: -120,
      head: -112,
      armN: [0, 0],
      armF: [150, 150],
      legN: [88, 90, 178],
      legF: [88, 90, 178],
      fs: { foreN: 0.25, footN: 0.4, footF: 0.4 },
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1.6 },
      { pose: { torso: -105, head: -100, armF: [180, 180], legN: [75, 75, 165], legF: [75, 75, 165] }, hold: 2.4, move: 1.6 },
    ],
  },

  // Vue de face, de profil à l'élastique (accroché à gauche) : on tend les bras devant soi sans tourner.
  'pallof-press': {
    view: 'front',
    props: [
      { type: 'box', x1: -104, x2: -96, top: -110 },
      { type: 'band', from: 'handF', to: [-96, -82] },
    ],
    base: {
      armN: [-15, -155],
      legN: [10, -2, 90],
      fs: { foreN: 0.69, foreF: 0.69 },
    },
    keys: [
      { pose: {}, hold: 0.5, move: 1.3 },
      { pose: { armN: [-40, -40], fs: { upperN: 0.3, foreN: 0.3, upperF: 0.3, foreF: 0.3 } }, hold: 1.4, move: 1.4 },
    ],
  },

  // ───────── Renfo : haut du corps ─────────

  // Pompes : corps gainé d'un bloc, la poitrine descend près du sol puis on repousse fort.
  pompes: {
    view: 'side',
    base: {
      torso: 114,
      head: 108,
      armN: [0, 0],
      armF: [0, 0],
      legN: [-66, -66, 60],
      legF: [-66, -66, 60],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 1.6 },
      { pose: { x: 5.7, torso: 98, head: 94, armN: [-85.8, 43], armF: [-85.8, 43], legN: [-82, -82, 60], legF: [-82, -82, 60] }, hold: 0.3, move: 1 },
    ],
  },

  // Assis jambes tendues, élastique autour des pieds : on tire les coudes en arrière, poitrine ouverte.
  'tirage-horizontal': {
    view: 'side',
    props: [{ type: 'band', from: 'handN', to: 'toeN' }],
    base: {
      torso: 176,
      armN: [88, 90],
      armF: [85, 88],
      legN: [90, 90, 175],
      legF: [90, 90, 175],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 1.2 },
      { pose: { torso: 182, armN: [-42, 88], armF: [-45, 86] }, hold: 1, move: 1.8 },
    ],
  },

  // Sur le ventre, bras en "Y" devant : les bras décollent légèrement, la tête reste au sol.
  'prone-y': {
    view: 'side',
    base: {
      torso: 90,
      head: 96,
      armN: [93, 93],
      armF: [93, 93],
      legN: [-90, -90, -20],
      legF: [-90, -90, -20],
      fs: { upperN: 0.75, foreN: 0.75, upperF: 0.75, foreF: 0.75 },
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1.2 },
      { pose: { armN: [110, 106], armF: [108, 104] }, hold: 1.2, move: 1.6 },
    ],
  },

  // Debout, haltères en main, coudes bloqués à 90° : balancier des bras de course, de plus en plus vite,
  // buste et bassin immobiles.
  'arm-drive': {
    view: 'side',
    props: [
      { type: 'weight', at: 'handN', r: 5 },
      { type: 'weight', at: 'handF', r: 5 },
    ],
    base: {
      torso: 176,
      head: 178,
      armN: [50, 140],
      armF: [-40, 50],
      legN: [10, -6, 90],
      legF: [-6, -12, 90],
    },
    keys: [
      { pose: {}, hold: 0.05, move: 0.45 },
      { pose: { armN: [-40, 50], armF: [50, 140] }, hold: 0.05, move: 0.45 },
      { pose: {}, hold: 0.05, move: 0.32 },
      { pose: { armN: [-40, 50], armF: [50, 140] }, hold: 0.05, move: 0.32 },
      { pose: {}, hold: 0.05, move: 0.22 },
      { pose: { armN: [-40, 50], armF: [50, 140] }, hold: 0.05, move: 0.22 },
      { pose: {}, hold: 0.05, move: 0.22 },
      { pose: { armN: [-40, 50], armF: [50, 140] }, hold: 0.4, move: 0.45 },
    ],
  },

  // ───────── Renfo : jambes & fessiers ─────────

  // Vue de face, couché sur le côté, genoux pliés, élastique aux genoux : le genou du dessus s'ouvre.
  clamshells: {
    view: 'front',
    props: [{ type: 'band', from: 'kneeN', to: 'kneeF' }],
    base: {
      torso: -90,
      pelvis: -90,
      head: -96,
      armN: [-90, -90],
      armF: [8, 20],
      legN: [90, 90, 160],
      legF: [95, 66, 160],
      fs: { thighN: 0.7, shinN: 0.7, thighF: 0.7, shinF: 0.8, footN: 0.5, footF: 0.5 },
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1.2 },
      { pose: { legF: [135, 50, 160], fs: { shinF: 1 } }, hold: 1, move: 1.6 },
    ],
  },

  // Pont fessier tenu en haut : un genou monte, puis l'autre, le bassin reste haut et droit.
  'marche-pont': {
    view: 'side',
    base: {
      x: -5.9,
      torso: -62,
      head: -70,
      armN: [72, 90],
      armF: [72, 90],
      legN: [97, -12, 90],
      legF: [97, -12, 90],
    },
    keys: [
      { pose: {}, hold: 0.2, move: 0.8 },
      { pose: { legF: [170, 80, 170] }, hold: 0.5, move: 0.8 },
      { pose: {}, hold: 0.2, move: 0.8 },
      { pose: { legN: [170, 80, 170] }, hold: 0.5, move: 0.8 },
    ],
  },

  // Debout -> grand pas en arrière : genou arrière près du sol, buste droit, puis on revient.
  'fentes-arriere': {
    view: 'side',
    base: { armN: [-20, 40], armF: [-24, 36] },
    keys: [
      { pose: {}, hold: 0.4, move: 1.6 },
      { pose: { x: -33, torso: 176, legN: [85.7, -7.8, 90], legF: [-29.7, -95, 50] }, hold: 0.5, move: 1.4 },
    ],
  },

  // Fente tenue, genou arrière à 5 cm du sol : on serre le fessier arrière (bassin en rétroversion).
  'fente-iso': {
    view: 'side',
    base: {
      x: -33,
      torso: 176,
      armN: [-20, 40],
      armF: [-24, 36],
      legN: [85.7, -7.8, 90],
      legF: [-29.7, -95, 50],
    },
    keys: [
      { pose: {}, hold: 1.4, move: 1.4 },
      { pose: { x: -32, torso: 180, legF: [-31, -95, 50] }, hold: 1.8, move: 1.4 },
    ],
  },

  // Dos plaqué au mur, on glisse jusqu'aux genoux à 90° et on tient.
  chaise: {
    view: 'side',
    props: [{ type: 'wall', x: -11 }],
    base: {
      armN: [8, 10],
      armF: [4, 8],
      legN: [24.6, 22.7, 90],
      legF: [24.6, 22.7, 90],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 2 },
      { pose: { legN: [89.2, -3.2, 90], legF: [89.2, -3.2, 90], armN: [60, 80], armF: [56, 78] }, hold: 3.2, move: 1.8 },
    ],
  },

  // Sur une jambe, buste qui bascule : la main touche le plot devant, jambe libre alignée avec le dos.
  'sl-rdl': {
    view: 'side',
    props: [{ type: 'cone', x: 38 }],
    base: { armN: [4, 0], armF: [0, -2], legF: [-4, -30, 60] },
    keys: [
      { pose: {}, hold: 0.4, move: 1.8 },
      { pose: { x: -14, torso: 97, head: 100, armN: [0, 0], armF: [-4, -4], legN: [38.4, -15.4, 90], legF: [-83, -83, -10] }, hold: 0.5, move: 1.6 },
    ],
  },

  // ───────── Renfo : mollets & tibias ─────────

  // Dos au mur, pieds avancés : on relève les pointes de pieds, puis on redescend lentement.
  'tibialis-raises': {
    view: 'side',
    props: [{ type: 'wall', x: -27 }],
    base: {
      torso: 194,
      head: 188,
      armN: [-6, 0],
      armF: [-10, -4],
      legN: [15, 15, 105],
      legF: [15, 15, 105],
    },
    keys: [
      { pose: {}, hold: 0.3, move: 0.8 },
      { pose: { legN: [15, 15, 150], legF: [15, 15, 150] }, hold: 0.4, move: 2 },
    ],
  },

  // Marche sur les talons, pointes de pieds relevées, jambes tendues.
  'marche-talons': {
    view: 'side',
    base: {
      armN: [-20, -10],
      armF: [20, 40],
      legN: [16, 16, 140],
      legF: [-14, -14, 140],
    },
    keys: [
      { pose: {}, hold: 0.05, move: 0.5 },
      { pose: { armN: [20, 40], armF: [-20, -10], legN: [-14, -14, 140], legF: [16, 16, 140] }, hold: 0.05, move: 0.5 },
    ],
  },

  // Assis sur une chaise, kettlebell sur un genou : montée rapide sur la pointe, descente très lente retenue (excentrique).
  'soleaire-assis': {
    view: 'side',
    hipHeight: 39.5,
    props: [
      { type: 'box', x1: -30, x2: 6, top: -33 },
      { type: 'weight', at: 'kneeN', r: 6.5, dy: -10 },
    ],
    base: {
      torso: 172,
      armN: [40, 30],
      armF: [36, 28],
      legN: [87.3, -2.3, 90],
      legF: [87.3, -2.3, 90],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 0.6 },
      { pose: { legN: [98, 2.3, 50] }, hold: 0.6, move: 3.6 },
    ],
  },

  // Sur une jambe au bord d'une marche, jambe tendue : on monte sur la pointe, puis on descend lentement sous la marche.
  'extension-jumeaux': {
    view: 'side',
    props: [
      { type: 'box', x1: -40, x2: 6, top: -20 },
      { type: 'wall', x: 46 },
    ],
    base: {
      y: 95.8,
      x: -5,
      armN: [72, 88],
      armF: [8, 10],
      legN: [0, 0, 90],
      legF: [-6, -70, -15],
    },
    keys: [
      { pose: { y: 89.4, x: -3, legN: [0, 0, 125] }, hold: 0.5, move: 1 },
      { pose: { y: 102.1, x: -3, armN: [66, 82], legN: [0, 0, 55] }, hold: 0.4, move: 2.4 },
    ],
  },

  // ───────── Renfo : pliométrie & équilibre ─────────

  // Sur un pied : on fléchit pour toucher les plots avec l'autre pied, devant, sur le côté, derrière.
  horloge: {
    view: 'side',
    props: [
      { type: 'cone', x: 52 },
      { type: 'cone', x: -54 },
    ],
    base: { armN: [30, 50], armF: [-20, 30], legF: [-4, -40, 50] },
    keys: [
      { pose: {}, hold: 0.2, move: 1 },
      { pose: { x: -6, torso: 168, legN: [36.5, -27.4, 90], legF: [42.1, 40.4, 120] }, hold: 0.4, move: 1 },
      { pose: {}, hold: 0.2, move: 1 },
      { pose: { torso: 174, legN: [31.4, -33.4, 90], legF: [35.6, -23.1, 90], fs: { thighF: 0.55, shinF: 0.55 } }, hold: 0.4, move: 1 },
      { pose: {}, hold: 0.2, move: 1 },
      { pose: { x: 6, torso: 162, legN: [28, -41.5, 90], legF: [-42.2, -43.8, 20] }, hold: 0.4, move: 1 },
    ],
  },

  // Vue de face : petits sauts sur une jambe en zigzag de part et d'autre du plot, réception silencieuse.
  'cloche-pied': {
    view: 'front',
    props: [{ type: 'cone', x: 0 }],
    base: {
      x: -25,
      y: 72,
      armN: [20, -20],
      armF: [-20, 20],
      legN: [12, -8, 90],
      legF: [-30, 20, -90],
      fs: { shinF: 0.35, footF: 0.4 },
    },
    keys: [
      { pose: {}, hold: 0.1, move: 0.25 },
      { pose: { x: -11, y: 84, legN: [4, -2, 90] }, hold: 0, move: 0.25 },
      { pose: { x: 3 }, hold: 0.1, move: 0.25 },
      { pose: { x: -11, y: 84, legN: [4, -2, 90] }, hold: 0, move: 0.25 },
    ],
  },

  // Petits sauts pieds joints, jambes presque tendues, sur l'avant du pied : contact très court.
  pogo: {
    view: 'side',
    base: {
      y: 79,
      armN: [10, 30],
      armF: [-10, 20],
      legN: [6, -4, 60],
      legF: [4, -6, 60],
    },
    keys: [
      { pose: {}, hold: 0.05, move: 0.22 },
      { pose: { y: 86, legN: [2, 0, 50], legF: [0, -2, 50] }, hold: 0.02, move: 0.22 },
    ],
  },

  // Vue de face : bonds latéraux d'un pied sur l'autre, la jambe libre croise derrière, genou dans l'axe.
  'skater-jumps': {
    view: 'front',
    props: [{ type: 'cone', x: 0 }],
    base: {
      x: 30,
      y: 66,
      torso: 172,
      armN: [-30, -20],
      armF: [-50, -40],
      legN: [16, -14, 90],
      legF: [12, -30, -90],
      fs: { shinF: 0.6, thighF: 0.9, footF: 0.4 },
    },
    keys: [
      { pose: {}, hold: 0.2, move: 0.35 },
      { pose: { x: 0, y: 84, torso: 180, armN: [20, 10], armF: [-20, -10], legN: [6, 0, 90], legF: [-6, 0, -90], fs: { shinF: 1, thighF: 1, footF: 1 } }, hold: 0, move: 0.35 },
      { pose: { x: -30, torso: 188, armN: [50, 40], armF: [30, 20], legN: [-12, 30, 90], legF: [-16, 14, -90], fs: { shinN: 0.6, thighN: 0.9, footN: 0.4, shinF: 1, thighF: 1, footF: 1 } }, hold: 0.2, move: 0.35 },
      { pose: { x: 0, y: 84, torso: 180, armN: [20, 10], armF: [-20, -10], legN: [6, 0, 90], legF: [-6, 0, -90], fs: { shinF: 1, thighF: 1, footF: 1 } }, hold: 0, move: 0.35 },
    ],
  },
}
