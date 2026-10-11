import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { requestPersistence } from './lib/streaks.js'
import { addProfiles } from './lib/profile.js'
import { watchErrors } from './lib/errors.js'
import { IS_STAGING } from './lib/supabase.js'

watchErrors()
requestPersistence()
// Déploiement de test branché sur le coffre de staging : visible dans l'onglet
if (IS_STAGING) document.title = `[staging] ${document.title}`

// Profils personnels présents seulement sur l'ordinateur de dev (fichier hors git, absent en ligne)
for (const m of Object.values(import.meta.glob('./data/profiles.local.js', { eager: true }))) addProfiles(m.LOCAL_PROFILES)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
