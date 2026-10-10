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

  // Debout, kettlebell sur le bout du pied : le genou monte à l'horizontale, pied armé, bassin en rétroversion.
  'psoas-march': {
    view: 'side',
    props: [{ type: 'weight', at: 'toeN', r: 5.5, dx: -3, dy: -6 }],
    base: {
      armN: [-24, 58],
      armF: [-28, 54],
      legN: [2, 0, 90],
      legF: [-2, 0, 90],
    },
    keys: [
      { pose: {}, hold: 0.4, move: 1 },
      { pose: { torso: 182, legN: [90, 2, 108] }, hold: 0.9, move: 1.8 },
    ],
  },

  // ───────── Renfo : mollets & tibias ─────────

  // Fente, kettlebell en goblet : le genou avant avance, le talon avant décolle au maximum, et on tient.
  'fente-iso-soleaire': {
    view: 'side',
    props: [{ type: 'weight', at: ['handN', 'handF'], r: 8, dy: 5 }],
    base: {
      torso: 180,
      armN: [8, 130],
      armF: [5, 127],
      legN: [49.9, -0.1, 90],
      legF: [-40.8, -42.7, 50],
    },
    keys: [
      { pose: {}, hold: 0.5, move: 1.6 },
      { pose: { x: 3, torso: 182, legN: [63.7, -7.8, 45], legF: [-43.5, -45.4, 50] }, hold: 3, move: 1.4 },
    ],
  },

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

  // ═════════ Bibliothèque générale (classiques pour tous) ═════════

  // Assis jambes tendues : le buste se plie depuis les hanches, les mains vont chercher les pieds.
  'pince-assise': {
    view: 'side',
    base: { torso: 172, head: 170, armN: [11.2, 35.2], armF: [9.8, 31.9], legN: [90, 90, 175], legF: [90, 90, 175] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.4 },
      { pose: { torso: 118, head: 108, armN: [32.8, 98.7], armF: [28.1, 99] }, hold: 3, move: 2.2 },
    ],
  },

  // Debout jambes tendues : le buste descend vers les pieds, bras pendants.
  'pince-debout': {
    view: 'side',
    keys: [
      { pose: {  }, hold: 0.8, move: 2.4 },
      { pose: { x: -15.4, torso: 55, head: 30, armN: [-39.8, 47.6], armF: [41.3, -46.2], legN: [12, 12, 90], legF: [12, 12, 90] }, hold: 3, move: 2.2 },
    ],
  },

  // Debout, jambe proche croisée devant : le buste descend vers les pieds.
  'pince-debout-croisee': {
    view: 'side',
    base: { legN: [-6, -6, 90], legF: [6, 6, 90] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.4 },
      { pose: { x: -15.4, torso: 55, head: 30, armN: [-39.8, 47.6], armF: [41.3, -46.2], legN: [9, 9, 90], legF: [15, 15, 90] }, hold: 3, move: 2.2 },
    ],
  },

  // Allongé sur le dos, sangle sous le pied : la jambe tendue monte vers la verticale, l’autre reste au sol.
  'ischio-sangle': {
    view: 'side',
    props: [{ type: 'band', from: 'handN', to: 'toeN' }],
    base: { torso: -90, head: -90, armN: [150, 120], armF: [146, 118], legN: [140, 140, 230], legF: [90, 90, 180] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.4 },
      { pose: { armN: [168, 150], armF: [164, 148], legN: [174, 174, 262] }, hold: 3, move: 2.2 },
    ],
  },

  // Debout, talon posé sur une chaise, jambe tendue : le buste se penche, les mains vont vers le pied.
  'ischio-pied-sureleve': {
    view: 'side',
    props: [{ type: 'box', x1: 56, x2: 92, top: -44 }],
    base: { armN: [10, 14], armF: [6, 10], legN: [65.6, 65.6, 165], legF: [-3, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.4 },
      { pose: { torso: 128, head: 118, armN: [21.3, 19.3], armF: [18.3, 16.3] }, hold: 3, move: 2.2 },
    ],
  },

  // Vue de face, assis plantes de pieds collées : les genoux descendent vers le sol.
  'papillon': {
    view: 'front',
    base: { torso: 180, armN: [-8, -14], legN: [122, -53.4, 180], fs: { torso: 1, thighN: 0.8, thighF: 0.8, shinN: 1, shinF: 1, footN: 0.3, footF: 0.3 } },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.6 },
      { pose: { legN: [98, -73.3, 180], fs: { torso: 0.9, shinN: 1, shinF: 1 } }, hold: 3, move: 2.4 },
    ],
  },

  // À plat ventre, mains sous les épaules : les bras poussent doucement le buste vers le haut, hanches au sol.
  'cobra': {
    view: 'side',
    base: { torso: 92, head: 96, armN: [-101.6, 60.3], armF: [-111.7, 48], legN: [-90, -90, -20], legF: [-90, -90, -20] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.4 },
      { pose: { torso: 120, head: 128, armN: [-49.1, 62.1], armF: [-52.9, 58.5] }, hold: 2.8, move: 2.2 },
    ],
  },

  // Vu de dessus, allongé sur le côté : la main du dessus ramène le talon vers la fesse, la hanche avance.
  'quadri-allonge': {
    view: 'side',
    ground: false,
    hipHeight: 0,
    props: [{ type: 'mat', x1: -90, y1: -22, x2: 95, y2: 30 }],
    base: { torso: -90, head: -90, armN: [100, 80], armF: [-90, -90], legN: [86, -55, -140], legF: [90, 90, 180] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.2 },
      { pose: { armN: [72.1, 74.3], legN: [80, -75.5, -150] }, hold: 3, move: 2.2 },
    ],
  },

  // Vue de face : un bras tendu passe devant la poitrine, l’autre avant-bras le ramène vers soi.
  'epaule-croise': {
    view: 'front',
    base: { armN: [8, 8], armF: [-8, -8], legN: [4, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.6, move: 1.8 },
      { pose: { armN: [-88, -90], armF: [22, 158], fs: { upperN: 0.8, foreN: 0.8 } }, hold: 3, move: 1.8 },
    ],
  },

  // Vue de face : coude plié derrière la tête, l’autre main pousse doucement le coude.
  'triceps-tete': {
    view: 'front',
    base: { armN: [8, 8], armF: [-8, -8], legN: [4, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.5, move: 1.6 },
      { pose: { armN: [180, 180] }, hold: 0.2, move: 1.2 },
      { pose: { head: 186, armN: [192, -20], armF: [189.7, 85.3] }, hold: 3, move: 1.8 },
    ],
  },

  // À genoux, mains au sol (doigts vers les genoux) : les fesses reculent doucement, mains fixes.
  'poignets': {
    view: 'side',
    base: { torso: 108, head: 70, armN: [0, 0], armF: [0, 0], legN: [4, -90, -90], legF: [4, -90, -90] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.2 },
      { pose: { x: -8, torso: 104, head: 78, armN: [7.5, 7.5], armF: [7.5, 7.5], legN: [16.8, -90, -90], legF: [16.8, -90, -90] }, hold: 2.6, move: 2 },
    ],
  },

  // De profil, mains croisées derrière la tête : le menton descend doucement vers la poitrine.
  'nuque': {
    view: 'side',
    base: { armN: [-87.9, 134.9], armF: [-91.9, 133.7], legN: [3, 0, 90], legF: [-3, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2.2 },
      { pose: { head: 145, armN: [239, 100.4], armF: [235.1, 99.4] }, hold: 3, move: 2 },
    ],
  },

  // Vue de face : un bras passe au-dessus de la tête et le buste s’incline de l’autre côté, bassin fixe.
  'lateral-debout': {
    view: 'front',
    base: { pelvis: 180, armN: [8, 8], armF: [-20, 30], legN: [7, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.6, move: 1.8 },
      { pose: { torso: 198, head: 202, armN: [196, 222], armF: [-34, 20] }, hold: 3, move: 2 },
    ],
  },

  // De profil, main au mur derrière soi, bras tendu : on s’avance doucement pour étirer l’avant du bras.
  'biceps-mur': {
    view: 'side',
    props: [{ type: 'wall', x: -58 }],
    base: { armN: [-80, -80], armF: [6, 10], legN: [8, 0, 90], legF: [-6, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.8, move: 2 },
      { pose: { x: -3, torso: 172, head: 170, armN: [-92, -92] }, hold: 3, move: 2 },
    ],
  },

  // Squat poids du corps : les fesses descendent en arrière, bras devant pour l’équilibre.
  'squat': {
    view: 'side',
    base: { armN: [12, 18], armF: [8, 14], legN: [0, 0, 90], legF: [0, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.4, move: 1.6 },
      { pose: { x: -22, torso: 150, head: 162, armN: [88, 92], armF: [84, 88], legN: [77.9, -21.4, 90], legF: [76, -22, 90] }, hold: 0.6, move: 1.2 },
    ],
  },

  // Grand pas en avant, genou arrière près du sol, puis on repousse pour revenir.
  'fentes-avant': {
    view: 'side',
    base: { armN: [-20, 40], armF: [-24, 36] },
    keys: [
      { pose: {  }, hold: 0.4, move: 1.4 },
      { pose: { x: 30, torso: 176, legN: [85.7, -7.8, 90], legF: [-29.7, -95, 50] }, hold: 0.5, move: 1.4 },
    ],
  },

  // Sur le dos, pieds au sol : le bassin monte en serrant les fessiers, puis redescend.
  'pont-fessier': {
    view: 'side',
    base: { torso: -90, head: -90, armN: [90, 90], armF: [90, 90], legN: [140, 0, 90], legF: [140, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.4, move: 1.2 },
      { pose: { x: -5.9, torso: -62, head: -70, armN: [72, 90], armF: [72, 90], legN: [97, -12, 90], legF: [97, -12, 90] }, hold: 1.2, move: 1.6 },
    ],
  },

  // Haut du dos sur une chaise, kettlebell sur les hanches : le bassin monte jusqu’à l’horizontale.
  'hip-thrust-kb': {
    view: 'side',
    props: [{ type: 'box', x1: -78, x2: -36, top: -33 }, { type: 'weight', at: 'hip', r: 7, dy: -11 }],
    base: { y: 12, x: 0, torso: -128, head: -118, armN: [88.8, 34.8], armF: [88.8, 34.8], legN: [132.1, 19.2, 90], legF: [132.1, 19.2, 90] },
    keys: [
      { pose: {  }, hold: 0.4, move: 1.2 },
      { pose: { y: 40.2, x: 10.5, torso: -93, head: -110, armN: [105.3, 85.7], armF: [105.3, 85.7], legN: [87.4, -13.6, 90], legF: [87.4, -13.6, 90] }, hold: 1.2, move: 1.8 },
    ],
  },

  // Debout : montée sur la pointe des pieds, on tient, puis on redescend lentement.
  'mollets-debout': {
    view: 'side',
    base: { armN: [6, 8], armF: [-6, -4], legN: [2, 0, 90], legF: [-2, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.3, move: 0.8 },
      { pose: { legN: [2, 0, 45], legF: [-2, 0, 45] }, hold: 0.8, move: 1.6 },
    ],
  },

  // À plat ventre : bras, poitrine et jambes décollent ensemble, puis se reposent.
  'superman': {
    view: 'side',
    base: { torso: 90, head: 94, armN: [93, 93], armF: [93, 93], legN: [-90, -90, -20], legF: [-90, -90, -20], fs: { upperN: 1, foreN: 1, upperF: 1, foreF: 1 } },
    keys: [
      { pose: {  }, hold: 0.4, move: 1.4 },
      { pose: { torso: 98, head: 100, armN: [104, 102], armF: [102, 100], legN: [-97, -97, -25], legF: [-97, -97, -25] }, hold: 1.4, move: 1.6 },
    ],
  },

  // Sur le dos, genoux pliés, mains aux tempes : les épaules décollent en enroulant le haut du dos.
  'crunch': {
    view: 'side',
    base: { torso: -90, head: -90, armN: [-38.3, 178.2], armF: [-27.8, -172.6], legN: [140, 0, 90], legF: [140, 0, 90] },
    keys: [
      { pose: {  }, hold: 0.3, move: 1 },
      { pose: { torso: -114, head: -124, armN: [-69.8, 152.2], armF: [-61.2, 156.3] }, hold: 0.8, move: 1.6 },
    ],
  },

  // Sur le dos, mains aux tempes : un genou monte vers la poitrine pendant que l’autre jambe se tend, en alternance.
  'bicycle-crunch': {
    view: 'side',
    base: { torso: -112, head: -122, armN: [-69.8, 152.2], armF: [-61.2, 156.3], legN: [200, 110, 200], legF: [104, 104, 190] },
    keys: [
      { pose: {  }, hold: 0.2, move: 0.8 },
      { pose: { legN: [104, 104, 190], legF: [200, 110, 200] }, hold: 0.2, move: 0.8 },
    ],
  },

  // Sur le dos, jambes tendues : elles montent à la verticale puis redescendent sans toucher le sol.
  'leg-raises': {
    view: 'side',
    base: { torso: -90, head: -90, armN: [88, 90], armF: [86, 90], legN: [100, 100, 190], legF: [100, 100, 190] },
    keys: [
      { pose: {  }, hold: 0.3, move: 1.4 },
      { pose: { legN: [178, 178, 268], legF: [178, 178, 268] }, hold: 0.4, move: 2 },
    ],
  },

  // Vue de face, assis buste incliné, genoux pliés : les mains jointes vont toucher le sol d’un côté puis de l’autre.
  'russian-twist': {
    view: 'front',
    base: { torso: 180, legN: [150, 10, 90], fs: { torso: 0.9, thighN: 0.5, thighF: 0.5, shinN: 0.8, shinF: 0.8, footN: 0.4, footF: 0.4 } },
    keys: [
      { pose: { torso: 166, armN: [36.7, -25.3], armF: [61.3, 14.4] }, hold: 0.2, move: 0.7 },
      { pose: { torso: 194, armN: [-58.3, -22.8], armF: [-33.5, 29.5] }, hold: 0.2, move: 0.7 },
    ],
  },

  // En planche bras tendus : un genou vient vers la poitrine, puis l’autre, en alternance rapide.
  'mountain-climbers': {
    view: 'side',
    base: { y: 39, torso: 114, head: 108, armN: [0, 0], armF: [0, 0], legN: [-66, -66, 60], legF: [-66, -66, 60] },
    keys: [
      { pose: { legN: [55, -95, 0] }, hold: 0.1, move: 0.3 },
      { pose: { legF: [55, -95, 0] }, hold: 0.1, move: 0.3 },
    ],
  },

  // En planche bras tendus : une main touche l’épaule opposée, puis l’autre, bassin immobile.
  'shoulder-taps': {
    view: 'side',
    base: { y: 39, torso: 114, head: 108, armN: [0, 0], armF: [0, 0], legN: [-66, -66, 60], legF: [-66, -66, 60] },
    keys: [
      { pose: {  }, hold: 0.2, move: 0.5 },
      { pose: { armN: [-95.3, 62.2] }, hold: 0.3, move: 0.5 },
      { pose: {  }, hold: 0.2, move: 0.5 },
      { pose: { armF: [-95.3, 62.2] }, hold: 0.3, move: 0.5 },
    ],
  },

  // Mains sur une chaise, corps gainé : la poitrine descend vers la chaise, puis on repousse.
  'pompes-inclinees': {
    view: 'side',
    props: [{ type: 'box', x1: 18.1, x2: 52.1, top: -40 }],
    base: { y: 62.7, torso: 137, head: 131, armN: [0, 0], armF: [0, 0], legN: [-43, -43, 60], legF: [-43, -43, 60] },
    keys: [
      { pose: {  }, hold: 0.3, move: 1.6 },
      { pose: { y: 47.8, x: 12.3, torso: 122, head: 116, armN: [12.9, -84.2], armF: [12.9, -84.2], legN: [-58, -58, 60], legF: [-58, -58, 60] }, hold: 0.3, move: 1 },
    ],
  },

  // Mains au bord d’une chaise derrière soi, pieds devant : les coudes plient pour descendre, puis on remonte.
  'dips-chaise': {
    view: 'side',
    props: [{ type: 'box', x1: -46, x2: -10, top: -40 }],
    base: { y: 50, x: -2, torso: 178, head: 180, armN: [-13, -10.9], armF: [-13, -10.9], legN: [64.5, 33.2, 90], legF: [64.5, 33.2, 90] },
    keys: [
      { pose: {  }, hold: 0.3, move: 1.6 },
      { pose: { y: 28, armN: [-67.5, 31.5], armF: [-67.5, 31.5], legN: [101.2, 27.7, 90], legF: [101.2, 27.7, 90] }, hold: 0.3, move: 1 },
    ],
  },

  // Sur le dos, genoux pliés, épaules décollées : une main glisse vers le talon du même côté, puis l’autre.
  'heel-touches': {
    view: 'side',
    base: { torso: -110, head: -122, armN: [70, 80], armF: [70, 80], legN: [140, 0, 90], legF: [140, 0, 90] },
    keys: [
      { pose: { armN: [74, 75.8] }, hold: 0.2, move: 0.6 },
      { pose: { armF: [74, 75.8] }, hold: 0.2, move: 0.6 },
    ],
  },

  // Sur le dos, bras et jambes tendus décollés du sol, bas du dos plaqué : on tient.
  'hollow-hold': {
    view: 'side',
    base: { torso: -100, head: -108, armN: [-100, -100], armF: [-102, -102], legN: [104, 104, 194], legF: [104, 104, 194] },
    keys: [
      { pose: {  }, hold: 1.6, move: 1 },
      { pose: { torso: -102, legN: [106, 106, 196], legF: [106, 106, 196] }, hold: 1.6, move: 1 },
    ],
  },

  // Sur le dos, jambes tendues à la verticale : les épaules décollent, les mains vont vers les pointes de pieds.
  'toe-touch-crunch': {
    view: 'side',
    base: { torso: -90, head: -90, armN: [160, 160], armF: [156, 156], legN: [180, 180, 270], legF: [180, 180, 270] },
    keys: [
      { pose: {  }, hold: 0.3, move: 1 },
      { pose: { torso: -122, head: -140, armN: [179.7, 110.6], armF: [185.1, 106.4] }, hold: 0.5, move: 1.6 },
    ],
  },

  // Sur le dos, mains sous les fesses, jambes tendues un peu décollées : petits battements en ciseaux.
  'flutter-kicks': {
    view: 'side',
    base: { torso: -90, head: -96, armN: [88, 90], armF: [86, 90], legN: [104, 104, 194], legF: [116, 116, 206] },
    keys: [
      { pose: {  }, hold: 0, move: 0.3 },
      { pose: { legN: [116, 116, 206], legF: [104, 104, 194] }, hold: 0, move: 0.3 },
    ],
  },

  // Assis, mains au sol derrière, buste incliné : les genoux viennent vers la poitrine puis les jambes s’allongent sans toucher le sol.
  'sit-in': {
    view: 'side',
    base: { torso: 208, head: 196, armN: [-12, -12], armF: [-16, -16], legN: [104, 104, 190], legF: [104, 104, 190] },
    keys: [
      { pose: {  }, hold: 0.3, move: 1 },
      { pose: { torso: 200, legN: [158, 30, 120], legF: [158, 30, 120] }, hold: 0.3, move: 1.6 },
    ],
  },

  // Planche sur les avant-bras : un genou vient vers le coude du même côté, puis l’autre.
  'plank-genou-coude': {
    view: 'side',
    base: { y: 26, torso: 98, head: 96, armN: [0, 90], armF: [0, 90], legN: [-82, -82, 0], legF: [-82, -82, 0] },
    keys: [
      { pose: {  }, hold: 0.2, move: 0.7 },
      { pose: { legN: [40, -110, -30] }, hold: 0.4, move: 0.7 },
      { pose: {  }, hold: 0.2, move: 0.7 },
      { pose: { legF: [40, -110, -30] }, hold: 0.4, move: 0.7 },
    ],
  },

  // Vue de face, gainage sur un coude : la hanche descend vers le sol sans le toucher, puis remonte.
  'gainage-lateral-dynamique': {
    view: 'front',
    base: { torso: -105, head: -100, armN: [0, 0], armF: [-20, 40], legN: [75, 75, 165], legF: [75, 75, 165], fs: { foreN: 0.3, footN: 0.4, footF: 0.4 } },
    keys: [
      { pose: {  }, hold: 0.2, move: 0.9 },
      { pose: { torso: -113, head: -106, legN: [82, 82, 172], legF: [82, 82, 172] }, hold: 0.2, move: 0.9 },
      { pose: {  }, hold: 0.2, move: 0.9 },
      { pose: { torso: -99, head: -96, legN: [69, 69, 159], legF: [69, 69, 159] }, hold: 0.3, move: 0.9 },
    ],
  },

  // Descente en squat, puis saut le plus haut possible, et réception souple dans le squat suivant.
  'squat-saute': {
    view: 'side',
    base: { armN: [12, 18], armF: [8, 14], legN: [0, 0, 90], legF: [0, 0, 90] },
    keys: [
      { pose: { y: 79.5 }, hold: 0.1, move: 0.7 },
      { pose: { y: 48.1, x: -22, torso: 150, head: 162, armN: [-40, -20], armF: [-44, -24], legN: [77.9, -21.4, 90], legF: [76, -22, 90] }, hold: 0.2, move: 0.3 },
      { pose: { y: 101.5, armN: [170, 175], armF: [166, 172], legN: [0, 0, 30], legF: [-4, -4, 30] }, hold: 0.1, move: 0.4 },
      { pose: { y: 79.5 }, hold: 0.1, move: 0.4 },
    ],
  },

  // Vue de face : saut jambes écartées et bras en l’air, puis retour pieds joints bras le long du corps.
  'jumping-jacks': {
    view: 'front',
    base: { armN: [10, 6], legN: [3, 0, 90] },
    keys: [
      { pose: { y: 79.4 }, hold: 0.1, move: 0.2 },
      { pose: { y: 86.4, armN: [90, 95], legN: [9, 0, 120] }, hold: 0, move: 0.2 },
      { pose: { y: 78.2, armN: [165, 172], legN: [15, 0, 90] }, hold: 0.1, move: 0.2 },
      { pose: { y: 86.4, armN: [90, 95], legN: [9, 0, 120] }, hold: 0, move: 0.2 },
    ],
  },

  // Mains au sol, pieds en arrière en planche, retour accroupi, puis saut bras en l’air.
  'burpees': {
    view: 'side',
    base: { armN: [6, 8], armF: [-6, -4], legN: [2, 0, 90], legF: [-2, 0, 90] },
    keys: [
      { pose: { y: 79.5 }, hold: 0.1, move: 0.5 },
      { pose: { y: 30.3, x: -10, torso: 125, head: 120, armN: [10, 4], armF: [8, 2], legN: [118, -30, 90], legF: [116, -32, 90] }, hold: 0.1, move: 0.4 },
      { pose: { y: 39.1, x: -30, torso: 114, head: 108, armN: [0, 0], armF: [0, 0], legN: [-66, -66, 60], legF: [-66, -66, 60] }, hold: 0.2, move: 0.4 },
      { pose: { y: 30.3, x: -10, torso: 125, head: 120, armN: [10, 4], armF: [8, 2], legN: [118, -30, 90], legF: [116, -32, 90] }, hold: 0.1, move: 0.4 },
      { pose: { y: 99.5, armN: [172, 176], armF: [168, 174], legN: [0, 0, 30], legF: [-4, -4, 30] }, hold: 0.1, move: 0.4 },
    ],
  },
}
