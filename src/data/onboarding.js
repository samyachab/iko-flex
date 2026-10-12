// Questionnaire d'accueil, pensé TDAH : une question par écran, de grosses cartes, peu de texte,
// passage automatique sur un choix unique, « je ne sais pas » partout, 2 minutes en tout.
// Chaque réponse se traduit en conditions (data/conditions.js).
// Pas de texte libre : on ne recueille aucune description de problème de santé.
// Les zones sensibles (gênes) restent sur le téléphone (lib/zones.js) ; seuls objectifs, sport, tests de
// mobilité et réglages partent dans le coffre.
//
// type : 'single' (un choix, avance tout seul) · 'multi' (plusieurs, bouton Continuer) · 'minutes' · 'consent'
// when : (answers) => bool, l'étape n'apparaît que si c'est vrai
// options[].sets : conditions ajoutées si l'option est choisie
// Sur-mesure : les petits tests et questions de mobilité n'apparaissent que si la personne les accepte
const guided = (a) => a.consent === true

export const STEPS = [
  {
    id: 'mode',
    type: 'single',
    title: 'Comment tu veux commencer ?',
    options: [
      { value: 'custom', label: 'Sur-mesure', hint: '2 minutes de questions et de petits tests.' },
      { value: 'general', label: 'Je commence direct', hint: 'Routine générale, tu pourras personnaliser plus tard.' },
    ],
  },
  {
    id: 'goals',
    type: 'multi',
    max: 3,
    title: 'Qu’est-ce que tu veux améliorer ?',
    subtitle: '3 choix maximum.',
    when: (a) => a.mode === 'custom',
    options: [
      { value: 'souplesse_globale', label: 'Ma souplesse' },
      { value: 'mobilite', label: 'Bouger plus librement' },
      { value: 'force', label: 'Ma force' },
      { value: 'posture_bureau', label: 'Compenser le temps assis' },
      { value: 'prevention_blessures', label: 'Éviter les blessures' },
      { value: 'relachement', label: 'Me détendre' },
    ],
  },
  {
    id: 'sport',
    type: 'single',
    title: 'Ton sport principal ?',
    when: (a) => a.mode === 'custom',
    options: [
      { value: 'course', label: 'Course, athlétisme' },
      { value: 'collectif', label: 'Sport collectif' },
      { value: 'muscu', label: 'Musculation' },
      { value: 'yoga', label: 'Yoga, pilates' },
      { value: 'velo', label: 'Vélo' },
      { value: 'natation', label: 'Natation' },
      { value: 'combat', label: 'Sport de combat' },
      { value: 'raquette', label: 'Tennis, padel, badminton' },
      { value: 'danse', label: 'Danse' },
      { value: 'escalade', label: 'Escalade' },
      { value: 'aucun', label: 'Pas de sport' },
    ],
  },
  {
    id: 'minutes',
    type: 'minutes',
    title: 'Combien de temps par séance ?',
    subtitle: 'Tu pourras changer quand tu veux.',
    when: (a) => a.mode === 'custom',
  },
  {
    id: 'level',
    type: 'single',
    title: 'En renfo, tu te situes où ?',
    when: (a) => a.mode === 'custom',
    options: [
      { value: 'auto', label: 'Je débute', hint: 'On commence facile, ça monte tout seul avec ta régularité.' },
      { value: 2, label: 'Je m’entraîne déjà', hint: 'Séries et répétitions moyennes.' },
      { value: 3, label: 'Je suis à l’aise', hint: 'Séries et répétitions costaudes.' },
    ],
  },
  {
    id: 'equipment',
    type: 'multi',
    title: 'Tu as quoi chez toi ?',
    subtitle: 'Rien ? Continue, il y a plein d’exercices sans matériel.',
    // Demandé dans les deux parcours : sans ça, la routine générale supposerait tout le matériel
    when: (a) => a.mode === 'custom' || a.mode === 'general',
    options: [
      { value: 'kettlebell', label: 'Kettlebell' },
      { value: 'halteres', label: 'Haltères' },
      { value: 'elastique', label: 'Élastique' },
      { value: 'rouleau', label: 'Rouleau de massage' },
      { value: 'plots', label: 'Plots' },
      { value: 'support', label: 'Chaise, box ou marche' },
    ],
  },
  {
    id: 'consent',
    type: 'consent',
    title: 'On évalue tes besoins',
    subtitle:
      'Quelques petits tests de 10 secondes pour te construire le meilleur programme possible. Ce sont juste des tests de mobilité, pas un diagnostic.',
    when: (a) => a.mode === 'custom',
    options: [
      { value: true, label: 'C’est parti' },
      { value: false, label: 'Je passe les tests', hint: 'Ton programme reposera sur tes objectifs et ton sport.' },
    ],
  },

  // ───────── Tests guidés : debout, 10 secondes chacun ─────────
  {
    id: 'test_dos',
    type: 'single',
    test: true,
    title: 'Dos contre un mur',
    subtitle: 'Talons, fesses et épaules contre le mur. Glisse ta main dans le creux du bas du dos.',
    when: guided,
    options: [
      { value: 'large', label: 'Toute ma main passe, et même plus', sets: ['hyperlordose'] },
      { value: 'ok', label: 'Ma main passe tout juste' },
      { value: 'plat', label: 'Elle ne passe pas', sets: ['dos_plat'] },
      { value: '?', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'test_epaules',
    type: 'single',
    test: true,
    title: 'Toujours contre le mur',
    subtitle: 'Monte les bras tendus au-dessus de la tête. Tes pouces touchent le mur ?',
    when: guided,
    options: [
      { value: 'oui', label: 'Oui, sans décoller le dos' },
      { value: 'cambre', label: 'Oui, mais mon dos se creuse', sets: ['epaules_raides'] },
      { value: 'non', label: 'Non, ils n’y arrivent pas', sets: ['epaules_raides'] },
      { value: '?', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'test_mains',
    type: 'single',
    test: true,
    title: 'Debout, bras relâchés',
    subtitle: 'Regarde tes mains sans bouger : de face, tu vois plutôt…',
    when: guided,
    options: [
      { value: 'pouces', label: 'Mes pouces' },
      { value: 'dos', label: 'Le dos de mes mains', sets: ['epaules_enroulees'] },
      { value: '?', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'test_pieds',
    type: 'single',
    test: true,
    title: 'Jambes tendues, penche-toi',
    subtitle: 'Sans forcer, laisse descendre tes mains vers tes pieds.',
    when: guided,
    options: [
      { value: 'paumes', label: 'Mes paumes touchent le sol facilement', sets: ['hypermobilite'] },
      { value: 'doigts', label: 'Le bout des doigts touche mes pieds' },
      { value: 'tibias', label: 'Je reste aux tibias ou aux genoux', sets: ['ischios_raides'] },
      { value: '?', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'test_cheville',
    type: 'single',
    test: true,
    animation: 'knee-to-wall',
    title: 'Le genou au mur',
    subtitle: 'Pied à 10 cm du mur. Avance le genou jusqu’au mur sans décoller le talon.',
    when: guided,
    options: [
      { value: 'oui', label: 'Le genou touche le mur' },
      { value: 'non', label: 'Mon talon décolle avant', sets: ['dorsiflexion_limitee'] },
      { value: '?', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'test_squat',
    type: 'single',
    test: true,
    title: 'Un squat devant un miroir',
    subtitle: 'Descends lentement. Tes genoux…',
    when: guided,
    options: [
      { value: 'axe', label: 'Restent au-dessus des pieds' },
      { value: 'rentrent', label: 'Rentrent vers l’intérieur', sets: ['genoux_en_x'] },
      { value: '?', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'test_hanche',
    type: 'single',
    test: true,
    title: 'Allongé au bord du lit',
    subtitle: 'Ramène un genou contre ta poitrine. L’autre cuisse…',
    when: guided,
    options: [
      { value: 'plat', label: 'Reste à plat sur le lit' },
      { value: 'monte', label: 'Se soulève', sets: ['psoas_raide'] },
      { value: '?', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'stiff',
    type: 'multi',
    title: 'Tu te sens raide où ?',
    subtitle: 'Choisis tout ce qui te parle, ou continue.',
    when: guided,
    options: [
      { value: 'hanches', label: 'Hanches', sets: ['hanches_raides'] },
      { value: 'mollets', label: 'Mollets', sets: ['mollets_raides'] },
      { value: 'haut_dos', label: 'Haut du dos voûté', sets: ['cyphose'] },
      { value: 'nuque', label: 'Tête en avant, nuque tendue', sets: ['tete_en_avant'] },
      { value: 'trapezes', label: 'Épaules qui montent aux oreilles', sets: ['epaules_crispees'] },
      { value: 'recurvatum', label: 'Genoux qui partent en arrière', sets: ['genou_recurvatum'] },
      { value: 'pieds_creux', label: 'Pieds très creux', sets: ['pieds_creux'] },
      { value: 'partout', label: 'Un peu partout', sets: ['raideur_generale'] },
    ],
  },
  {
    id: 'pains',
    type: 'multi',
    title: 'Une zone te gêne en ce moment ?',
    subtitle:
      'Rien ? Continue. Ta réponse reste sur ton téléphone. Si c’est une vraie douleur, montre-la d’abord à un professionnel de santé.',
    when: guided,
    options: [
      { value: 'dos_flexion', label: 'Bas du dos, en me penchant ou assis longtemps', sets: ['lombalgie_flexion'] },
      { value: 'dos_extension', label: 'Bas du dos, debout longtemps ou cambré', sets: ['lombalgie_extension'] },
      { value: 'sciatique', label: 'Douleur qui descend dans la jambe', sets: ['sciatique'] },
      { value: 'fesse', label: 'Profond dans la fesse', sets: ['piriforme'] },
      { value: 'ischio_haut', label: 'Sous la fesse, surtout assis', sets: ['ischio_proximal'] },
      { value: 'hanche_cote', label: 'Côté de la hanche (couché dessus)', sets: ['tendinopathie_fessiere'] },
      { value: 'hanche', label: 'Devant de la hanche, qui pince', sets: ['douleur_hanche'] },
      { value: 'aine', label: 'Aine ou pubis', sets: ['pubalgie'] },
      { value: 'nuque', label: 'Nuque', sets: ['cervicalgie'] },
      { value: 'epaule', label: 'Épaule, quand le bras monte', sets: ['coiffe_rotateurs'] },
      { value: 'coude', label: 'Coude, en serrant ou en portant', sets: ['epicondylite'] },
      { value: 'poignet', label: 'Poignet', sets: ['douleur_poignet'] },
      { value: 'rotule', label: 'Juste sous la rotule (sauts, squats)', sets: ['tendinite_rotulienne'] },
      { value: 'autour_rotule', label: 'Autour de la rotule (escaliers, assis)', sets: ['femoro_patellaire'] },
      { value: 'genou', label: 'Ailleurs dans le genou', sets: ['douleur_genou'] },
      { value: 'tfl', label: 'Extérieur de la cuisse ou du genou', sets: ['tfl'] },
      { value: 'tibia', label: 'Le long du tibia', sets: ['periostite_tibiale'] },
      { value: 'os', label: 'Un point précis sur un os, qui empire en courant', sets: ['fracture_fatigue'] },
      { value: 'achille', label: 'Tendon d’Achille, au milieu', sets: ['tendinite_achille'] },
      { value: 'talon', label: 'Arrière du talon, là où s’attache le tendon', sets: ['achille_insertion'] },
      { value: 'pied', label: 'Sous le pied', sets: ['fasciite_plantaire'] },
      { value: 'cheville', label: 'Cheville qui tourne souvent', sets: ['cheville_instable'] },
    ],
  },
  {
    id: 'red_flags',
    type: 'single',
    title: 'Une dernière chose',
    subtitle: 'Cette gêne te réveille la nuit, fourmille, te fait perdre de la force, vient d’une chute, ou est très forte ?',
    when: (a) => guided(a) && a.pains?.length > 0,
    options: [
      { value: false, label: 'Non' },
      { value: true, label: 'Oui', hint: 'Dans ce cas, vois un professionnel de santé avant de t’entraîner dessus.' },
    ],
  },
]

// Étapes visibles pour les réponses actuelles
export const visibleSteps = (answers) => STEPS.filter((s) => !s.when || s.when(answers))

// Réponses -> fiche (même format que profiles.data). Les zones sensibles (pain_points) et programmes
// tendon sont rangés à part par l'écran du questionnaire : ils restent sur le téléphone.
export function buildProposal(answers) {
  const pick = (stepId) => {
    const step = STEPS.find((s) => s.id === stepId)
    const chosen = [answers[stepId]].flat()
    return step.options.filter((o) => chosen.includes(o.value)).flatMap((o) => o.sets ?? [])
  }
  const tests = STEPS.filter((s) => s.test).flatMap((s) => pick(s.id))
  const posture = [...new Set([...tests, ...pick('stiff')])]
  // Dos creusé + ischios "raides" : c'est le paradoxe de l'hyperlordose, pas des ischios courts
  const posture_issues = posture.includes('hyperlordose') ? posture.filter((c) => c !== 'ischios_raides') : posture
  const pains = answers.consent ? [...new Set(pick('pains'))] : []
  return {
    sport: answers.sport && answers.sport !== '?' ? answers.sport : 'aucun',
    goals: Array.isArray(answers.goals) ? answers.goals : [],
    posture_issues: answers.consent ? posture_issues : [],
    pain_points: pains,
    keys: [],
    rules: { exclude_tags: [], force_include: {}, overrides: {} },
  }
}
