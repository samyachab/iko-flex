import { createClient } from '@supabase/supabase-js'

// Adresse du projet et clé publique : faites pour être dans l'appli (chaque accès est filtré par
// les verrous RLS, voir supabase/migrations). Jamais de clé secrète ici.
// Les déploiements de test (Preview sur Vercel) pointent vers le projet de staging grâce aux variables
// VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY ; sans elles, c'est la production.
const PROD_URL = 'https://lmbszpivshkdjllkfyjy.supabase.co'
const PROD_KEY = 'sb_publishable_X-svPWL3mdcd-I5wxt11QQ_xxZTNpOm'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || PROD_URL
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || PROD_KEY
export const IS_STAGING = SUPABASE_URL !== PROD_URL

export const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
