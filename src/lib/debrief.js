// Tag -> zone (phrase "Tu as travaillé...") et transfert 800m.
// L'ordre définit la priorité d'affichage des transferts.
const TAGS = {
  psoas: { zone: 'le psoas', transfer: 'Ton bassin est libéré : ta foulée gagne en amplitude sans cambrer.' },
  bassin: { zone: 'la position du bassin', transfer: 'Bassin en rétroversion = lombaires protégées quand la fatigue arrive au 600m.' },
  omoplates: { zone: 'les omoplates', transfer: 'Omoplates fixées = bras puissants et relâchés dans la dernière ligne droite.' },
  thorax: { zone: 'la cage thoracique', transfer: 'Cage thoracique ouverte : plus d’air disponible pour le sprint final.' },
  cheville: { zone: 'les chevilles', transfer: 'Meilleure dorsiflexion = amorti plus réactif et temps de contact plus court.' },
  fessiers: { zone: 'les fessiers', transfer: 'Fessiers allumés = propulsion plus forte et bassin stable à chaque appui.' },
  ischios: { zone: 'les ischios', transfer: 'Ischios souples et solides : cycle arrière plus efficace, risque de claquage réduit.' },
  gainage: { zone: 'le gainage', transfer: 'Tronc verrouillé : zéro énergie perdue en rotation, même dans le rouge.' },
  quadriceps: { zone: 'les quadriceps', transfer: 'Quadris plus forts = relance explosive au dernier virage.' },
  epaules: { zone: 'les épaules', transfer: 'Épaules basses et détendues : posture haute, respiration libre.' },
  trapezes: { zone: 'les trapèzes', transfer: 'Trapèzes relâchés = moins de crispation quand l’acide lactique monte.' },
  hanches: { zone: 'les hanches', transfer: 'Hanches mobiles : genou qui monte plus haut, foulée plus fluide.' },
  adducteurs: { zone: 'les adducteurs', transfer: 'Adducteurs ouverts : stabilité latérale dans les virages.' },
  mollets: { zone: 'les mollets', transfer: 'Mollets profonds relâchés = amortisseurs prêts pour la piste.' },
  pectoraux: { zone: 'les pectoraux', transfer: 'Pectoraux ouverts : épaules qui ne s’enroulent plus en fin de course.' },
  nerf: { zone: 'le nerf sciatique', transfer: 'Nerf libéré : la « fausse raideur » des ischios disparaît.' },
  cervicales: { zone: 'les cervicales', transfer: 'Nuque détendue : regard loin, tête stable jusqu’à la ligne.' },
  sprint: { zone: 'l’explosivité', transfer: 'Jambe d’appui plus forte : coup de rein disponible pour le finish.' },
}

const joinFr = (items) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`

export function buildDebrief(exercises) {
  const counts = {}
  for (const ex of new Set(exercises)) for (const t of ex.tags) counts[t] = (counts[t] ?? 0) + 1

  const order = Object.keys(TAGS)
  const ranked = Object.keys(counts)
    .filter((t) => TAGS[t])
    .sort((a, b) => counts[b] - counts[a] || order.indexOf(a) - order.indexOf(b))

  return {
    zones: joinFr(ranked.slice(0, 3).map((t) => TAGS[t].zone)),
    zoneList: ranked.slice(0, 3).map((t) => TAGS[t].zone),
    transfers: ranked.slice(0, 3).map((t) => TAGS[t].transfer),
    tags: ranked,
  }
}
