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

export function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  u.rate = 1.05
  window.speechSynthesis.speak(u)
}
