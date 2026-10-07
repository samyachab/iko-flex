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
let voice = null

function scoreVoice(v) {
  if (!v.lang?.toLowerCase().startsWith('fr')) return -1
  let s = 0
  if (/premium|enhanced|améliorée|natural|neural|online/i.test(v.name)) s += 10
  if (/google|microsoft|siri/i.test(v.name)) s += 4
  if (/amélie|amelie|thomas|audrey|aurélie|aurelie|denise|henri|vivienne|remy|rémy/i.test(v.name)) s += 3
  if (v.lang.toLowerCase() === 'fr-fr') s += 2
  return s
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  voice = voices.filter((v) => scoreVoice(v) >= 0).sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null
}

if ('speechSynthesis' in window) {
  pickVoice()
  // La liste des voix arrive souvent en différé (Chrome, Android)
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'fr-FR'
  u.rate = 1
  window.speechSynthesis.speak(u)
}
