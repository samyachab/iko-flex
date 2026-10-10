import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Blob from '../components/Blob.jsx'
import AccountCard from '../components/AccountCard.jsx'
import { getLeaderboard, getPlayer, savePlayer } from '../lib/cloud.js'
import { getStreaks } from '../lib/streaks.js'
import { AVATARS, TONES, gradient, rise } from '../lib/theme.js'

const card = 'rounded-[2rem] border border-white/10 bg-white/[0.04] p-5'
const label = 'text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40'
const MAX_NAME = 24

// Avatar : un blob de la couleur choisie, avec l'initiale
export function Avatar({ name, avatar = 'aurore', size = 44 }) {
  return (
    <Blob palette={AVATARS[avatar] ?? AVATARS.aurore} size={size} speed={0.8}>
      <span className="font-display font-semibold text-ink" style={{ fontSize: size * 0.42 }}>
        {(name ?? '?').trim().charAt(0).toUpperCase() || '?'}
      </span>
    </Blob>
  )
}

// Classement entre amis : série en cours (jours d'affilée) ou jours actifs cette semaine
function Leaderboard({ player, onJoin, onLeave }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [by, setBy] = useState('streak') // 'streak' | 'week'

  useEffect(() => {
    if (!player?.share) return
    getLeaderboard().then((res) => (res.error ? setError(res.error) : setRows(res.rows)))
  }, [player?.share])

  if (!player?.share) {
    return (
      <motion.section {...rise(0.12)} className={card}>
        <p className={label}>Classement entre amis</p>
        <h2 className="font-display mt-2 text-2xl leading-snug">Qui tiendra la plus longue série ?</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Tes amis verront ton pseudo, ton avatar et ta série. Rien d’autre : ni ta fiche, ni tes exercices.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onJoin}
          className="mt-4 w-full rounded-full py-3.5 text-base font-bold text-ink"
          style={{ background: gradient(TONES.souplesse, 90) }}
        >
          Rejoindre le classement
        </motion.button>
      </motion.section>
    )
  }

  const sorted = rows
    ? [...rows].sort((a, b) =>
        by === 'week' ? b.week_days - a.week_days || b.current_streak - a.current_streak : b.current_streak - a.current_streak || b.week_days - a.week_days,
      )
    : []

  return (
    <motion.section {...rise(0.12)} className={card}>
      <div className="flex items-center justify-between gap-3">
        <p className={label}>Classement entre amis</p>
        <div className="flex gap-1 rounded-full bg-white/[0.06] p-1 text-xs">
          {[
            ['streak', 'Série'],
            ['week', 'Semaine'],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setBy(k)}
              className={`rounded-full px-3 py-1 font-semibold ${by === k ? 'bg-white/15 text-white' : 'text-white/45'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-[#FFC29A]">{error}</p>}
      {!rows && !error && <p className="mt-3 text-sm text-white/40">Chargement…</p>}
      {rows?.length === 1 && (
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          Tu es seul pour l’instant : invite tes amis à créer leur compte et à rejoindre le classement.
        </p>
      )}

      <ol className="mt-4 flex flex-col gap-2">
        {sorted.map((r, i) => (
          <li
            key={`${r.display_name}-${i}`}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${r.is_me ? 'bg-white/[0.09]' : ''}`}
          >
            <span className={`w-6 text-center font-display text-lg ${i < 3 ? 'text-white' : 'text-white/40'}`}>{i + 1}</span>
            <Avatar name={r.display_name} avatar={r.avatar} size={34} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/85">
              {r.display_name}
              {r.is_me && <span className="ml-1 font-normal text-white/40">(toi)</span>}
            </span>
            <span className="text-right text-sm font-bold" style={{ color: by === 'week' ? TONES.renfo.a : TONES.souplesse.a }}>
              {by === 'week' ? `${r.week_days}/7` : `${r.current_streak} j`}
            </span>
          </li>
        ))}
      </ol>
      {by === 'streak' && rows?.length > 0 && <p className="mt-3 text-xs text-white/35">Jours d’affilée avec au moins une séance validée.</p>}
      {by === 'week' && rows?.length > 0 && <p className="mt-3 text-xs text-white/35">Jours actifs depuis lundi.</p>}

      <button onClick={onLeave} className="mt-4 text-xs text-white/35 underline underline-offset-4">
        Quitter le classement
      </button>
    </motion.section>
  )
}

// Personnaliser : pseudo et couleur d'avatar
function Customize({ player, fallbackName, onSave }) {
  const [name, setName] = useState(player?.display_name ?? fallbackName ?? '')
  const [avatar, setAvatar] = useState(player?.avatar ?? 'aurore')
  const changed = name.trim() !== (player?.display_name ?? '') || avatar !== (player?.avatar ?? 'aurore')
  return (
    <motion.section {...rise(0.18)} className={card}>
      <p className={label}>Personnaliser</p>
      <label className="mt-3 block">
        <span className="text-xs text-white/45">Pseudo</span>
        <input
          value={name}
          maxLength={MAX_NAME}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full select-text rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-base text-white outline-none focus:border-white/40"
        />
      </label>
      <p className="mt-4 text-xs text-white/45">Couleur</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {Object.entries(AVATARS).map(([k, a]) => (
          <button
            key={k}
            onClick={() => setAvatar(k)}
            aria-label={a.label}
            aria-pressed={avatar === k}
            className={`rounded-full p-1 ${avatar === k ? 'ring-2 ring-white/70' : ''}`}
          >
            <span className="block h-9 w-9 rounded-full" style={{ background: gradient(a) }} />
          </button>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={!changed || !name.trim()}
        onClick={() => onSave({ display_name: name.trim(), avatar })}
        className="mt-5 w-full rounded-full border border-white/15 py-3 text-sm font-semibold text-white/80 disabled:opacity-30"
      >
        Enregistrer
      </motion.button>
    </motion.section>
  )
}

export default function Profile({ account, onBack, onPlayerChange, ...accountProps }) {
  const [player, setPlayer] = useState(undefined) // undefined = chargement, null = jamais réglé
  const [message, setMessage] = useState(null)
  const streaks = getStreaks()
  const best = Math.max(streaks.souplesse.count, streaks.renfo.count)

  useEffect(() => {
    if (account) getPlayer().then((p) => setPlayer(p ?? null))
    else setPlayer(null)
  }, [account])

  const update = async (patch) => {
    const next = {
      display_name: player?.display_name ?? account?.name ?? 'Moi',
      avatar: player?.avatar ?? 'aurore',
      share: player?.share ?? false,
      ...patch,
    }
    const res = await savePlayer(next)
    if (res.error) return setMessage(res.error)
    setMessage(null)
    setPlayer(next)
    onPlayerChange?.(next)
  }

  const shown = player?.display_name ?? account?.name ?? 'Invité'

  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 [--sb:3rem] [--st:1rem]">
      <motion.button {...rise(0)} onClick={onBack} className="rounded-full border border-white/15 px-4 py-2 text-sm">
        ← Retour
      </motion.button>

      <motion.div {...rise(0.05)} className="mt-6 flex items-center gap-4">
        <Avatar name={shown} avatar={player?.avatar} size={72} />
        <div>
          <h1 className="font-display text-4xl font-light tracking-tight">{shown}</h1>
          <p className="mt-1 text-sm text-white/45">
            {best > 0 ? `Série en cours : ${best} jour${best > 1 ? 's' : ''}` : 'Ta série commence à ta prochaine séance'}
          </p>
        </div>
      </motion.div>

      <div className="mt-6 flex flex-col gap-5">
        {account ? (
          player !== undefined && (
            <>
              <Leaderboard player={player} onJoin={() => update({ share: true })} onLeave={() => update({ share: false })} />
              <Customize key={player?.updated_at ?? 'new'} player={player} fallbackName={account.name} onSave={update} />
            </>
          )
        ) : (
          <motion.section {...rise(0.12)} className={card}>
            <p className={label}>Classement entre amis</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">Crée un compte pour défier tes amis sur ta série.</p>
          </motion.section>
        )}
        {message && <p className="text-sm text-[#FFC29A]">{message}</p>}
        <AccountCard account={account} delay={0.24} {...accountProps} />
      </div>
    </div>
  )
}
