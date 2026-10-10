// Photo de profil : chargée, recadrée par la personne (PhotoCropper), puis redessinée en carré de 320 px.
// Redessiner l'image supprime ses métadonnées, dont la position GPS. Quelques dizaines de Ko au lieu de Mo.
export const OUTPUT = 320

export function loadImage(file) {
  const url = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image illisible'))
    }
    img.src = url
  })
}

// Découpe le carré (sx, sy, side) de l'image d'origine et le réduit en JPEG
export function cropToBlob(img, sx, sy, side) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = OUTPUT
  canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, OUTPUT, OUTPUT)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('conversion impossible'))), 'image/jpeg', 0.85),
  )
}
