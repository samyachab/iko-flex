import VOICE_IDS from '../data/voice-manifest.json'
import { phraseId } from './phrases.js'

let ctx

// À appeler sur un geste utilisateur (iOS/Chrome bloquent l'audio sinon).
export function unlockAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
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

// Voix pré-enregistrée (Vivienne) : fichiers public/voice/<id>.mp3, joués via Web Audio
// (déjà déverrouillé au lancement de la séance). Voix du système en secours si une phrase manque.
const RECORDED = new Set(VOICE_IDS)
const buffers = new Map() // id -> Promise<AudioBuffer>
let source = null
let token = 0

function loadClip(id) {
  if (!buffers.has(id)) {
    const p = fetch(`/voice/${id}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
      .then((b) => ctx.decodeAudioData(b))
    p.catch(() => buffers.delete(id))
    buffers.set(id, p)
  }
  return buffers.get(id)
}

// Précharge les phrases d'une séance pour qu'elles partent sans délai
export function preloadSpeech(texts) {
  if (!ctx) return
  for (const t of texts) {
    const id = phraseId(t)
    if (RECORDED.has(id)) loadClip(id).catch(() => {})
  }
}

export function stopSpeech() {
  token++
  try {
    source?.stop()
  } catch {
    // déjà terminé
  }
  source = null
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
  if (!ctx || !RECORDED.has(id)) return speakSystem(text)
  const mine = token
  loadClip(id)
    .then((buffer) => {
      if (mine !== token) return // une autre phrase a été demandée entre-temps
      source = ctx.createBufferSource()
      source.buffer = buffer
      const gain = ctx.createGain()
      gain.gain.value = 1
      source.connect(gain).connect(ctx.destination)
      source.start()
    })
    .catch(() => mine === token && speakSystem(text))
}
