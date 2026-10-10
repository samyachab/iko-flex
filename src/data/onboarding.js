// Questionnaire d'accueil, pensé TDAH : une question par écran, de grosses cartes, peu de texte,
// passage automatique sur un choix unique, « je ne sais pas » partout, 2 minutes en tout.
// Chaque réponse se traduit en conditions (data/conditions.js) : la fiche proposée part chez le coach.
//
// type : 'single' (un choix, avance tout seul) · 'multi' (plusieurs, bouton Continuer) · 'minutes' · 'consent'
//        · 'text' (texte libre, analysé sur le téléphone par lib/analyze.js)
// when : (answers) => bool, l'étape n'apparaît que si c'est vrai
// options[].sets : conditions ajoutées si l'option est choisie
import { CONDITIONS } from './conditions.js'
import { analyzeText } from '../lib/analyze.js'

// Sur-mesure : la personne écrit, se laisse guider, ou les deux
const writes = (a) => a.consent === true && (a.how === 'text' || a.how === 'both')
const guided = (a) => a.consent === true && (a.how === 'guide' || a.how === 'both')
// Conditions repérées dans le texte, moins celles que la personne a retirées au récap
export const textConditions = (a) =>
  writes(a) ? analyzeText(a.text).conditions.filter((c) => !(a.text_removed ?? []).includes(c)) : []
const textPain = (a) => textConditions(a).some((c) => CONDITIONS[c]?.kind === 'douleur')

export const STEPS = [
  {
    id: 'mode',
    type: 'single',
    title: 'Comment tu veux commencer ?',
    options: [
      { value: 'custom', label: 'Sur-mesure', hint: '2 minutes de questions, ton coach valide ta fiche.' },
      { value: 'general', label: 'Je commence direct', hint: 'Routine générale, tu pourras personnaliser plus tard.' },
    ],
  },
  {
    id: 'how',
    type: 'single',
    title: 'Comment tu préfères m’expliquer ?',
    when: (a) => a.mode === 'custom',
    options: [
      { value: 'text', label: 'J’écris mon problème', hint: 'Avec tes mots, je m’occupe du reste.' },
      { value: 'guide', label: 'Guide-moi', hint: 'Des questions simples et quelques petits tests.' },
      { value: 'both', label: 'Les deux', hint: 'Le plus précis.' },
    ],
  },
  {
    id: 'consent',
    type: 'consent',
    title: 'On parle de ton corps',
    subtitle:
      'Tu vas me parler de ta posture et de tes douleurs. Ce sont des données de santé : elles servent seulement à construire tes séances, seuls toi et ton coach y avez accès, et tu peux tout supprimer à tout moment.',
    when: (a) => a.mode === 'custom',
    options: [
      { value: true, label: 'D’accord, on y va' },
      { value: false, label: 'Je préfère pas', hint: 'Ta fiche reposera seulement sur tes objectifs et ton sport.' },
    ],
  },
  {
    id: 'text',
    type: 'text',
    title: 'Raconte-moi',
    subtitle: 'Ce qui te gêne, où tu as mal, ce que tu veux améliorer, ton sport. Quelques phrases suffisent.',
    placeholder: 'Ex : j’ai mal au bas du dos quand je cours, je suis très cambré et je ne touche pas mes pieds.',
    when: writes,
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
    when: (a) => a.mode === 'custom',
    options: [
      { value: 'kettlebell', label: 'Kettlebell' },
      { value: 'halteres', label: 'Haltères' },
      { value: 'elastique', label: 'Élastique' },
      { value: 'rouleau', label: 'Rouleau de massage' },
      { value: 'plots', label: 'Plots' },
      { value: 'support', label: 'Chaise, box ou marche' },
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
      { value: 'partout', label: 'Un peu partout', sets: ['raideur_generale'] },
    ],
  },
  {
    id: 'pains',
    type: 'multi',
    title: 'Tu as mal quelque part en ce moment ?',
    subtitle: 'Rien ? Continue.',
    when: guided,
    options: [
      { value: 'lombaires', label: 'Bas du dos', sets: ['lombalgie'] },
      { value: 'sciatique', label: 'Douleur qui descend dans la jambe', sets: ['sciatique'] },
      { value: 'nuque', label: 'Nuque', sets: ['cervicalgie'] },
      { value: 'epaule', label: 'Épaule', sets: ['douleur_epaule'] },
      { value: 'poignet', label: 'Poignet', sets: ['douleur_poignet'] },
      { value: 'hanche', label: 'Devant de la hanche', sets: ['douleur_hanche'] },
      { value: 'genou', label: 'Genou', sets: ['douleur_genou'] },
      { value: 'rotule', label: 'Sous la rotule', sets: ['tendinite_rotulienne'] },
      { value: 'tfl', label: 'Extérieur de la cuisse', sets: ['tfl'] },
      { value: 'tibia', label: 'Tibia', sets: ['periostite_tibiale'] },
      { value: 'achille', label: 'Tendon d’Achille', sets: ['tendinite_achille'] },
      { value: 'pied', label: 'Sous le pied', sets: ['fasciite_plantaire'] },
      { value: 'cheville', label: 'Cheville qui tourne souvent', sets: ['cheville_instable'] },
    ],
  },
  {
    id: 'red_flags',
    type: 'single',
    title: 'Une dernière chose',
    subtitle:
      'Cette douleur te réveille la nuit, fourmille, te fait perdre de la force, vient d’une chute, ou dépasse 7 sur 10 ?',
    when: (a) => (guided(a) && a.pains?.length > 0) || textPain(a),
    options: [
      { value: false, label: 'Non' },
      { value: true, label: 'Oui', hint: 'On te conseillera de voir un kiné ou un médecin avant.' },
    ],
  },
]

// Étapes visibles pour les réponses actuelles
export const visibleSteps = (answers) => STEPS.filter((s) => !s.when || s.when(answers))

// Réponses -> fiche proposée au coach (même format que profiles.data)
export function buildProposal(answers) {
  const pick = (stepId) => {
    const step = STEPS.find((s) => s.id === stepId)
    const chosen = [answers[stepId]].flat()
    return step.options.filter((o) => chosen.includes(o.value)).flatMap((o) => o.sets ?? [])
  }
  const tests = STEPS.filter((s) => s.test).flatMap((s) => pick(s.id))
  const fromText = textConditions(answers)
  const kindOf = (kind) => fromText.filter((c) => CONDITIONS[c]?.kind === kind)
  const posture = [...new Set([...tests, ...pick('stiff'), ...kindOf('posture')])]
  // Dos creusé + ischios "raides" : c'est le paradoxe de l'hyperlordose, pas des ischios courts
  const posture_issues = posture.includes('hyperlordose') ? posture.filter((c) => c !== 'ischios_raides') : posture
  return {
    sport: answers.sport && answers.sport !== '?' ? answers.sport : (writes(answers) && analyzeText(answers.text).sport) || 'aucun',
    goals: [...new Set([...(Array.isArray(answers.goals) ? answers.goals : []), ...kindOf('objectif')])],
    posture_issues: answers.consent ? posture_issues : [],
    pain_points: answers.consent ? [...new Set([...pick('pains'), ...kindOf('douleur')])] : [],
    keys: [],
    rules: { exclude_tags: [], force_include: {}, overrides: {} },
  }
}
