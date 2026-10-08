"""Génère les voix pré-enregistrées (Microsoft neural) pour chaque phrase de séance.

Usage (depuis la racine du projet) :
    node scripts/voice-phrases.mjs > scripts/.voice-phrases.json
    python scripts/generate_voice.py              # toutes les voix
    python scripts/generate_voice.py vivienne     # une seule voix

- Ne régénère que les phrases manquantes (public/voice/<voix>/<id>.mp3) ; --all pour tout régénérer.
- Supprime les fichiers des phrases qui n'existent plus.
- Écrit src/data/voice-manifest.json ({ voix: [ids disponibles] }) lu par l'app.
Requiert : pip install edge-tts
"""
import asyncio
import json
import pathlib
import sys

import edge_tts
import edge_tts.communicate as communicate

# Vivienne est une voix multilingue : sans indication, edge-tts déclare la langue en-US et les mots
# courts ("Respire", "Récupère") sont prononcés à l'anglaise. On force le français dans le SSML.
_mkssml = communicate.mkssml


def _mkssml_fr(tc, escaped_text):
    if isinstance(escaped_text, bytes):
        escaped_text = escaped_text.decode('utf-8')
    ssml = _mkssml(tc, escaped_text)
    return ssml.replace("xml:lang='en-US'", "xml:lang='fr-FR'")


communicate.mkssml = _mkssml_fr

# Voix proposées dans l'app (clé = dossier public/voice/<clé>, doit correspondre à src/lib/audio.js)
VOICES = {
    'vivienne': 'fr-FR-VivienneMultilingualNeural',
    'remy': 'fr-FR-RemyMultilingualNeural',
    'denise': 'fr-FR-DeniseNeural',
    'henri': 'fr-FR-HenriNeural',
}
RATE = '-5%'
ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE_DIR = ROOT / 'public' / 'voice'
MANIFEST = ROOT / 'src' / 'data' / 'voice-manifest.json'


async def generate(key, phrases):
    out = VOICE_DIR / key
    out.mkdir(parents=True, exist_ok=True)
    if '--all' in sys.argv:
        for f in out.glob('*.mp3'):
            f.unlink()
    wanted = {p['id'] for p in phrases}
    for f in out.glob('*.mp3'):
        if f.stem not in wanted:
            f.unlink()
    # Un fichier vide (coupure du service) compte comme manquant
    for f in out.glob('*.mp3'):
        if f.stat().st_size == 0:
            f.unlink()
    todo = [p for p in phrases if not (out / f"{p['id']}.mp3").exists()]
    sem = asyncio.Semaphore(6)  # quelques requêtes en parallèle : bien plus rapide qu'une par une

    async def one(p):
        async with sem:
            tmp = out / f"{p['id']}.part"
            for attempt in range(4):  # le service coupe parfois une connexion : délai max + relance
                try:
                    await asyncio.wait_for(edge_tts.Communicate(p['text'], VOICES[key], rate=RATE).save(str(tmp)), 30)
                    tmp.replace(out / f"{p['id']}.mp3")  # écrit d'un coup : pas de fichier tronqué
                    return
                except Exception:
                    await asyncio.sleep(2 * (attempt + 1))
            print(f"[{key}] échec : {p['text'][:60]}")

    await asyncio.gather(*(one(p) for p in todo))
    print(f'{key} : {len(todo)} phrases générées.')


async def main():
    phrases = json.loads((ROOT / 'scripts' / '.voice-phrases.json').read_text(encoding='utf-8'))
    keys = [a for a in sys.argv[1:] if a in VOICES] or list(VOICES)
    for key in keys:
        await generate(key, phrases)
    manifest = {
        key: sorted(p['id'] for p in phrases if (VOICE_DIR / key / f"{p['id']}.mp3").exists()) for key in VOICES
    }
    MANIFEST.write_text(json.dumps(manifest), encoding='utf-8')
    print({k: len(v) for k, v in manifest.items()})


asyncio.run(main())
