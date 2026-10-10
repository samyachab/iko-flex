import { createClient } from '@supabase/supabase-js'

// Adresse du projet et clé publique : faites pour être dans l'appli (chaque accès est filtré par
// les verrous RLS, voir supabase/migrations). Jamais de clé secrète ici.
const URL = 'https://lmbszpivshkdjllkfyjy.supabase.co'
const PUBLISHABLE_KEY = 'sb_publishable_X-svPWL3mdcd-I5wxt11QQ_xxZTNpOm'

export const supabase = createClient(URL, PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
