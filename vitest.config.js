import { defineConfig } from 'vitest/config'

// Tests du moteur (routines, progression, profils, programmes tendon, analyse du texte).
// Config à part de vite.config.js : pas besoin de React ni du plugin PWA ici.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
  },
})
