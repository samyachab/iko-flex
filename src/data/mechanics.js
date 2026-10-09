// Vocabulaire biomécanique : ce qu'un exercice fait au corps, sans jugement.
// Un exercice déclare ses mécaniques (exercises.js -> biomechanics) ; ce sont les conditions de la
// personne (conditions.js) qui décident si une mécanique est à éviter, à adapter ou à privilégier.
// Ajouter une condition ne demande donc jamais de retaguer la bibliothèque.

export const MECHANICS = {
  // Bassin & colonne lombaire
  retroversion: { label: 'Rétroversion active', desc: 'Le bassin bascule en arrière, fessiers et abdos serrés.' },
  risque_cambrure: { label: 'Risque de cambrure', desc: 'La compensation typique est de creuser le bas du dos : la consigne fait tout.' },
  extension_lombaire: { label: 'Extension lombaire', desc: 'Le bas du dos se creuse, en mobilité douce (phase "creuser" du Cat-Cow).' },
  extension_lombaire_active: { label: 'Extension lombaire pure', desc: 'Les muscles du dos soulèvent le buste ou les jambes à plat ventre (type Superman).' },
  flexion_lombaire: { label: 'Flexion lombaire', desc: 'Le bas du dos s’arrondit.' },
  rotation_lombaire: { label: 'Rotation lombaire', desc: 'Torsion du bas du dos.' },
  anti_extension: { label: 'Anti-extension', desc: 'Le tronc résiste à la cambrure (gainage avant).' },
  anti_rotation: { label: 'Anti-rotation', desc: 'Le tronc résiste à la torsion ou à l’inclinaison.' },
  charge_axiale: { label: 'Charge axiale', desc: 'Une charge pèse sur la colonne (kettlebell, haltères).' },

  // Hanches & cuisses
  psoas_etirement: { label: 'Étirement psoas', desc: 'Hanche en extension, fléchisseurs étirés.' },
  quadri_etirement: { label: 'Étirement quadriceps', desc: 'Genou plié et hanche tendue.' },
  ischio_passif: { label: 'Ischios passifs', desc: 'Ischios étirés en maintien, jambe tendue, sans contraction.' },
  ischio_actif: { label: 'Ischios actifs', desc: 'Ischios allongés par le mouvement, le muscle opposé travaille.' },
  ischio_renfo: { label: 'Renfo ischios', desc: 'Ischios qui travaillent contre une charge.' },
  fessier_renfo: { label: 'Renfo grand fessier', desc: 'Extension de hanche contre une charge.' },
  abducteurs_renfo: { label: 'Renfo moyen fessier', desc: 'Stabilité latérale du bassin, ouverture du genou.' },
  flechisseurs_renfo: { label: 'Renfo fléchisseurs', desc: 'Montée de genou contre une charge.' },
  adducteurs_etirement: { label: 'Étirement adducteurs', desc: 'Intérieur des cuisses ouvert.' },
  rotation_hanche: { label: 'Rotation de hanche', desc: 'Rotations interne et externe de la hanche.' },
  jambes_tendues_levees: { label: 'Jambes tendues levées', desc: 'Sur le dos, lever les jambes tendues (type Leg Raises) : long bras de levier sur le psoas et les lombaires.' },
  flexion_hanche_profonde: { label: 'Flexion de hanche profonde', desc: 'Cuisse ramenée très près du buste.' },

  // Genou
  flexion_genou_profonde: { label: 'Genou très plié', desc: 'Genou en fin d’amplitude, sans charge.' },
  flexion_genou_chargee: { label: 'Genou plié en charge', desc: 'Squat, fente : le genou plie sous le poids du corps.' },
  appui_genou: { label: 'Appui sur le genou', desc: 'Genou posé au sol.' },

  // Cheville & jambe
  dorsiflexion: { label: 'Dorsiflexion', desc: 'Genou qui avance au-dessus du pied, talon au sol.' },
  flexion_plantaire_etirement: { label: 'Étirement dessus du pied', desc: 'Pointe tendue, tibial antérieur étiré.' },
  mollet_renfo: { label: 'Renfo mollets', desc: 'Montées sur pointe, mollets et soléaires.' },
  tibial_renfo: { label: 'Renfo tibial', desc: 'Relevés de pointe, devant du tibia.' },
  unipodal: { label: 'Sur une jambe', desc: 'Équilibre sur un pied.' },
  impact: { label: 'Impacts', desc: 'Sauts et réceptions.' },

  // Haut du corps
  extension_thoracique: { label: 'Extension thoracique', desc: 'Le haut du dos se redresse.' },
  rotation_thoracique: { label: 'Rotation thoracique', desc: 'Le haut du dos tourne.' },
  ouverture_pectorale: { label: 'Ouverture pectorale', desc: 'Pectoraux et avant d’épaule étirés.' },
  retraction_scapulaire: { label: 'Omoplates serrées', desc: 'Fixateurs d’omoplates au travail.' },
  elevation_bras: { label: 'Bras au-dessus de la tête', desc: 'Épaule en élévation complète.' },
  poussee: { label: 'Poussée', desc: 'Pompes et appuis qui poussent.' },
  appui_poignet: { label: 'Appui sur les mains', desc: 'Poids du corps sur les poignets.' },
  etirement_cervical: { label: 'Étirement cervical', desc: 'Inclinaison de la tête.' },

  // Nerfs & tissus
  neurodynamique: { label: 'Glissement nerveux', desc: 'Le nerf coulisse sans être tenu en tension (flossing).' },
  tension_neurale: { label: 'Tension nerveuse', desc: 'Jambe tendue et hanche fléchie : le nerf sciatique est mis en tension.' },
  compression_roller: { label: 'Auto-massage', desc: 'Pression du rouleau sur le muscle.' },
}
