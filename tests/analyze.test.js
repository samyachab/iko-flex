import { describe, expect, it } from 'vitest'
import { analyzeText } from '../src/lib/analyze.js'

const found = (text) => analyzeText(text).conditions

describe('analyse du texte libre', () => {
  it('texte vide', () => {
    expect(analyzeText('')).toEqual({ conditions: [], sport: null })
    expect(analyzeText('   ')).toEqual({ conditions: [], sport: null })
  })

  it('accents, majuscules et apostrophes typographiques', () => {
    expect(found('J’ai MAL À L’ÉPAULE droite')).toContain('douleur_epaule')
  })

  it('négation dans la phrase : pas de douleur retenue', () => {
    expect(found('Plus mal au genou depuis longtemps')).not.toContain('douleur_genou')
    expect(found('Aucune douleur au dos')).not.toContain('lombalgie')
  })

  it('négation limitée à son morceau de phrase', () => {
    const c = found('Plus mal au genou, mais des entorses de cheville')
    expect(c).not.toContain('douleur_genou')
    expect(c).toContain('cheville_instable')
  })

  it('la négation ne retire pas une posture', () => {
    expect(found('Pas de douleur, juste le dos rond')).toContain('cyphose')
  })

  it('genou : la précision remplace le générique', () => {
    const tendon = found('mal sous la rotule quand je saute')
    expect(tendon).toContain('tendinite_rotulienne')
    expect(tendon).not.toContain('douleur_genou')
    expect(tendon).not.toContain('femoro_patellaire')
    const fp = found('douleur autour de la rotule dans les escaliers')
    expect(fp).toContain('femoro_patellaire')
    expect(fp).not.toContain('tendinite_rotulienne')
    expect(fp).not.toContain('douleur_genou')
    expect(found('le genou me fait mal')).toContain('douleur_genou')
  })

  it('dos : en se penchant ou debout remplace la lombalgie générique', () => {
    const flex = found('mal au bas du dos quand je me penche')
    expect(flex).toContain('lombalgie_flexion')
    expect(flex).not.toContain('lombalgie')
    const ext = found('lombaires douloureuses quand je reste debout')
    expect(ext).toContain('lombalgie_extension')
    expect(ext).not.toContain('lombalgie')
    expect(found('lumbago')).toContain('lombalgie')
  })

  it('talon : insertion d’Achille plutôt que milieu du tendon ou fasciite', () => {
    const c = found('douleur derrière le talon, au tendon d’Achille')
    expect(c).toContain('achille_insertion')
    expect(c).not.toContain('tendinite_achille')
    expect(c).not.toContain('fasciite_plantaire')
    expect(found('tendinite d’Achille')).toContain('tendinite_achille')
    expect(found('mal sous le pied le matin')).toContain('fasciite_plantaire')
  })

  it('côté de la hanche : tendons fessiers, pas le pincement avant', () => {
    const c = found('douleur sur le côté de la hanche quand je dors dessus')
    expect(c).toContain('tendinopathie_fessiere')
    expect(c).not.toContain('douleur_hanche')
    expect(found('pincement à la hanche')).toContain('douleur_hanche')
  })

  it('sciatique, postures et objectifs', () => {
    expect(found('une douleur qui descend dans la jambe')).toContain('sciatique')
    expect(found('je suis très cambré, psoas raide')).toEqual(expect.arrayContaining(['hyperlordose', 'psoas_raide']))
    expect(found('je veux gagner en souplesse et me renforcer')).toEqual(expect.arrayContaining(['souplesse_globale', 'force']))
    expect(found('je travaille assis devant un ordinateur')).toContain('posture_bureau')
  })

  it('sport : le premier reconnu', () => {
    expect(analyzeText('Je cours le 800 en club').sport).toBe('course')
    expect(analyzeText('trail le week-end').sport).toBe('course')
    expect(analyzeText('je fais du padel').sport).toBe('raquette')
    expect(analyzeText('basket deux fois par semaine').sport).toBe('collectif')
    expect(analyzeText('rien de spécial').sport).toBeNull()
  })
})
