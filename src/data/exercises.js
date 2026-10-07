// Source : banque_exercices.md
// theme  : 'souplesse' | 'renfo' (domicile) | 'salle' (pas encore utilisé dans les routines)
// group  : sous-catégorie, utilisée pour équilibrer les séances
// cue    : consigne ultra courte affichée dans le Player
// tags   : zones travaillées, utilisées pour le Debrief 800m
// unilateral : true = changement de côté à mi-temps

export const GROUPS = {
  hanche: { label: 'Psoas & Quadriceps' },
  posterieure: { label: 'Ischios & Fessiers' },
  epaules: { label: 'Épaules & Thorax' },
  cheville: { label: 'Mollets & Chevilles' },
  tronc: { label: 'Tronc & Bassin' },
  haut: { label: 'Fixateurs d’omoplates' },
  jambes: { label: 'Jambes & Fessiers' },
  salle_post: { label: 'Chaîne postérieure' },
  salle_ant: { label: 'Chaîne antérieure' },
  plio: { label: 'Pliométrie' },
}

export const EXERCISES = [
  // ───────── PARTIE 1 : SOUPLESSE & MOBILITÉ ─────────
  { id: 'lunge-psoas', theme: 'souplesse', group: 'hanche', name: 'Lunge Psoas (Rétroversion)', execution: 'Fente au sol, contracter le fessier arrière, basculer le bassin en arrière.', benefit: 'Libérer le bassin, réduire l’hyperlordose.', cue: 'Serre le fessier arrière', tags: ['psoas', 'bassin'], unilateral: true },
  { id: 'couch-stretch', theme: 'souplesse', group: 'hanche', name: 'Couch Stretch', execution: 'Genou au sol contre un mur, tibia contre le mur, redresser le buste.', benefit: 'Étirement intense quadriceps/psoas combinés.', cue: 'Buste droit', tags: ['psoas', 'quadriceps'], unilateral: true },
  { id: 'quadri-debout', theme: 'souplesse', group: 'hanche', name: 'Étirement Quadri debout', execution: 'Attraper le cou-de-pied, genoux serrés, pousser le bassin en avant.', benefit: 'Relâchement basique du droit antérieur sans cambrer.', cue: 'Bassin en avant', tags: ['quadriceps', 'bassin'], unilateral: true },
  { id: 'cossack', theme: 'souplesse', group: 'hanche', name: 'Fente latérale (Cossack)', execution: 'Descendre sur une jambe, l’autre tendue, pied flex.', benefit: 'Ouvrir les adducteurs et hanches pour la mobilité latérale.', cue: 'Talon au sol', tags: ['adducteurs', 'hanches'], unilateral: false },
  { id: 'spiderman', theme: 'souplesse', group: 'hanche', name: 'Spiderman Stretch', execution: 'Fente très longue, poser les deux mains au sol à l’intérieur du pied avant.', benefit: 'Ouvre massivement la hanche et étire le psoas en profondeur.', cue: 'Respire dans la hanche', tags: ['psoas', 'hanches'], unilateral: true },

  { id: 'pigeon', theme: 'souplesse', group: 'posterieure', name: 'Pose du Pigeon', execution: 'Jambe avant pliée sous le torse, jambe arrière tendue au sol.', benefit: 'Relâcher le piriforme et le grand fessier (soulage les ischios).', cue: 'Relâche les épaules', tags: ['fessiers', 'ischios'], unilateral: true },
  { id: 'hanches-9090', theme: 'souplesse', group: 'posterieure', name: 'Hanches 90/90', execution: 'Assis, appui sur les mains derrière, pieds écartés : un genou tourne vers l’intérieur, l’autre s’ouvre, puis on alterne.', benefit: 'Mobilité de la capsule articulaire, soulage le psoas et le dos.', cue: 'Laisse tomber les genoux', tags: ['hanches', 'psoas'], unilateral: false },
  { id: 'nerve-flossing', theme: 'souplesse', group: 'posterieure', name: 'Nerve Flossing (Sciatique)', execution: 'Assis sur une table, tendre la jambe en regardant le plafond, plier en rentrant le menton.', benefit: 'Relâche la fausse raideur nerveuse à l’arrière de la cuisse.', cue: 'Mouvement fluide', tags: ['nerf', 'ischios'], unilateral: true },
  { id: 'ischio-actif', theme: 'souplesse', group: 'posterieure', name: 'Étirement Ischio Actif', execution: 'Allongé dos, lever une jambe avec élastique, contracter le quadri.', benefit: 'Allonger l’ischio sans contraindre le bas du dos.', cue: 'Contracte le quadri', tags: ['ischios'], unilateral: true },

  { id: 'wall-slides', theme: 'souplesse', group: 'epaules', name: 'Glissades au mur (Wall Slides)', execution: 'Dos collé au mur, glisser les bras en "W" vers un "Y".', benefit: 'Mobilité thoracique, réapprend à baisser les épaules.', cue: 'Épaules basses', tags: ['thorax', 'epaules'], unilateral: false },
  { id: 'pectoral-porte', theme: 'souplesse', group: 'epaules', name: 'Étirement Pectoral (Porte)', execution: 'Avant-bras sur un cadre de porte, avancer le torse doucement.', benefit: 'Ouvrir la cage thoracique pour mieux respirer en course.', cue: 'Ouvre la poitrine', tags: ['pectoraux', 'thorax'], unilateral: true },
  { id: 'trapezes', theme: 'souplesse', group: 'epaules', name: 'Étirement des Trapèzes', execution: 'Mains jointes derrière le dos, tirer doucement le poignet opposé et incliner la tête de l’autre côté.', benefit: 'Soulager les cervicales ultra tendues.', cue: 'Relâche la mâchoire', tags: ['trapezes', 'cervicales'], unilateral: true },
  { id: 'passages-baton', theme: 'souplesse', group: 'epaules', name: 'Passages de bâton', execution: 'Prendre un élastique très large et passer les bras d’avant en arrière.', benefit: 'Mobilité générale des rotateurs de l’épaule.', cue: 'Bras tendus', tags: ['epaules'], unilateral: false },
  { id: 'open-book', theme: 'souplesse', group: 'epaules', name: 'Livre ouvert (Open Book)', execution: 'Allongé côté, genoux à 90°. Ouvrir le bras supérieur vers le sol arrière.', benefit: 'Libère la cage thoracique sans impliquer les lombaires.', cue: 'Suis ta main des yeux', tags: ['thorax'], unilateral: true },

  { id: 'knee-to-wall', theme: 'souplesse', group: 'cheville', name: 'Knee-to-Wall', execution: 'Avancer le genou vers un mur sans décoller le talon.', benefit: 'Améliorer la dorsiflexion (crucial pour l’amorti piste).', cue: 'Talon collé', tags: ['cheville'], unilateral: true },
  { id: 'soleaire', theme: 'souplesse', group: 'cheville', name: 'Étirement Soléaire', execution: 'Fente courte face au mur, plier le genou arrière en gardant talon sol.', benefit: 'Cible la cheville et le mollet profond (amortisseur principal).', cue: 'Plie le genou', tags: ['mollets', 'cheville'], unilateral: true },

  // ───────── PARTIE 2 : RENFORCEMENT À DOMICILE ─────────
  { id: 'deadbug', theme: 'renfo', group: 'tronc', name: 'Deadbug (L’insecte mort)', execution: 'Dos au sol (écrasé), tendre bras et jambe opposés sans cambrer.', benefit: 'Exercice ROI. Apprend à bouger les membres avec un bassin verrouillé.', cue: 'Dos écrasé au sol', tags: ['gainage', 'bassin'], unilateral: false },
  { id: 'bird-dog', theme: 'renfo', group: 'tronc', name: 'Bird-Dog', execution: 'À quatre pattes, tendre bras et jambe opposés.', benefit: 'Gainage dynamique de la chaîne postérieure sans charge.', cue: 'Bassin immobile', tags: ['gainage', 'fessiers'], unilateral: false },
  { id: 'planche-rkc', theme: 'renfo', group: 'tronc', name: 'Planche active (RKC)', execution: 'Sur coudes, serrer très fort fessiers et abdos, rétroversion max (15s).', benefit: 'Repositionne le bassin avec une intensité maximale.', cue: 'Tout serrer, 15s, relâche, repars', tags: ['gainage', 'bassin'], unilateral: false },

  { id: 'wall-angels', theme: 'renfo', group: 'haut', name: 'Wall Angels', execution: 'Dos, tête, bras plaqués au mur. Glisser les bras vers le haut.', benefit: 'Détendre les trapèzes supérieurs, abaisser les épaules.', cue: 'Épaules basses', tags: ['trapezes', 'epaules'], unilateral: false },
  { id: 'band-pull-apart', theme: 'renfo', group: 'haut', name: 'Band Pull Apart', execution: 'Bras tendus devant, écarter l’élastique en resserrant les omoplates.', benefit: 'Renforce l’arrière des épaules, ouvre la poitrine.', cue: 'Serre les omoplates', tags: ['omoplates', 'thorax'], unilateral: false },
  { id: 'pompes-scapulaires', theme: 'renfo', group: 'haut', name: 'Pompes scapulaires', execution: 'Position pompe, bras tendus, descendre le torse puis repousser.', benefit: 'Isole les muscles fixateurs de l’omoplate.', cue: 'Bras verrouillés', tags: ['omoplates'], unilateral: false },

  { id: 'monster-walks', theme: 'renfo', group: 'jambes', name: 'Monster Walks (Élastique)', execution: 'Élastique genoux, demi-squat, pas latéraux.', benefit: 'Active violemment le moyen fessier, prévient l’effondrement du bassin.', cue: 'Genoux vers l’extérieur', tags: ['fessiers', 'bassin'], unilateral: false },
  { id: 'pont-1-jambe', theme: 'renfo', group: 'jambes', name: 'Pont fessier 1 jambe', execution: 'Dos au sol, 1 jambe tendue, lever le bassin.', benefit: 'Corrige asymétries, renforce ischio/fessier en isolation.', cue: 'Pousse dans le talon', tags: ['fessiers', 'ischios'], unilateral: true },
  { id: 'goblet-squat', theme: 'renfo', group: 'jambes', name: 'Goblet Squat (Kettlebell)', execution: 'KB contre la poitrine, descendre bas, dos droit.', benefit: 'Muscler les quadriceps avec buste gainé, protège le dos.', cue: 'Poitrine fière', tags: ['quadriceps', 'gainage'], unilateral: false },
  { id: 'fentes-bulgares', theme: 'renfo', group: 'jambes', name: 'Fentes Bulgares (Haltères)', execution: 'Pied arrière en hauteur, descendre en contrôle.', benefit: 'Force asymétrique, étirement actif du quadriceps/psoas.', cue: 'Descends lentement', tags: ['quadriceps', 'psoas'], unilateral: true },
  { id: 'step-ups', theme: 'renfo', group: 'jambes', name: 'Step-Ups (Chaise/Box)', execution: 'Monter de façon explosive sur un support.', benefit: 'Spécificité biomécanique du sprint, force de la jambe d’appui.', cue: 'Explose', tags: ['quadriceps', 'fessiers', 'sprint'], unilateral: true },

  // ───────── PARTIE 3 : MUSCULATION EN SALLE (réservé v2) ─────────
  { id: 'sdt-roumain', theme: 'salle', group: 'salle_post', name: 'Soulevé de terre Roumain', execution: 'Jambes semi-tendues, pousser fesses en arrière avec barre.', benefit: 'Force du cycle arrière de la foulée, allonge les ischios.', cue: 'Fesses en arrière', tags: ['ischios', 'fessiers'], unilateral: false },
  { id: 'nordic', theme: 'salle', group: 'salle_post', name: 'Nordic Hamstring', execution: 'Genoux au sol, pieds bloqués, se laisser tomber en retenant.', benefit: 'Prévention n°1 contre les déchirures aux ischio-jambiers.', cue: 'Freine', tags: ['ischios'], unilateral: false },
  { id: 'abduction-poulie', theme: 'salle', group: 'salle_post', name: 'Abduction poulie basse', execution: 'Poulie cheville, lever jambe sur le côté en restant debout.', benefit: 'Renforce le moyen fessier (stabilité bassin) en position fonctionnelle.', cue: 'Buste fixe', tags: ['fessiers', 'bassin'], unilateral: true },
  { id: 'extensions-inversees', theme: 'salle', group: 'salle_post', name: 'Extensions Inversées', execution: 'Ventre sur banc haut, lever jambes tendues vers l’arrière.', benefit: 'Matraque ischios/fessiers SANS AUCUNE charge axiale sur les lombaires.', cue: 'Serre les fessiers', tags: ['ischios', 'fessiers'], unilateral: false },
  { id: 'hip-thrust', theme: 'salle', group: 'salle_post', name: 'Hip Thrust barre', execution: 'Dos sur banc, barre sur hanches, extension bassin.', benefit: 'Puissance pure du grand fessier pour la relance.', cue: 'Menton rentré', tags: ['fessiers'], unilateral: false },
  { id: 'presse-hauts', theme: 'salle', group: 'salle_ant', name: 'Presse Inclinée (Pieds hauts)', execution: 'Pieds hauts et écartés sur le plateau de la presse.', benefit: 'Épargne le dos, recrute massivement fessiers et ischios.', cue: 'Pousse les talons', tags: ['fessiers', 'ischios'], unilateral: false },
  { id: 'presse-centres', theme: 'salle', group: 'salle_ant', name: 'Presse Inclinée (Pieds centrés)', execution: 'Pieds au milieu du plateau, largeur bassin.', benefit: 'Développement global de la puissance de la cuisse.', cue: 'Contrôle', tags: ['quadriceps'], unilateral: false },
  { id: 'sled', theme: 'salle', group: 'salle_ant', name: 'Poussée de Chariot (Sled)', execution: 'Pousser chariot lourd, corps incliné en avant.', benefit: 'Puissance concentrique quadri sans aucune compression lombaire.', cue: 'Pousse le sol', tags: ['quadriceps', 'sprint'], unilateral: false },
  { id: 'fentes-marchees', theme: 'salle', group: 'salle_ant', name: 'Fentes marchées (Barre dos)', execution: 'Barre sur le dos, fentes continues. (Gainer très fort les abdos).', benefit: 'Mimétisme de la foulée, force unilatérale.', cue: 'Gaine fort', tags: ['quadriceps', 'gainage'], unilateral: false },
  { id: 'front-squat', theme: 'salle', group: 'salle_ant', name: 'Front Squat', execution: 'Barre clavicules, buste droit. Remontée dynamique.', benefit: 'Protège le bas du dos, alternative supérieure au back squat pour ton profil.', cue: 'Coudes hauts', tags: ['quadriceps', 'gainage'], unilateral: false },
  { id: 'bulgares-sautees', theme: 'salle', group: 'plio', name: 'Fentes Bulgares sautées', execution: 'Fente bulgare -> explosion vers le haut -> atterrir sur step.', benefit: 'Puissance de poussée et raideur de cheville sur une jambe.', cue: 'Explose', tags: ['cheville', 'sprint'], unilateral: true },
  { id: 'box-jumps', theme: 'salle', group: 'plio', name: 'Box Jumps / Haies', execution: 'Sauts verticaux intenses sur caisse ou haies.', benefit: 'Explosivité, recrutement des fibres rapides.', cue: 'Atterris léger', tags: ['sprint'], unilateral: false },
  { id: 'fentes-sautees', theme: 'salle', group: 'plio', name: 'Fentes Sautées', execution: 'Départ fente, saut vertical avec changement de jambe en l’air.', benefit: 'Tolérance lactique et puissance d’éjection.', cue: 'Switch rapide', tags: ['sprint', 'quadriceps'], unilateral: false },
  { id: 'drop-jumps', theme: 'salle', group: 'plio', name: 'Drop Jumps', execution: 'Se laisser tomber d’une caisse (30cm), rebondir instantanément.', benefit: 'Travail pur de la raideur de cheville (temps de contact court).', cue: 'Sol brûlant', tags: ['cheville', 'sprint'], unilateral: false },
  { id: 'foulees-bondissantes', theme: 'salle', group: 'plio', name: 'Foulées Bondissantes', execution: 'Enchaîner bonds avant, chercher amplitude max (sur piste/gazon).', benefit: 'Transfert plyométrique direct pour la longueur de foulée.', cue: 'Amplitude', tags: ['sprint', 'cheville'], unilateral: false },
]
