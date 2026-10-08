import VOICE_IDS from '../data/voice-manifest.json'
import { phraseId } from './phrases.js'

let ctx

// Élément audio unique pour la voix enregistrée. Sur iOS, un <audio> joue même en mode silencieux,
// contrairement à Web Audio (coupé par le bouton silencieux) ; il doit être "débloqué" par un geste.
let clipEl = null

// Mini WAV silencieux (0,05 s) généré à la volée, pour débloquer l'élément audio pendant le geste
function silentWav() {
  const n = 1200
  const b = new DataView(new ArrayBuffer(44 + n * 2))
  const w = (o, str) => [...str].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)))
  w(0, 'RIFF'); b.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ')
  b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true)
  b.setUint32(24, 24000, true); b.setUint32(28, 48000, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true)
  w(36, 'data'); b.setUint32(40, n * 2, true)
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }))
}

// À appeler sur un geste utilisateur (iOS/Chrome bloquent l'audio sinon).
export function unlockAudio() {
  // iOS 16.4+ : catégorie "lecture" = le son passe même avec le bouton silencieux (bips compris)
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback'
  } catch {
    // non supporté
  }
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  if (!clipEl) {
    clipEl = new Audio()
    clipEl.preload = 'auto'
    clipEl.src = silentWav()
    clipEl.play().catch(() => {})
  }
}

function tone(freq, duration, delay = 0, volume = 0.25) {
  if (!ctx) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

export const beep = {
  tick: () => tone(880, 0.12),
  workEnd: () => {
    tone(660, 0.18)
    tone(440, 0.4, 0.2)
  },
  go: () => {
    tone(880, 0.12)
    tone(1320, 0.35, 0.14)
  },
  switchSide: () => {
    tone(1000, 0.1)
    tone(1000, 0.1, 0.15)
  },
  victory: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, i * 0.12, 0.2)),
}

// Choix de la voix française la plus naturelle disponible sur l'appareil.
// Sans choix explicite, le navigateur prend souvent une voix robotique par défaut.
// Sur iOS, la qualité n'apparaît que dans voiceURI (ex. com.apple.voice.premium.fr-FR.Aurelie),
// et les voix Siri ne sont jamais exposées aux pages web.
const VOICE_KEY = 'iko-flex:voice'
let voice = null

export function scoreVoice(v) {
  if (!v.lang?.toLowerCase().startsWith('fr')) return -1
  const id = `${v.name} ${v.voiceURI}`
  let s = 0
  if (/premium/i.test(id)) s += 12
  if (/enhanced|améliorée|natural|neural|online/i.test(id)) s += 8
  if (/google|microsoft/i.test(id)) s += 4
  if (/amélie|amelie|thomas|audrey|aurélie|aurelie|denise|henri|vivienne|remy|rémy/i.test(id)) s += 3
  if (v.lang.toLowerCase().replace('_', '-') === 'fr-fr') s += 2
  return s
}

export function frenchVoices() {
  if (!('speechSynthesis' in window)) return []
  return window.speechSynthesis
    .getVoices()
    .filter((v) => scoreVoice(v) >= 0)
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))
}

function pickVoice() {
  const voices = frenchVoices()
  let saved = null
  try {
    saved = localStorage.getItem(VOICE_KEY)
  } catch {
    // stockage indisponible : choix automatique
  }
  voice = voices.find((v) => v.voiceURI === saved) ?? voices[0] ?? null
}

export function currentVoice() {
  return voice
}

// Choix manuel (page labo) : mémorisé sur l'appareil
export function setVoice(voiceURI) {
  try {
    localStorage.setItem(VOICE_KEY, voiceURI)
  } catch {
    // ignoré
  }
  pickVoice()
}

if ('speechSynthesis' in window) {
  pickVoice()
  // La liste des voix arrive souvent en différé (Chrome, Android, iOS)
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

// Voix pré-enregistrée (Vivienne) : fichiers public/voice/<id>.mp3 (mis en cache hors ligne),
// joués par l'élément audio débloqué au lancement. Voix du système en secours si une phrase manque.
const RECORDED = new Set(VOICE_IDS)
const clipUrl = (id) => `/voice/${id}.mp3`

// Précharge les phrases d'une séance (cache navigateur) pour qu'elles partent sans délai
export function preloadSpeech(texts) {
  for (const t of texts) {
    const id = phraseId(t)
    if (RECORDED.has(id)) fetch(clipUrl(id)).catch(() => {})
  }
}

export function stopSpeech() {
  clipEl?.pause()
  window.speechSynthesis?.cancel()
}

function speakSystem(text) {
  if (!('speechSynthesis' in window)) return
  if (!voice) pickVoice()
  const u = new SpeechSynthesisUtterance(text)
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'fr-FR'
  u.rate = 1
  window.speechSynthesis.speak(u)
}

export function speak(text) {
  stopSpeech()
  const id = phraseId(text)
  if (!clipEl || !RECORDED.has(id)) return speakSystem(text)
  if (ctx?.state === 'suspended') ctx.resume()
  clipEl.src = clipUrl(id)
  clipEl.currentTime = 0
  clipEl.play().catch(() => speakSystem(text))
}
