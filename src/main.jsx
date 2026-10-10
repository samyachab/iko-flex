import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { requestPersistence } from './lib/streaks.js'
import { addProfiles } from './lib/profile.js'

requestPersistence()

// Profils personnels présents seulement sur l'ordinateur de dev (fichier hors git, absent en ligne)
for (const m of Object.values(import.meta.glob('./data/profiles.local.js', { eager: true }))) addProfiles(m.LOCAL_PROFILES)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
