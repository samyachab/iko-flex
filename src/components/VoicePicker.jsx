import { useState } from 'react'
import { VOICES, currentVoice, isVoiceMuted, setVoice, setVoiceMuted, speak, unlockAudio } from '../lib/audio.js'
import { PHRASES } from '../lib/phrases.js'

// Choix de la voix du coach (réglages + labo) : toucher une voix = l'écouter et la garder.
export default function VoicePicker({ className = '' }) {
  const [selected, setSelected] = useState(currentVoice)
  const [muted, setMuted] = useState(isVoiceMuted)

  const choose = (key) => {
    unlockAudio()
    setVoice(key)
    setSelected(key)
    speak(PHRASES.done, key, { force: true })
  }
  const toggleMute = () => {
    setVoiceMuted(!muted)
    setMuted(!muted)
  }

  return (
    <section className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-medium">Voix du coach</h2>
        <button
          role="switch"
          aria-checked={!muted}
          onClick={toggleMute}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${muted ? 'border-white/15 text-white/50' : 'border-white/40 bg-white/10 text-white'}`}
        >
          {muted ? '🔇 Coupée' : '🔊 Activée'}
        </button>
      </div>
      <p className="mt-1 text-xs text-white/40">
        {muted ? 'Le coach ne parle plus pendant les séances (les bips restent).' : 'Touche une voix pour l’écouter et la garder.'}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {VOICES.map((v) => (
          <li key={v.key}>
            <button
              onClick={() => choose(v.key)}
              className={`h-full w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                v.key === selected ? 'border-white/60 bg-white/10' : 'border-white/10'
              }`}
            >
              <span className="font-semibold">{v.name}</span>
              {v.key === selected && <span className="ml-1.5 text-xs text-white/60">✓</span>}
              <span className="block text-xs text-white/40">{v.desc}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
