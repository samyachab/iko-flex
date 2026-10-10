import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Blob from '../components/Blob.jsx'
import { signIn, signUp } from '../lib/cloud.js'
import { TONES, gradient, rise } from '../lib/theme.js'

const MIN_PASSWORD = 8

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">{label}</span>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/40"
      />
    </label>
  )
}

// Connexion : email + mot de passe, connecté tout de suite (aucun email envoyé).
// "Continuer sans compte" garde tout sur l'appareil, avec la routine générale.
export default function Login({ onDone, onGuest }) {
  const [mode, setMode] = useState('signup') // 'signup' | 'signin'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const signup = mode === 'signup'
  const t = TONES.souplesse

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (signup && !name.trim()) return setError('Ton prénom, pour que l’appli te reconnaisse.')
    if (password.length < MIN_PASSWORD) return setError(`Mot de passe : ${MIN_PASSWORD} caractères minimum.`)
    setBusy(true)
    const res = signup ? await signUp(email, password, name) : await signIn(email, password)
    setBusy(false)
    if (res.error) return setError(res.error)
    onDone()
  }

  return (
    <div className="safe-top safe-bottom flex h-full flex-col overflow-y-auto px-6 [--sb:2rem] [--st:2rem]">
      <motion.div {...rise(0)} className="flex items-center gap-4">
        <Blob tone="souplesse" size={54} speed={0.6} />
        <img src="/logo-wordmark.png" alt="Iko Flex" className="h-8 w-auto" draggable={false} />
      </motion.div>

      <motion.h1 {...rise(0.08)} className="font-display mt-10 text-4xl font-light leading-tight tracking-tight">
        {signup ? 'Ta routine, rien que pour toi.' : 'Content de te revoir.'}
      </motion.h1>
      <motion.p {...rise(0.14)} className="mt-2 text-sm leading-relaxed text-white/45">
        {signup
          ? 'Crée ton compte : tes séances, tes réglages et ta série te suivent sur tous tes appareils.'
          : 'Connecte-toi pour retrouver tes séances.'}
      </motion.p>

      <motion.form {...rise(0.2)} onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {signup && (
            <motion.div
              key="name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Field label="Prénom" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="Ton prénom" />
            </motion.div>
          )}
        </AnimatePresence>
        <Field
          label="Email"
          type="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="toi@exemple.fr"
        />
        <Field
          label="Mot de passe"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={signup ? 'new-password' : 'current-password'}
          placeholder={`${MIN_PASSWORD} caractères minimum`}
        />

        {error && (
          <p role="alert" className="text-sm leading-relaxed" style={{ color: t.a }}>
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={busy}
          whileTap={{ scale: 0.97 }}
          className="mt-2 w-full rounded-full py-4 text-base font-bold text-ink disabled:opacity-60"
          style={{ background: gradient(t, 90) }}
        >
          {busy ? '…' : signup ? 'Créer mon compte' : 'Me connecter'}
        </motion.button>
      </motion.form>

      <motion.div {...rise(0.28)} className="mt-6 flex flex-col items-center gap-4 pb-6 text-sm">
        <button
          onClick={() => {
            setMode(signup ? 'signin' : 'signup')
            setError(null)
          }}
          className="text-white/70 underline-offset-4 hover:underline"
        >
          {signup ? 'J’ai déjà un compte' : 'Créer un compte'}
        </button>
        <button onClick={onGuest} className="text-white/35 underline-offset-4 hover:underline">
          Continuer sans compte
        </button>
      </motion.div>
    </div>
  )
}
