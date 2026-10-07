import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Ambient from './components/Ambient.jsx'
import Hub from './screens/Hub.jsx'
import Player from './screens/Player.jsx'
import Reward from './screens/Reward.jsx'
import Lab from './screens/Lab.jsx'
import Settings from './screens/Settings.jsx'
import { buildRoutine } from './lib/routine.js'
import { completeSession, getStreaks } from './lib/streaks.js'
import { unlockAudio } from './lib/audio.js'
import { TONES, gradient } from './lib/theme.js'

const MIN_RATIO = 0.7

export default function App() {
  const [screen, setScreen] = useState(() => (window.location.hash === '#lab' ? 'lab' : 'hub'))
  const [routine, setRoutine] = useState(null)
  const [result, setResult] = useState(null) // { valid, ratio, streak }
  const [bloom, setBloom] = useState(null) // { key, x, y } : la bulle qui envahit l'écran au lancement

  const launch = (key, origin) => {
    unlockAudio()
    setRoutine(buildRoutine(key))
    setBloom({ key, ...origin })
  }

  // Séance validée seulement si au moins 70 % du temps d'effort a vraiment été fait
  // (évite de garder la série en appuyant sur "passer" jusqu'à la fin).
  const finish = ({ workedMs, plannedMs }) => {
    const ratio = plannedMs ? workedMs / plannedMs : 0
    const valid = ratio >= MIN_RATIO
    const streak = valid ? completeSession(routine.key) : getStreaks()[routine.key].count
    setResult({ valid, ratio, streak })
    setScreen('reward')
  }

  const radius = Math.hypot(window.innerWidth, window.innerHeight)

  return (
    <MotionConfig reducedMotion="user">
      <div className={`mx-auto h-full overflow-hidden ${screen === 'lab' ? 'max-w-6xl' : 'max-w-md'}`}>
        <Ambient tone={screen === 'hub' ? 'rest' : routine?.key ?? 'rest'} intensity={screen === 'hub' ? 0.22 : 0.3} />

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {screen === 'hub' && <Hub onLaunch={launch} onOpenLab={() => setScreen('lab')} onOpenSettings={() => setScreen('settings')} />}
            {screen === 'settings' && <Settings onBack={() => setScreen('hub')} />}
            {screen === 'lab' && (
              <Lab
                onBack={() => {
                  history.replaceState(null, '', window.location.pathname)
                  setScreen('hub')
                }}
              />
            )}
            {screen === 'player' && <Player routine={routine} onFinish={finish} onQuit={() => setScreen('hub')} />}
            {screen === 'reward' && <Reward routine={routine} result={result} minRatio={MIN_RATIO} onDone={() => setScreen('hub')} />}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {bloom && (
            <motion.div
              key="bloom"
              className="pointer-events-none fixed z-50 rounded-full"
              style={{
                left: bloom.x - radius,
                top: bloom.y - radius,
                width: radius * 2,
                height: radius * 2,
                background: gradient(TONES[bloom.key]),
                willChange: 'transform, opacity',
              }}
              initial={{ scale: 0.02, opacity: 1 }}
              animate={{ scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.7 } }}
              transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
              onAnimationComplete={() => {
                setScreen('player')
                setBloom(null)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
