// Liste les phrases à pré-enregistrer (exercices des routines maison) au format JSON [{ id, text }].
// Usage : node scripts/voice-phrases.mjs > scripts/.voice-phrases.json
import { EXERCISES } from '../src/data/exercises.js'
import { allPhrases, phraseId } from '../src/lib/phrases.js'

const home = EXERCISES.filter((e) => e.theme !== 'salle')
const out = allPhrases(home).map((text) => ({ id: phraseId(text), text }))
process.stdout.write(JSON.stringify(out, null, 2))
