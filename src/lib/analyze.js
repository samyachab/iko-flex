// Analyse du texte libre du questionnaire, directement sur le téléphone (rien n'est envoyé à une IA).
// Repère des mots-clés et les traduit en conditions (data/conditions.js) et en sport. La personne voit ce
// qui a été compris et peut le retirer ; le coach relit le texte complet avant de valider la fiche.
import { CONDITIONS } from '../data/conditions.js'

// Minuscules, sans accents, apostrophes simplifiées : « Mal à l’épaule » -> « mal a l'epaule »
const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’`]/g, "'")

// L'ordre compte : une règle plus précise passe avant une plus large (rotule avant genou)
const RULES = [
  // Douleurs
  ['sciatique', /sciatique|descend (dans|le long de) (la|ma) jambe|irradie|nerf sciatique/],
  ['lombalgie_flexion', /(dos|lombaire).{0,40}(penche|assis|ramass|lacer|hernie)|(penche|assis|ramass).{0,40}(dos|lombaire)|hernie/],
  ['lombalgie_extension', /(dos|lombaire).{0,40}(debout|cambr|pietin)|(debout|cambr|pietin).{0,40}(dos|lombaire)/],
  ['lombalgie', /bas du dos|lombaire|lombalgie|lumbago|mal au dos|dos bloque/],
  ['piriforme', /piriforme|pyramidal|fond de la fesse|fesse.{0,25}(profond|descend)/],
  ['ischio_proximal', /sous la fesse|(assis|chaise).{0,30}ischio|ischio.{0,30}(assis|haut|attache)/],
  ['tendinopathie_fessiere', /(cote|exterieur) de la hanche|trochanter|bursite|moyen fessier.{0,20}(mal|douleur|tendin)/],
  ['pubalgie', /pubalgie|pubis|aine|adducteur.{0,20}(mal|douleur|tendin|bless)/],
  ['epicondylite', /epicondyl|tennis elbow|coude/],
  ['coiffe_rotateurs', /coiffe|sus.?epineux|(lever|monter) (le|les) bras.{0,20}(mal|douleur)|(mal|douleur).{0,25}(lever|monter) (le|les) bras/],
  ['femoro_patellaire', /femoro|autour de la rotule|rotule|(escalier|marche).{0,30}genou|genou.{0,30}(escalier|marche|assis longtemps)/],
  ['achille_insertion', /(arriere|derriere) (du|le) talon|insertion|haglund/],
  ['fracture_fatigue', /fracture de fatigue|fissure|point precis.{0,20}os/],
  ['cervicalgie', /nuque|cervical|torticolis|mal au cou/],
  ['douleur_epaule', /(mal|douleur|tendinite|douloureu).{0,25}epaule|epaule.{0,20}(mal|douleur|douloureu)|coiffe des rotateurs/],
  ['douleur_poignet', /poignet/],
  ['douleur_hanche', /(mal|douleur|pince|pincement).{0,25}hanche|hanche.{0,20}(mal|douleur|pince)|conflit de hanche/],
  ['tendinite_rotulienne', /sous la rotule|rotulien|tendon (de la |sous la )?rotule|genou du sauteur/],
  ['tfl', /\btfl\b|bandelette|essuie.?glace|exterieur (de la|du) (cuisse|genou)/],
  ['douleur_genou', /genou/],
  ['periostite_tibiale', /periostite|tibia/],
  ['tendinite_achille', /achille/],
  ['fasciite_plantaire', /fasciite|aponevros|sous (le|mon) pied|talon.{0,20}(mal|douleur)|(mal|douleur).{0,20}talon/],
  ['cheville_instable', /entorse|cheville.{0,25}(tourne|instable|fragile|faible)/],
  // Posture
  ['hyperlordose', /hyperlordose|cambr|antevers|dos (trop )?creus/],
  ['dos_plat', /dos plat|retrovers/],
  ['cyphose', /dos rond|dos vout|cyphose/],
  ['tete_en_avant', /tete (en|vers l') ?avant|cou (en|vers l') ?avant|text neck/],
  ['epaules_enroulees', /epaules? (enroulee|en avant|rentree|fermee|qui rentrent|qui tombent)/],
  ['epaules_crispees', /trapeze|epaules? (crispee|tendue|qui montent|remontent)/],
  ['epaules_raides', /epaules?.{0,15}(raide|bloquee)|lever les bras/],
  ['psoas_raide', /psoas|flechisseur/],
  ['hanches_raides', /hanches?.{0,15}(raide|bloquee)|mobilite.{0,20}hanche/],
  ['ischios_raides', /ischio|touche(r)? (pas )?(mes|les) pieds|arriere des cuisses/],
  ['mollets_raides', /mollets?.{0,15}(raide|tendu|dur)|crampe/],
  ['dorsiflexion_limitee', /chevilles?.{0,15}(raide|bloquee)|dorsiflexion/],
  ['genoux_en_x', /genoux? en x|genoux qui rentrent|valgus/],
  ['genou_recurvatum', /recurvatum|genoux? (en arriere|qui partent en arriere|en hyperextension)/],
  ['pieds_creux', /pieds? creux|voute (tres )?haute/],
  ['pieds_plats', /pieds? plat|affaiss|pronation/],
  ['scoliose', /scoliose/],
  ['hypermobilite', /hypermobil|hyperlax|trop souple/],
  ['raideur_generale', /raide (de |un peu )?partout|tout raide|pas (du tout )?souple/],
  // Objectifs
  ['souplesse_globale', /souplesse|plus souple|grand ecart/],
  ['mobilite', /mobilite|bouger (plus )?librement/],
  ['force', /\bforce|muscl|renforc|puissan|tonifi/],
  ['posture_bureau', /bureau|assis|ordinateur|ecran|etudes|teletravail/],
  ['prevention_blessures', /blessur|prevenir|prevention/],
  ['relachement', /stress|detend|relax|tension|sommeil|dormir/],
]

const SPORT_RULES = [
  ['course', /course|courir|\bcours\b|running|footing|marathon|trail|athle|\b800\b|sprint/],
  ['collectif', /foot|basket|hand|rugby|volley/],
  ['muscu', /muscu|salle de sport|crossfit|haltero/],
  ['yoga', /yoga|pilates/],
  ['velo', /velo|cyclis|vtt/],
  ['natation', /natation|nage|piscine/],
  ['combat', /boxe|mma|judo|karate|lutte|jiu|combat/],
  ['raquette', /tennis|padel|badminton|squash/],
  ['danse', /danse/],
  ['escalade', /escalade|grimpe|bloc/],
]

// « pas de douleur », « plus mal au genou » : on ne retient pas les douleurs de la phrase
const NO_PAIN = /(pas|plus|aucune?) (de )?(mal|douleur)/

export function analyzeText(text = '') {
  const t = normalize(text)
  if (!t.trim()) return { conditions: [], sport: null }
  // Découpage en morceaux de phrase : « plus mal au genou, mais des entorses » garde les entorses
  const sentences = t.split(/[.!?\n;,]+|\bmais\b/)
  const conditions = new Set()
  for (const s of sentences) {
    for (const [id, re] of RULES) {
      if (!re.test(s)) continue
      if (NO_PAIN.test(s) && CONDITIONS[id]?.kind === 'douleur') continue
      conditions.add(id)
    }
  }
  // Rotule ou TFL déjà trouvés : « genou » seul n'ajoute pas une douleur au genou générique
  if (['tendinite_rotulienne', 'tfl', 'femoro_patellaire'].some((c) => conditions.has(c))) conditions.delete('douleur_genou')
  // Une douleur de dos précisée (en se penchant / debout) remplace la lombalgie générique
  if (conditions.has('lombalgie_flexion') || conditions.has('lombalgie_extension')) conditions.delete('lombalgie')
  // Talon (insertion) précisé : pas de "milieu du tendon" en double
  if (conditions.has('achille_insertion')) conditions.delete('tendinite_achille')
  // Arrière du talon = tendon ; « sous le pied » seulement = fasciite
  if (conditions.has('achille_insertion') && !/sous (le|mon) pied|plante/.test(t)) conditions.delete('fasciite_plantaire')
  // Côté de la hanche = tendons fessiers, pas le pincement à l'avant
  if (conditions.has('tendinopathie_fessiere') && !/(devant|avant|pli) de la hanche|pince/.test(t)) conditions.delete('douleur_hanche')
  // « Sous la rotule » = tendon ; « autour », escaliers = fémoro-patellaire
  if (conditions.has('tendinite_rotulienne') && !/autour de la rotule|escalier|femoro/.test(t)) conditions.delete('femoro_patellaire')
  if (conditions.has('femoro_patellaire') && !/sous la rotule|rotulien|tendon|sauteur/.test(t)) conditions.delete('tendinite_rotulienne')
  const sport = SPORT_RULES.find(([, re]) => re.test(t))?.[0] ?? null
  return { conditions: [...conditions], sport }
}
