// Le savoir postural, écrit une fois : pour chaque condition, ce qu'on fait des mécaniques (mechanics.js).
//   avoid : l'exercice sort d'office s'il a une de ces mécaniques (la sécurité passe avant tout)
//   adapt : l'exercice reste, avec une consigne en plus pour cette personne
//   favor : poids ajouté à l'exercice (il revient plus souvent)
//   needs : { mécanique: N } -> un exercice de cette mécanique toutes les N séances (1 = chaque séance)
//   refer : condition qui demande l'avis d'un pro (kiné, médecin) avant de s'entraîner seul
// Le profil d'une personne ne stocke que ses conditions : les règles en découlent (lib/profile.js).
// kind : 'posture' (profile.posture_issues), 'douleur' (profile.pain_points), 'objectif' (profile.goals).
// Un besoin sans exercice pour le couvrir s'affiche « exercice à créer » dans l'espace coach.

export const CONDITIONS = {
  // ───────── Posture ─────────
  hyperlordose: {
    label: 'Hyperlordose (bassin en antéversion)',
    kind: 'posture',
    // Bassin basculé en avant : les ischios sont déjà allongés et tendus, pas courts.
    // Les étirer en maintien n'apporte rien ; il faut les renforcer et les faire glisser activement.
    avoid: ['ischio_passif', 'extension_lombaire_active', 'extension_lombaire_passive', 'jambes_tendues_levees'],
    adapt: {
      risque_cambrure: 'Pour toi : ventre rentré, fessiers serrés, ne creuse pas le bas du dos.',
      extension_lombaire: 'Pour toi : creuse à peine, insiste sur l’arrondi.',
    },
    favor: { retroversion: 2, psoas_etirement: 2, anti_extension: 1, fessier_renfo: 1, ischio_actif: 1, ischio_renfo: 1, neurodynamique: 1 },
    needs: { psoas_etirement: 1, retroversion: 1, ischio_actif: 2 },
  },
  dos_plat: {
    label: 'Dos plat (bassin en rétroversion)',
    kind: 'posture',
    // Le cas inverse : ischios vraiment courts, lordose effacée
    adapt: { flexion_lombaire: 'Pour toi : garde une légère cambrure naturelle, n’arrondis pas à fond.' },
    favor: { ischio_passif: 2, ischio_actif: 1, extension_lombaire: 1, flechisseurs_renfo: 1 },
    needs: { ischio_actif: 1 },
  },
  psoas_raide: {
    label: 'Psoas raide',
    kind: 'posture',
    favor: { psoas_etirement: 2, retroversion: 1 },
    needs: { psoas_etirement: 1 },
  },
  epaules_enroulees: {
    label: 'Épaules enroulées vers l’avant',
    kind: 'posture',
    adapt: { poussee: 'Pour toi : omoplates basses et serrées, les épaules ne roulent pas vers l’avant.' },
    favor: { ouverture_pectorale: 2, extension_thoracique: 2, retraction_scapulaire: 2 },
    needs: { ouverture_pectorale: 1, retraction_scapulaire: 1 },
  },
  epaules_crispees: {
    label: 'Épaules qui montent vers les oreilles (trapèzes supérieurs crispés)',
    kind: 'posture',
    // Même texte partout : une seule consigne s'affiche même si l'exercice coche plusieurs mécaniques
    adapt: {
      elevation_bras: 'Pour toi : omoplates vers le bas, épaules loin des oreilles.',
      retraction_scapulaire: 'Pour toi : omoplates vers le bas, épaules loin des oreilles.',
      poussee: 'Pour toi : omoplates vers le bas, épaules loin des oreilles.',
    },
    favor: { retraction_scapulaire: 1, etirement_cervical: 1, anti_rotation: 1 },
  },
  dorsiflexion_limitee: {
    label: 'Chevilles raides (dorsiflexion limitée)',
    kind: 'posture',
    favor: { dorsiflexion: 2 },
    needs: { dorsiflexion: 1 },
  },
  hanches_raides: {
    label: 'Mobilité de hanche faible',
    kind: 'posture',
    favor: { rotation_hanche: 2, adducteurs_etirement: 1, flexion_hanche_profonde: 1, psoas_etirement: 1 },
    needs: { rotation_hanche: 1 },
  },
  epaules_raides: {
    label: 'Mobilité d’épaule faible',
    kind: 'posture',
    favor: { elevation_bras: 2, extension_thoracique: 1, rotation_thoracique: 1, ouverture_pectorale: 1 },
    needs: { extension_thoracique: 1, elevation_bras: 2 },
  },
  prevention_tibiale: {
    label: 'Tibias sensibles (prévention périostite)',
    kind: 'posture',
    // Pas de douleur actuelle : on garde les impacts, on renforce et on soigne l'amorti
    adapt: { impact: 'Pour toi : réception silencieuse sur l’avant du pied, chevilles souples.' },
    favor: { tibial_renfo: 2, flexion_plantaire_etirement: 1, mollet_renfo: 1, dorsiflexion: 1 },
    needs: { tibial_renfo: 2 },
  },

  cyphose: {
    label: 'Dos rond (haut du dos voûté)',
    kind: 'posture',
    adapt: { flexion_lombaire: 'Pour toi : arrondis doucement, sans tirer sur la nuque.' },
    favor: { extension_thoracique: 2, ouverture_pectorale: 1, retraction_scapulaire: 1, rotation_thoracique: 1 },
    needs: { extension_thoracique: 1 },
  },
  tete_en_avant: {
    label: 'Tête en avant (nuque projetée)',
    kind: 'posture',
    adapt: { poussee: 'Pour toi : menton rentré, nuque longue.' },
    favor: { retraction_scapulaire: 2, extension_thoracique: 1, etirement_cervical: 1, ouverture_pectorale: 1 },
    needs: { retraction_scapulaire: 1 },
  },
  scoliose: {
    label: 'Scoliose',
    kind: 'posture',
    refer: true,
    adapt: {
      rotation_lombaire: 'Pour toi : amplitude égale des deux côtés, sans forcer.',
      charge_axiale: 'Pour toi : charge légère, dos bien aligné.',
    },
    favor: { anti_rotation: 2, anti_extension: 1, abducteurs_renfo: 1 },
  },
  genoux_en_x: {
    label: 'Genoux qui rentrent (genou en X)',
    kind: 'posture',
    adapt: { flexion_genou_chargee: 'Pour toi : genou dans l’axe du pied, il ne rentre pas vers l’intérieur.' },
    favor: { abducteurs_renfo: 2, fessier_renfo: 1, unipodal: 1 },
    needs: { abducteurs_renfo: 1 },
  },
  pieds_plats: {
    label: 'Pieds plats / pieds qui s’affaissent',
    kind: 'posture',
    adapt: { impact: 'Pour toi : réception sur l’avant du pied, voûte plantaire active.' },
    favor: { mollet_renfo: 2, tibial_renfo: 1, unipodal: 1, abducteurs_renfo: 1 },
    needs: { mollet_renfo: 2 },
  },
  ischios_raides: {
    label: 'Ischios courts (ne touche pas ses pieds, dos droit)',
    kind: 'posture',
    favor: { ischio_passif: 2, ischio_actif: 2, neurodynamique: 1 },
    needs: { ischio_actif: 1 },
  },
  mollets_raides: {
    label: 'Mollets raides',
    kind: 'posture',
    favor: { dorsiflexion: 2, compression_roller: 1 },
    needs: { dorsiflexion: 1 },
  },
  raideur_generale: {
    label: 'Raide de partout',
    kind: 'posture',
    favor: { psoas_etirement: 1, quadri_etirement: 1, ischio_actif: 1, adducteurs_etirement: 1, rotation_hanche: 1, ouverture_pectorale: 1, dorsiflexion: 1, extension_thoracique: 1, ischio_passif: 1 },
  },
  hypermobilite: {
    label: 'Très souple, articulations laxes (hypermobilité)',
    kind: 'posture',
    // Le risque n'est pas le manque de souplesse mais le manque de contrôle en fin d'amplitude
    adapt: {
      ischio_passif: 'Pour toi : reste à 70 % de ton amplitude, ne pends pas dans tes articulations.',
      adducteurs_etirement: 'Pour toi : reste à 70 % de ton amplitude, ne pends pas dans tes articulations.',
      ouverture_pectorale: 'Pour toi : reste à 70 % de ton amplitude, ne pends pas dans tes articulations.',
      flexion_genou_profonde: 'Pour toi : reste à 70 % de ton amplitude, ne pends pas dans tes articulations.',
    },
    favor: { anti_extension: 2, anti_rotation: 2, fessier_renfo: 1, abducteurs_renfo: 1, retraction_scapulaire: 1, unipodal: 1 },
    needs: { anti_extension: 1 },
  },

  // ───────── Douleurs ─────────
  douleur_genou: {
    label: 'Douleur au genou',
    kind: 'douleur',
    avoid: ['impact', 'flexion_genou_profonde'],
    adapt: {
      flexion_genou_chargee: 'Pour toi : descends seulement jusqu’où le genou ne fait pas mal.',
      appui_genou: 'Pour toi : mets un coussin sous le genou.',
    },
    favor: { fessier_renfo: 1, abducteurs_renfo: 1 },
  },
  periostite_tibiale: {
    label: 'Périostite tibiale',
    kind: 'douleur',
    avoid: ['impact'],
    favor: { tibial_renfo: 2, mollet_renfo: 1, dorsiflexion: 1 },
    needs: { tibial_renfo: 1 },
  },
  tfl: {
    label: 'Douleur TFL / bandelette ilio-tibiale',
    kind: 'douleur',
    adapt: { compression_roller: 'Pour toi : pression douce, jamais sur une zone qui brûle.' },
    favor: { abducteurs_renfo: 2, fessier_renfo: 1 },
    needs: { abducteurs_renfo: 1 },
  },
  sciatique: {
    label: 'Sciatique',
    kind: 'douleur',
    refer: true,
    avoid: ['ischio_passif'],
    adapt: {
      tension_neurale: 'Pour toi : arrête si ça descend dans la jambe ou si ça fourmille.',
      flexion_lombaire: 'Pour toi : petite amplitude, sans douleur dans la jambe.',
    },
    favor: { neurodynamique: 1, anti_extension: 1 },
  },
  lombalgie: {
    label: 'Douleur au bas du dos',
    kind: 'douleur',
    refer: true,
    avoid: ['charge_axiale', 'impact'],
    adapt: {
      flexion_lombaire: 'Pour toi : amplitude sans douleur uniquement.',
      extension_lombaire: 'Pour toi : amplitude sans douleur uniquement.',
      rotation_lombaire: 'Pour toi : amplitude sans douleur uniquement.',
    },
    favor: { anti_extension: 2, anti_rotation: 2, retroversion: 1 },
  },
  douleur_epaule: {
    label: 'Douleur à l’épaule',
    kind: 'douleur',
    refer: true,
    avoid: ['poussee'],
    adapt: { elevation_bras: 'Pour toi : monte les bras seulement dans l’amplitude sans douleur.' },
    favor: { retraction_scapulaire: 1 },
  },
  douleur_poignet: {
    label: 'Douleur au poignet',
    kind: 'douleur',
    avoid: ['appui_poignet'],
  },
  douleur_hanche: {
    label: 'Pincement à l’avant de la hanche',
    kind: 'douleur',
    avoid: ['flexion_hanche_profonde'],
    favor: { fessier_renfo: 1, abducteurs_renfo: 1 },
  },
  tendinite_rotulienne: {
    label: 'Tendinite rotulienne (devant du genou)',
    kind: 'douleur',
    avoid: ['impact'],
    adapt: { flexion_genou_chargee: 'Pour toi : descente lente, sans douleur au-dessus de 3/10.' },
    favor: { fessier_renfo: 1, quadri_etirement: 1 },
  },
  tendinite_achille: {
    label: 'Tendon d’Achille douloureux',
    kind: 'douleur',
    avoid: ['impact'],
    adapt: {
      mollet_renfo: 'Pour toi : descente très lente, sans douleur au-dessus de 3/10.',
      dorsiflexion: 'Pour toi : étirement doux, jamais en force.',
    },
    favor: { mollet_renfo: 2 },
  },
  fasciite_plantaire: {
    label: 'Douleur sous le pied (fasciite plantaire)',
    kind: 'douleur',
    avoid: ['impact'],
    favor: { dorsiflexion: 2, mollet_renfo: 1, compression_roller: 1 },
    needs: { dorsiflexion: 1 },
  },
  cheville_instable: {
    label: 'Cheville fragile (entorses à répétition)',
    kind: 'douleur',
    adapt: { impact: 'Pour toi : sauts bas et contrôlés, réception stable.' },
    favor: { unipodal: 2, mollet_renfo: 1, tibial_renfo: 1 },
    needs: { unipodal: 2 },
  },
  cervicalgie: {
    label: 'Douleur à la nuque',
    kind: 'douleur',
    adapt: { etirement_cervical: 'Pour toi : très doucement, jamais jusqu’à la douleur.' },
    favor: { retraction_scapulaire: 1 },
  },
}

// Sport principal : léger bonus sur ce qui transfère (jamais d'exclusion)
// Objectifs : ce que la personne veut travailler (bonus et besoins, jamais d'exclusion)
Object.assign(CONDITIONS, {
  souplesse_globale: { label: 'Gagner en souplesse', kind: 'objectif', favor: { psoas_etirement: 1, quadri_etirement: 1, ischio_actif: 1, adducteurs_etirement: 1, rotation_hanche: 1, ouverture_pectorale: 1, dorsiflexion: 1, extension_thoracique: 1 } },
  mobilite: {
    label: 'Bouger plus librement (mobilité articulaire)',
    kind: 'objectif',
    favor: { rotation_hanche: 2, rotation_thoracique: 2, dorsiflexion: 1, elevation_bras: 1 },
    needs: { rotation_hanche: 2 },
  },
  force: {
    label: 'Gagner en force',
    kind: 'objectif',
    favor: { fessier_renfo: 1, ischio_renfo: 1, flexion_genou_chargee: 1, poussee: 1, anti_extension: 1 },
  },
  posture_bureau: {
    label: 'Compenser la position assise (bureau, études)',
    kind: 'objectif',
    favor: { psoas_etirement: 2, extension_thoracique: 2, ouverture_pectorale: 1, retraction_scapulaire: 1, fessier_renfo: 1 },
    needs: { psoas_etirement: 1, extension_thoracique: 1 },
  },
  prevention_blessures: {
    label: 'Prévenir les blessures',
    kind: 'objectif',
    favor: { unipodal: 1, abducteurs_renfo: 1, anti_rotation: 1, mollet_renfo: 1, ischio_renfo: 1 },
    needs: { unipodal: 2 },
  },
  relachement: {
    label: 'Se détendre, relâcher les tensions',
    kind: 'objectif',
    favor: { compression_roller: 2, neurodynamique: 1, rotation_lombaire: 1, etirement_cervical: 1 },
  },
})

export const SPORTS = {
  course: { label: 'Course / athlétisme', favor: { dorsiflexion: 1, mollet_renfo: 1, tibial_renfo: 1, fessier_renfo: 1, impact: 1, anti_rotation: 1 } },
  yoga: { label: 'Yoga / pilates', favor: { fessier_renfo: 1, abducteurs_renfo: 1, anti_extension: 1, retraction_scapulaire: 1 } },
  muscu: { label: 'Musculation', favor: { ouverture_pectorale: 1, rotation_thoracique: 1, dorsiflexion: 1, extension_thoracique: 1 } },
  collectif: { label: 'Sport collectif (foot, basket, hand…)', favor: { abducteurs_renfo: 1, ischio_renfo: 1, unipodal: 1, dorsiflexion: 1 } },
  velo: { label: 'Vélo', favor: { psoas_etirement: 2, quadri_etirement: 1, extension_thoracique: 1, ouverture_pectorale: 1 } },
  natation: { label: 'Natation', favor: { retraction_scapulaire: 1, rotation_thoracique: 1, anti_extension: 1, elevation_bras: 1 } },
  combat: { label: 'Sports de combat', favor: { rotation_hanche: 1, adducteurs_etirement: 1, anti_rotation: 1, unipodal: 1 } },
  raquette: { label: 'Tennis, padel, badminton', favor: { rotation_thoracique: 1, anti_rotation: 1, retraction_scapulaire: 1, unipodal: 1 } },
  danse: { label: 'Danse', favor: { abducteurs_renfo: 1, mollet_renfo: 1, unipodal: 1, anti_extension: 1 } },
  escalade: { label: 'Escalade', favor: { ouverture_pectorale: 1, retraction_scapulaire: 1, rotation_hanche: 1, extension_thoracique: 1 } },
  aucun: { label: 'Pas de sport', favor: {} },
}
