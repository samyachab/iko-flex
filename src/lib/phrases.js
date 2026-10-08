// Toutes les phrases dites pendant une séance, au même endroit :
// utilisées par le Player/Récompense ET par scripts/voice-phrases.mjs pour pré-enregistrer la voix.

// Nom prononcé : sans la précision entre parenthèses ("Fentes Bulgares (Haltères)" -> "Fentes Bulgares")
export const spokenName = (ex) => ex.name.replace(/\s*\(.*?\)/g, '').trim()

export const PHRASES = {
  intro: (ex, first) =>
    `${first ? "C'est parti. Premier mouvement" : 'Respire. Ensuite'} : ${spokenName(ex)}.${ex.warning ? ` ${ex.warning}` : ''}`,
  cue: (ex) => `${ex.cue}.`,
  // Exercices unilatéraux : chaque côté est annoncé comme un exercice à part
  cueSide: (ex, side) => `Côté ${side === 1 ? 'droit' : 'gauche'}. ${ex.cue}.`,
  switchSide: 'Change de côté. Côté gauche.',
  done: 'Séance terminée. Bien joué.',
  short: 'Séance écourtée. La série attend la prochaine.',
}

export function allPhrases(exercises) {
  const list = [PHRASES.switchSide, PHRASES.done, PHRASES.short]
  for (const ex of exercises) {
    list.push(PHRASES.intro(ex, true), PHRASES.intro(ex, false))
    if (ex.unilateral) list.push(PHRASES.cueSide(ex, 1), PHRASES.cueSide(ex, 2))
    else list.push(PHRASES.cue(ex))
  }
  return [...new Set(list)]
}

// Identifiant stable d'une phrase (nom du fichier audio) : hash djb2 en base 36
export function phraseId(text) {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0
  return h.toString(36)
}
