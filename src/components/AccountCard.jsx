import { useState } from 'react'
import { motion } from 'framer-motion'
import { deleteAccount, exportMyData } from '../lib/cloud.js'
import { TONES, gradient, rise } from '../lib/theme.js'

// Compte : qui est connecté, fiche perso ou routine générale, déconnexion
export default function AccountCard({ account, newSignups, onLogout, onLogin, onDeleted, onPrivacy, onCoach, onOnboarding, delay }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(null) // 'export' | 'delete'
  const [message, setMessage] = useState(null)

  const exportData = async () => {
    setBusy('export')
    setMessage(null)
    const res = await exportMyData()
    setBusy(null)
    if (res.error) setMessage(res.error)
  }
  const remove = async () => {
    setBusy('delete')
    const res = await deleteAccount()
    setBusy(null)
    if (res.error) return setMessage(res.error)
    onDeleted()
  }

  return (
    <motion.section {...rise(delay)} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <h2 className="font-display text-3xl font-medium">Mon compte</h2>
      {account ? (
        <>
          <p className="mt-2 text-sm text-white/70">{account.user.email}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/40">
            {account.personalized
              ? 'Fiche personnalisée active : tes séances suivent ton bilan.'
              : account.status === 'draft'
                ? 'Questionnaire envoyé : ton coach prépare ta fiche. En attendant, routine générale.'
                : 'Routine générale.'}
            {account.offline && ' (hors ligne : dernières données de ce téléphone)'}
          </p>
          {!account.coach && (
            <button onClick={onOnboarding} className="mt-3 block text-sm text-white/60 underline underline-offset-4">
              {account.status === 'general' ? 'Passer à une routine sur-mesure' : 'Refaire mon questionnaire'}
            </button>
          )}
          {account.coach && (
            <button
              onClick={onCoach}
              className="mt-4 w-full rounded-full py-3 text-sm font-bold text-ink"
              style={{ background: gradient(TONES.renfo, 90) }}
            >
              Espace coach{newSignups > 0 ? ` · ${newSignups} nouvel${newSignups > 1 ? 's' : ''} inscrit${newSignups > 1 ? 's' : ''}` : ''}
            </button>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onLogout} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
              Me déconnecter
            </button>
            <button
              onClick={exportData}
              disabled={busy === 'export'}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 disabled:opacity-50"
            >
              {busy === 'export' ? 'Export…' : 'Exporter mes données'}
            </button>
          </div>

          {!confirming ? (
            <button onClick={() => setConfirming(true)} className="mt-5 text-sm text-white/35 underline-offset-4 hover:underline">
              Supprimer mon compte
            </button>
          ) : (
            <div className="mt-5 rounded-2xl border border-[#FF7F7A]/40 p-4">
              <p className="text-sm leading-relaxed text-white/80">
                Ton compte, ta fiche, tes réglages et tout ton historique seront effacés définitivement. Impossible de revenir
                en arrière.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={remove}
                  disabled={busy === 'delete'}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
                  style={{ background: '#FF7F7A' }}
                >
                  {busy === 'delete' ? 'Suppression…' : 'Oui, tout supprimer'}
                </button>
                <button onClick={() => setConfirming(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
                  Annuler
                </button>
              </div>
            </div>
          )}
          {message && <p className="mt-3 text-sm text-[#FFC29A]">{message}</p>}
        </>
      ) : (
        <>
          <p className="mt-1 text-xs leading-relaxed text-white/40">
            Sans compte : routine générale, tout reste sur ce téléphone.
          </p>
          <button onClick={onLogin} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
            Créer un compte ou me connecter
          </button>
        </>
      )}
      <button onClick={onPrivacy} className="mt-5 block text-xs text-white/40 underline underline-offset-4">
        Confidentialité : ce que l’appli garde sur toi
      </button>
    </motion.section>
  )
}
