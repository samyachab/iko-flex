// Remontée des plantages : toute erreur JavaScript non rattrapée part dans le journal du coffre
// (supabase/migrations/0011_erreurs.sql), qui prévient le coach sur Telegram.
// Pas de données de santé : message, pile d'appels, page sans paramètres, version, navigateur.
import { supabase } from './supabase.js'

const MAX_PER_PAGE = 5 // une boucle d'erreurs n'envoie pas plus de 5 rapports par ouverture de l'appli
// Bruit connu, sans rapport avec l'appli (extensions, scripts tiers, avertissement bénin du navigateur)
const IGNORED = [/^Script error\.?$/, /ResizeObserver loop/, /chrome-extension:|moz-extension:|safari-extension:/]

const seen = new Set()

export function reportError(error) {
  const message = String(error?.message ?? error ?? '').trim()
  const stack = typeof error?.stack === 'string' ? error.stack : null
  if (!message || IGNORED.some((re) => re.test(message) || (stack && re.test(stack)))) return
  if (seen.has(message) || seen.size >= MAX_PER_PAGE) return
  seen.add(message)
  supabase
    .rpc('log_client_error', {
      p_message: message,
      p_stack: stack,
      p_url: location.pathname + location.hash,
      p_release: __RELEASE__,
      p_user_agent: navigator.userAgent,
    })
    .then(
      () => {},
      () => {}, // hors ligne ou coffre indisponible : tant pis, jamais d'erreur en cascade
    )
}

export function watchErrors() {
  if (import.meta.env.DEV) return // en développement, la console suffit
  window.addEventListener('error', (e) => reportError(e.error ?? e.message))
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason))
}
