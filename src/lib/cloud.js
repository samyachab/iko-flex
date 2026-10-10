// Le coffre-fort : compte, fiche, réglages et historique de la personne connectée (Supabase).
// L'appli continue de lire ses données locales (LocalStorage) ; ce module les remplit à la connexion
// et recopie en ligne ce qui change. Sans compte ("continuer sans compte"), tout reste sur l'appareil.
import { supabase } from './supabase.js'
import { EXERCISES } from '../data/exercises.js'
import { addProfiles, setProfileId } from './profile.js'
import { getSettings, onSettingsSaved, saveSettings } from './settings.js'
import { getHistory, mergeHistory } from './streaks.js'
import { mergeRotation } from './rotation.js'

const GUEST_KEY = 'iko-flex:guest'
// Données personnelles effacées de l'appareil à la déconnexion (téléphone prêté, partagé...)
const PERSONAL_KEYS = ['iko-flex:settings', 'iko-flex:streaks', 'iko-flex:rotation', 'iko-flex:profile', GUEST_KEY]

const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))
// Jour local (pas celui du serveur, en UTC) : une séance à 0 h 30 compte pour le bon jour
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
let userId = null

export const isGuest = () => {
  try {
    return localStorage.getItem(GUEST_KEY) === '1'
  } catch {
    return false
  }
}
export function continueAsGuest() {
  try {
    localStorage.setItem(GUEST_KEY, '1')
  } catch {
    // stockage indisponible : invité pour cette visite
  }
}

// Messages Supabase -> phrases claires
function frenchError(error) {
  const m = error?.message ?? ''
  if (/invalid login credentials/i.test(m)) return 'Email ou mot de passe incorrect.'
  if (/already registered|already exists/i.test(m)) return 'Un compte existe déjà avec cet email : connecte-toi.'
  if (/password/i.test(m) && /least|short|weak/i.test(m)) return 'Mot de passe trop court : 8 caractères minimum.'
  if (/email/i.test(m) && /invalid/i.test(m)) return 'Cet email n’a pas l’air valide.'
  if (/signups? not allowed|disabled/i.test(m)) return 'Les inscriptions sont fermées pour le moment.'
  if (/fetch|network/i.test(m)) return 'Pas de connexion internet.'
  return 'Ça n’a pas marché, réessaie dans un instant.'
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) return { error: frenchError(error) }
  return { user: data.user }
}

export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() } },
  })
  if (error) return { error: frenchError(error) }
  if (!data.session) return { error: 'Compte créé, mais la connexion directe est désactivée : préviens Samy.' }
  return { user: data.user }
}

// scope 'local' : seulement cet appareil (après suppression du compte, le serveur ne le connaît plus)
export async function signOut(scope = 'global') {
  await supabase.auth.signOut({ scope })
  userId = null
  try {
    for (const k of PERSONAL_KEYS) localStorage.removeItem(k)
  } catch {
    // rien à effacer
  }
}

// À l'ouverture : session existante ? Si oui, on remplit l'appareil depuis le coffre.
// Renvoie { user, name, personalized }, null (pas connecté) ou { failed: true } si la session n'a pas pu être lue
// (ex. verrou de session tenu par un autre onglet) : l'appli s'ouvre alors avec les données de l'appareil.
const BOOT_TIMEOUT = 8000
export function bootstrap() {
  const timeout = new Promise((resolve) => setTimeout(() => resolve({ failed: true }), BOOT_TIMEOUT))
  return Promise.race([readAccount().catch(() => ({ failed: true })), timeout])
}

async function readAccount() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const user = data.session?.user
  if (!user) return null
  userId = user.id
  try {
    const [profile] = await Promise.all([loadProfile(user), syncSettings(), syncHistory()])
    return { user, ...profile }
  } catch {
    // hors ligne : on garde ce qui est déjà sur l'appareil
    return { user, name: user.user_metadata?.name ?? null, personalized: false, offline: true }
  }
}

// Fiche : validée par le coach -> profil perso ; sinon routine générale
async function loadProfile(user) {
  const [{ data, error }, coach, intake] = await Promise.all([
    supabase.from('profiles').select('name, status, data').eq('id', user.id).maybeSingle(),
    supabase.rpc('is_coach'),
    supabase.from('intakes').select('mode').eq('user_id', user.id).maybeSingle(),
  ])
  if (error) throw error
  const personalized = data?.status === 'active' && Object.keys(data.data ?? {}).length > 0
  if (personalized) {
    addProfiles({ [user.id]: { ...data.data, id: user.id, name: data.name ?? 'Moi' } })
    setProfileId(user.id)
  } else setProfileId('general')
  return {
    name: data?.name ?? user.user_metadata?.name ?? null,
    personalized,
    status: data?.status ?? 'general',
    coach: coach.data === true,
    // Questionnaire d'accueil à proposer : jamais rempli, et pas de fiche déjà faite par le coach
    needsOnboarding: !intake.error && !intake.data && data?.status === 'general',
  }
}

// Réglages : ceux du coffre gagnent ; s'il est vide (premier appareil), on y envoie ceux du téléphone
async function syncSettings() {
  const { data, error } = await supabase.from('user_settings').select('settings').eq('user_id', userId).maybeSingle()
  if (error) throw error
  const remote = data?.settings ?? {}
  if (Object.keys(remote).length) {
    saveSettings({ ...getSettings(), ...remote }, { silent: true })
  } else await pushSettings(getSettings())
}

let settingsTimer = null
async function pushSettings(settings) {
  if (!userId) return
  await supabase.from('user_settings').upsert({ user_id: userId, settings })
}
// Chaque changement de réglage part en ligne (regroupé sur 1 s)
onSettingsSaved((settings) => {
  if (!userId) return
  clearTimeout(settingsTimer)
  settingsTimer = setTimeout(() => pushSettings(settings).catch(() => {}), 1000)
})

// Historique : séances de l'appareil absentes du coffre -> envoyées ; séances du coffre -> ajoutées ici
async function syncHistory() {
  const { data: rows, error } = await supabase.from('sessions').select('routine, done_on, exercises').order('done_on')
  if (error) throw error
  const known = new Set(rows.map((r) => `${r.done_on}|${r.routine}`))
  const missing = Object.entries(getHistory()).flatMap(([day, types]) =>
    types.filter((t) => !known.has(`${day}|${t}`)).map((routine) => ({ routine, done_on: day, exercises: [] })),
  )
  if (missing.length) await supabase.from('sessions').insert(missing)

  const days = {}
  const rotation = { souplesse: { zones: {}, exercises: {} }, renfo: { zones: {}, exercises: {} } }
  for (const r of rows) {
    ;(days[r.done_on] ??= []).push(r.routine)
    const rot = rotation[r.routine]
    for (const id of r.exercises) {
      rot.exercises[id] = r.done_on
      if (byId[id]) rot.zones[byId[id].group] = r.done_on
    }
  }
  mergeHistory(days)
  for (const [key, rot] of Object.entries(rotation)) mergeRotation(key, rot)
}

// Séance validée : une ligne dans le coffre (si hors ligne, elle repartira à la prochaine ouverture)
export function pushSession(routine, exercises) {
  if (!userId) return
  supabase
    .from('sessions')
    .insert({ routine, done_on: today(), exercises: [...new Set(exercises.map((e) => e.id))] })
    .then(() => {}, () => {})
}

// ───────── Droits RGPD : export et suppression ─────────

// Toutes les données du compte, telles qu'elles sont dans le coffre, en un fichier JSON
export async function exportMyData() {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return { error: 'Connecte-toi pour exporter tes données.' }
  const [profile, settings, sessions, player, intake] = await Promise.all([
    supabase.from('profiles').select('name, status, data, created_at, updated_at').eq('id', user.id).maybeSingle(),
    supabase.from('user_settings').select('settings, updated_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('sessions').select('routine, done_on, exercises, created_at').order('done_on'),
    supabase.from('players').select('display_name, avatar, share, photo_path, updated_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('intakes').select('mode, answers, proposal, red_flags, health_consent_at, submitted_at').eq('user_id', user.id).maybeSingle(),
  ])
  const failed = [profile, settings, sessions].find((r) => r.error)
  if (failed) return { error: frenchError(failed.error) }
  const content = {
    exporte_le: new Date().toISOString(),
    compte: { email: user.email, cree_le: user.created_at, derniere_connexion: user.last_sign_in_at },
    fiche: profile.data,
    reglages: settings.data,
    seances: sessions.data,
    profil_public: player.data ?? null,
    questionnaire: intake.data ?? null,
  }
  const file = new File([JSON.stringify(content, null, 2)], `iko-flex-mes-donnees-${today()}.json`, { type: 'application/json' })
  // iPhone (app installée) : la feuille de partage permet d'enregistrer le fichier ; ailleurs, téléchargement
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Mes données Iko Flex' })
      return { ok: true }
    } catch (e) {
      if (e?.name === 'AbortError') return { ok: false }
    }
  }
  const url = URL.createObjectURL(file)
  const a = Object.assign(document.createElement('a'), { href: url, download: file.name })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  return { ok: true }
}

// Suppression définitive : compte, fiche, réglages et séances (côté coffre), puis l'appareil
export async function deleteAccount() {
  await removeAllPhotos().catch(() => {})
  const { error } = await supabase.rpc('delete_my_account')
  if (error) return { error: frenchError(error) }
  await signOut('local')
  return { ok: true }
}

// ───────── Espace coach ─────────

// Toutes les personnes inscrites, avec fiche et activité (refusé côté serveur si on n'est pas coach)
export async function listAthletes() {
  const { data, error } = await supabase.rpc('coach_overview')
  if (error) return { error: frenchError(error) }
  return { athletes: data }
}

// Enregistre la fiche d'une personne (statut + contenu) ; seul un coach y est autorisé (RLS).
// Une fiche touchée par le coach n'est plus écrasée si la personne refait son questionnaire.
export async function saveAthlete(id, { status, data }) {
  const { error } = await supabase
    .from('profiles')
    .update({ status, data, coach_edited_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: frenchError(error) }
  return { ok: true }
}

// Nouveaux inscrits depuis la dernière visite du coach dans son espace (mémorisé sur l'appareil)
const COACH_SEEN_KEY = 'iko-flex:coach-seen'
export async function countNewSignups() {
  const res = await listAthletes()
  if (res.error) return 0
  let seen = null
  try {
    seen = localStorage.getItem(COACH_SEEN_KEY)
  } catch {
    // stockage indisponible : tout le monde compte comme nouveau
  }
  return res.athletes.filter((a) => !seen || a.joined_at > seen).length
}
export function markSignupsSeen() {
  try {
    localStorage.setItem(COACH_SEEN_KEY, new Date().toISOString())
  } catch {
    // stockage indisponible
  }
}

// ───────── Questionnaire d'accueil ─────────

// Envoie les réponses ; en sur-mesure, le coffre active tout de suite la fiche proposée (le coach peut l'ajuster)
export async function submitIntake({ mode, answers, proposal, redFlags }) {
  if (!userId) return { error: 'Connecte-toi pour envoyer ton questionnaire.' }
  const { error } = await supabase.from('intakes').upsert({
    user_id: userId,
    mode,
    answers,
    proposal,
    red_flags: Boolean(redFlags),
    health_consent_at: answers.consent ? new Date().toISOString() : null,
    submitted_at: new Date().toISOString(),
  })
  if (error) return { error: frenchError(error) }
  return { ok: true }
}

// ───────── Profil public et classement entre amis ─────────

// Pseudo, avatar, participation au classement (null si jamais réglé)
export async function getPlayer() {
  if (!userId) return null
  const { data } = await supabase.from('players').select('display_name, avatar, share, photo_path').eq('user_id', userId).maybeSingle()
  return data
}

// ───────── Photo de profil (stockage privé "avatars", un dossier par personne) ─────────

const BUCKET = 'avatars'

// Envoie la photo déjà recadrée (components/PhotoCropper.jsx) ; supprime l'ancienne.
// Renvoie le chemin à enregistrer dans players.
export async function uploadPhoto(blob, previousPath) {
  if (!userId) return { error: 'Connecte-toi d’abord.' }
  const path = `${userId}/${Date.now()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
  if (error) return { error: frenchError(error) }
  if (previousPath) await supabase.storage.from(BUCKET).remove([previousPath])
  return { path }
}

export async function removePhoto(path) {
  if (path) await supabase.storage.from(BUCKET).remove([path])
}

// Liens temporaires (1 h) pour afficher des photos privées : { chemin: url }
export async function photoUrls(paths) {
  const list = [...new Set(paths.filter(Boolean))]
  if (!list.length) return {}
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(list, 3600)
  return Object.fromEntries((data ?? []).filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]))
}

// Toutes ses photos (pour la suppression du compte : le stockage n'est pas effacé en cascade)
async function removeAllPhotos() {
  const { data } = await supabase.storage.from(BUCKET).list(userId)
  if (data?.length) await supabase.storage.from(BUCKET).remove(data.map((f) => `${userId}/${f.name}`))
}

export async function savePlayer(player) {
  if (!userId) return { error: 'Connecte-toi d’abord.' }
  const { error } = await supabase
    .from('players')
    .upsert({ user_id: userId, ...player, updated_at: new Date().toISOString() })
  if (error) return { error: frenchError(error) }
  return { ok: true }
}

// Classement (vide tant qu'on n'y participe pas soi-même)
export async function getLeaderboard() {
  const { data, error } = await supabase.rpc('leaderboard', { p_today: today() })
  if (error) return { error: frenchError(error) }
  return { rows: data }
}
