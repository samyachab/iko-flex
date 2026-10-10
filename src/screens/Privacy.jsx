import { motion } from 'framer-motion'
import { rise } from '../lib/theme.js'

// Page de confidentialité : ce qu'on garde, pourquoi, où, qui le voit, et tes droits.
// À tenir à jour si l'appli collecte une nouvelle donnée.
const UPDATED = '10 octobre 2026'

const SECTIONS = [
  {
    title: 'Qui',
    body: [
      'Iko Flex est un projet personnel de Samy, qui en est responsable. Il n’y a ni publicité, ni revente de données, ni pistage.',
    ],
  },
  {
    title: 'Ce qui est enregistré',
    body: [
      'Avec un compte : ton email, ton prénom et ton mot de passe (chiffré, jamais lisible, même par Samy).',
      'Tes réglages : durées, favoris, exercices désactivés, matériel.',
      'Ton historique : les jours de séance et les exercices faits.',
      'Si tu choisis une routine personnalisée : ta fiche (sport, posture, zones sensibles ou douleurs). Ce sont des données de santé : elles ne sont utilisées que pour construire tes séances, et seulement avec ton accord.',
      'Sans compte : rien ne quitte ton téléphone.',
    ],
  },
  {
    title: 'Pourquoi',
    body: ['Uniquement pour te proposer des séances adaptées et garder ta progression d’un appareil à l’autre.'],
  },
  {
    title: 'Où',
    body: [
      'Dans une base de données sécurisée (Supabase), hébergée dans l’Union européenne. Chaque compte n’a accès qu’à ses propres données.',
      'L’appli est servie par Vercel, qui ne stocke pas tes données d’entraînement.',
      'Sur ton téléphone, l’appli garde une copie pour fonctionner hors ligne. Elle est effacée quand tu te déconnectes.',
    ],
  },
  {
    title: 'Qui les voit',
    body: ['Toi, et Samy en tant que coach, pour valider et ajuster ta fiche. Personne d’autre.'],
  },
  {
    title: 'Combien de temps',
    body: ['Tant que ton compte existe. Quand tu le supprimes, tout est effacé immédiatement et définitivement.'],
  },
  {
    title: 'Tes droits',
    body: [
      'Dans Réglages > Mon compte : « Exporter mes données » te donne un fichier avec tout ce qui est enregistré, et « Supprimer mon compte » efface tout.',
      'Pour corriger ta fiche ou poser une question, contacte Samy directement.',
      'Tu peux aussi adresser une réclamation à la CNIL (cnil.fr).',
    ],
  },
]

export default function Privacy({ onBack }) {
  return (
    <div className="safe-top safe-bottom h-full overflow-y-auto px-6 [--sb:3rem] [--st:1rem]">
      <motion.button {...rise(0)} onClick={onBack} className="rounded-full border border-white/15 px-4 py-2 text-sm">
        ← Retour
      </motion.button>
      <motion.h1 {...rise(0.05)} className="font-display mt-5 text-4xl font-light tracking-tight">
        Confidentialité
      </motion.h1>
      <motion.p {...rise(0.1)} className="mt-1 text-sm text-white/45">
        En clair, ce que l’appli garde sur toi. Mis à jour le {UPDATED}.
      </motion.p>
      <div className="mt-6 flex flex-col gap-4">
        {SECTIONS.map((s, i) => (
          <motion.section
            key={s.title}
            {...rise(0.14 + i * 0.04)}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
          >
            <h2 className="font-display text-2xl font-medium">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-2 text-sm leading-relaxed text-white/65">
                {p}
              </p>
            ))}
          </motion.section>
        ))}
      </div>
    </div>
  )
}
