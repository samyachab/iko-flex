import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Source : assets/logo-square.png (généré depuis assets/logo-iko-flex.png, fond #121212)
const dark = { background: '#121212' }

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0, resizeOptions: dark },
    maskable: { ...minimal2023Preset.maskable, padding: 0.2, resizeOptions: dark },
    apple: { ...minimal2023Preset.apple, padding: 0.1, resizeOptions: dark },
  },
  images: ['assets/logo-square.png'],
})
