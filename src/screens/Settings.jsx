import { useState } from 'react'
import { motion } from 'framer-motion'
import { EQUIPMENT, EXERCISES, GROUPS } from '../data/exercises.js'
import { ROUTINES, enabledPool, hasEquipment, profilePool, routineInfo } from '../lib/routine.js'
import { DURATIONS, MAX_FAVORITES, MIN_ENABLED, getSettings, saveSettings } from '../lib/settings.js'
import { TONES, gradient, rise } from '../lib/theme.js'
import { LEVEL_LABELS } from '../lib/progress.js'
import VoicePicker from '../components/VoicePicker.jsx'
import { deleteAccount, exportMyData } from '../lib/cloud.js'

const TITLES = { souplesse: 'Souplesse', renfo: 'Renfo' }

function Toggle({ on, disabled, onChange, color }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40"
      style={{ background: on ? color : 'rgba(255,255,255,0.12)' }}
    >
      <motion.span
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
        animate={{ left: on ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

function RoutineSettings({ routineKey, settings, update, delay }) {
  const s = settings[routineKey]
  const t = TONES[routineKey]
  const info = routineInfo(routineKey, settings)
  const all = profilePool(routineKey) // les exercices écartés par le profil n'apparaissent pas
  const enabledCount = enabledPool(routineKey, settings).length
  const groups = Object.keys(ROUTINES[routineKey].plan)
  for (const e of all) if (!groups.includes(e.group)) groups.push(e.group)

  const set = (patch) => update({ ...settings, [routineKey]: { ...s, ...patch } })
  const toggle = (id) => {
    const off = s.disabled.includes(id)
    if (!off && enabledCount <= MIN_ENABLED) return
    set({
      disabled: off ? s.disabled.filter((d) => d !== id) : [...s.disabled, id],
      favorites: off ? s.favorites : s.favorites.filter((f) => f !== id),
    })
  }
  const star = (id) => {
    const fav = s.favorites.includes(id)
    if (!fav && s.favorites.length >= MAX_FAVORITES) return
    set({ favorites: fav ? s.favorites.filter((f) => f !== id) : [...s.favorites, id], disabled: s.disabled.filter((d) => d !== id) })
  }

  return (
    <motion.section {...rise(delay)} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-3xl font-medium">{TITLES[routineKey]}</h2>
        <span className="text-sm font-semibold" style={{ color: t.a }}>
          ≈ {info.minutes} min · {info.count} mouvements
        </span>
      </div>

      <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Durée visée</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DURATIONS[routineKey].map((m) => (
          <button
            key={m}
            onClick={() => set({ minutes: m })}
            className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={
              s.minutes === m
                ? { background: gradient(t, 90), color: '#121212' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }
            }
          >
            {m} min
          </button>
        ))}
      </div>

      {routineKey === 'renfo' && (
        <>
          <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Niveau</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['auto', 1, 2, 3].map((lv) => {
              const active = (s.level ?? 'auto') === lv
              return (
                <button
                  key={lv}
                  onClick={() => set({ level: lv })}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                  style={
                    active
                      ? { background: gradient(t, 90), color: '#121212' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }
                  }
                >
                  {lv === 'auto' ? 'Auto' : LEVEL_LABELS[lv]}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Auto : séries et répétitions augmentent avec ta régularité.
          </p>
        </>
      )}

      <p className="mt-2 text-xs leading-relaxed text-white/40">
        {routineKey === 'souplesse'
          ? 'Plus la séance est longue, plus il y a d’exercices, et les étirements clés de ton profil sont tenus plus longtemps, jusqu’à 2 min par côté.'
          : 'Plus la séance est longue, plus il y a d’exercices dans le circuit, puis chaque effort s’allonge de quelques secondes.'}
      </p>

      <p className="mt-6 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Exercices</p>
      <p className="mt-1 text-xs text-white/40">★ = inclus à chaque séance ({s.favorites.length}/{MAX_FAVORITES}), le reste change à chaque fois. Au moins {MIN_ENABLED} exercices actifs.</p>

      {groups.map((g) => (
        <div key={g} className="mt-4">
          <p className="text-xs font-semibold" style={{ color: t.a }}>
            {GROUPS[g]?.label ?? g}
          </p>
          <ul className="mt-1 divide-y divide-white/[0.06]">
            {all
              .filter((e) => e.group === g)
              .map((e) => {
                const equipped = hasEquipment(e, settings)
                const on = equipped && !s.disabled.includes(e.id)
                const fav = s.favorites.includes(e.id)
                const full = !fav && s.favorites.length >= MAX_FAVORITES
                return (
                  <li key={e.id} className="flex items-center gap-3 py-2.5">
                    <button
                      onClick={() => star(e.id)}
                      aria-label={fav ? 'Retirer des incontournables' : 'Inclure à chaque séance'}
                      className="text-xl leading-none transition-transform active:scale-90"
                      disabled={full}
                      style={{ color: fav ? t.a : full ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)' }}
                    >
                      ★
                    </button>
                    <span className="flex-1">
                      <span className={`text-sm ${on ? 'text-white/85' : 'text-white/30 line-through'}`}>{e.name}</span>
                      {e.equip && (
                        <span className={`block text-[0.7rem] ${equipped ? 'text-white/35' : 'text-white/25'}`}>
                          {equipped ? '' : 'Sans '}
                          {e.equip.map((k) => EQUIPMENT[k].label).join(' + ')}
                        </span>
                      )}
                    </span>
                    <Toggle
                      on={on}
                      disabled={!equipped || (on && enabledCount <= MIN_ENABLED)}
                      onChange={() => toggle(e.id)}
                      color={t.b}
                    />
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </motion.section>
  )
}

// Matériel disponible : décocher un objet retire de toutes les routines les exercices qui en ont besoin
function EquipmentSettings({ settings, update, delay }) {
  const missing = settings.missing ?? []
  const count = (k) => EXERCISES.filter((e) => e.equip?.includes(k)).length
  const toggle = (k) => {
    const next = { ...settings, missing: missing.includes(k) ? missing.filter((m) => m !== k) : [...missing, k] }
    // Chaque routine garde au moins MIN_ENABLED exercices faisables
    if (['souplesse', 'renfo'].some((r) => enabledPool(r, next).length < MIN_ENABLED)) return
    update(next)
  }

  return (
    <motion.section {...rise(delay)} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <h2 className="font-display text-3xl font-medium">Mon matériel</h2>
      <p className="mt-1 text-xs leading-relaxed text-white/40">
        Décoche ce que tu n’as pas : les exercices qui en ont besoin sortent des deux routines.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(EQUIPMENT).map(([k, { label }]) => {
          const have = !missing.includes(k)
          return (
            <button
              key={k}
              onClick={() => toggle(k)}
              aria-pressed={have}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                have ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-white/35 line-through'
              }`}
            >
              {have ? '✓ ' : ''}
              {label} <span className="font-normal text-white/40">· {count(k)}</span>
            </button>
          )
        })}
      </div>
    </motion.section>
  )
}

// Compte : qui est connecté, fiche perso ou routine générale, déconnexion
function AccountSettings({ account, onLogout, onLogin, onDeleted, onPrivacy, delay }) {
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
              : 'Routine générale. Ta fiche personnalisée apparaîtra ici quand elle sera validée.'}
            {account.offline && ' (hors ligne : dernières données de ce téléphone)'}
          </p>
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

export default function Settings({ account, onLogout, onLogin, onDeleted, onPrivacy, onBack }) {
  const [settings, setSettings] = useState(getSettings)
  const update = (next) => {
    setSettings(next)
    saveSettings(next)
  }

  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 [--sb:3rem] [--st:1rem]">
      <motion.button {...rise(0)} onClick={onBack} className="rounded-full border border-white/15 px-4 py-2 text-sm">
        ← Retour
      </motion.button>
      <motion.h1 {...rise(0.05)} className="font-display mt-5 text-4xl font-light tracking-tight">
        Réglages
      </motion.h1>
      <motion.p {...rise(0.1)} className="mt-1 text-sm text-white/45">
        {account ? 'Enregistrés automatiquement sur ton compte.' : 'Enregistrés automatiquement sur ce téléphone.'}
      </motion.p>
      <div className="mt-6 flex flex-col gap-5">
        <EquipmentSettings settings={settings} update={update} delay={0.15} />
        <RoutineSettings routineKey="souplesse" settings={settings} update={update} delay={0.2} />
        <RoutineSettings routineKey="renfo" settings={settings} update={update} delay={0.25} />
        <motion.div {...rise(0.29)}>
          <VoicePicker />
        </motion.div>
        <AccountSettings
          account={account}
          onLogout={onLogout}
          onLogin={onLogin}
          onDeleted={onDeleted}
          onPrivacy={onPrivacy}
          delay={0.33}
        />
      </div>
    </div>
  )
}
