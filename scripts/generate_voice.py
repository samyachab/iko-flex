"""Génère les voix pré-enregistrées (Microsoft neural) pour chaque phrase de séance.

Usage (depuis la racine du projet) :
    node scripts/voice-phrases.mjs > scripts/.voice-phrases.json
    python scripts/generate_voice.py              # toutes les voix
    python scripts/generate_voice.py vivienne     # une seule voix

- Ne régénère que les phrases manquantes (public/voice/<voix>/<id>.mp3) ; --all pour tout régénérer.
- Supprime les fichiers des phrases qui n'existent plus.
- Écrit src/data/voice-manifest.json ({ voix: [ids disponibles] }) lu par l'app.

Service utilisé :
- Azure AI Speech (officiel, mêmes voix) si une clé est configurée : variables d'environnement
  AZURE_SPEECH_KEY et AZURE_SPEECH_REGION, ou fichier .env.local à la racine (hors git, jamais commité) :
      AZURE_SPEECH_KEY=...
      AZURE_SPEECH_REGION=westeurope
- sinon edge-tts (service gratuit non officiel, parfois coupé par Microsoft) : pip install edge-tts
"""
import asyncio
import json
import os
import pathlib
import sys
from xml.sax.saxutils import escape

# Voix proposées dans l'app (clé = dossier public/voice/<clé>, doit correspondre à src/lib/audio.js)
VOICES = {
    'vivienne': 'fr-FR-VivienneMultilingualNeural',
    'remy': 'fr-FR-RemyMultilingualNeural',
    'denise': 'fr-FR-DeniseNeural',
    'henri': 'fr-FR-HenriNeural',
}
RATE = '-5%'
FORMAT = 'audio-24khz-48kbitrate-mono-mp3'  # même format que les clips déjà générés
ROOT = pathlib.Path(__file__).resolve().parent.parent
VOICE_DIR = ROOT / 'public' / 'voice'
MANIFEST = ROOT / 'src' / 'data' / 'voice-manifest.json'


def load_env_local():
    """Lit .env.local (KEY=valeur) sans écraser les variables déjà définies."""
    env = ROOT / '.env.local'
    if not env.exists():
        return
    for line in env.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env_local()
AZURE_KEY = os.environ.get('AZURE_SPEECH_KEY')
AZURE_REGION = os.environ.get('AZURE_SPEECH_REGION', 'westeurope')


def ssml(voice, text):
    # xml:lang fr-FR obligatoire : sinon les voix multilingues lisent les mots courts ("Respire") à l'anglaise
    return (
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='fr-FR'>"
        f"<voice name='{voice}'><prosody rate='{RATE}'>{escape(text)}</prosody></voice></speak>"
    )


def make_azure():
    import aiohttp  # installé avec edge-tts ; sinon : pip install aiohttp

    url = f'https://{AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1'
    headers = {
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'iko-flex-voice',
    }
    session = None

    async def synth(voice, text, path):
        nonlocal session
        session = session or aiohttp.ClientSession()
        async with session.post(url, data=ssml(voice, text).encode('utf-8'), headers=headers) as r:
            if r.status == 429:  # quota par seconde du forfait gratuit : on patiente et on relance
                raise RuntimeError('429')
            if r.status != 200:
                raise RuntimeError(f'{r.status} {(await r.text())[:120]}')
            path.write_bytes(await r.read())

    async def close():
        if session:
            await session.close()

    return synth, close


def make_edge():
    import edge_tts
    import edge_tts.communicate as communicate

    _mkssml = communicate.mkssml

    def _mkssml_fr(tc, escaped_text):
        if isinstance(escaped_text, bytes):
            escaped_text = escaped_text.decode('utf-8')
        return _mkssml(tc, escaped_text).replace("xml:lang='en-US'", "xml:lang='fr-FR'")

    communicate.mkssml = _mkssml_fr

    async def synth(voice, text, path):
        await edge_tts.Communicate(text, voice, rate=RATE).save(str(path))

    async def close():
        pass

    return synth, close


async def generate(key, phrases, synth):
    out = VOICE_DIR / key
    out.mkdir(parents=True, exist_ok=True)
    if '--all' in sys.argv:
        for f in out.glob('*.mp3'):
            f.unlink()
    wanted = {p['id'] for p in phrases}
    for f in out.glob('*.mp3'):
        if f.stem not in wanted:
            f.unlink()
    # Un fichier vide ou interrompu (coupure du service) compte comme manquant
    for f in list(out.glob('*.mp3')) + list(out.glob('*.part')):
        if f.suffix == '.part' or f.stat().st_size == 0:
            f.unlink()
    todo = [p for p in phrases if not (out / f"{p['id']}.mp3").exists()]
    sem = asyncio.Semaphore(4)  # quelques requêtes en parallèle, sous le quota du forfait gratuit
    failed = []

    async def one(p):
        async with sem:
            tmp = out / f"{p['id']}.part"
            for attempt in range(5):  # coupure ou quota : délai croissant puis relance
                try:
                    await asyncio.wait_for(synth(VOICES[key], p['text'], tmp), 30)
                    if tmp.stat().st_size == 0:
                        raise RuntimeError('fichier vide')
                    tmp.replace(out / f"{p['id']}.mp3")  # écrit d'un coup : pas de fichier tronqué
                    return
                except Exception as e:
                    last = e
                    await asyncio.sleep(2 * (attempt + 1))
            tmp.unlink(missing_ok=True)
            failed.append(p)
            print(f"[{key}] échec ({last}) : {p['text'][:60]}")

    await asyncio.gather(*(one(p) for p in todo))
    print(f'{key} : {len(todo) - len(failed)} phrases générées, {len(failed)} échecs.')


async def main():
    phrases = json.loads((ROOT / 'scripts' / '.voice-phrases.json').read_text(encoding='utf-8'))
    keys = [a for a in sys.argv[1:] if a in VOICES] or list(VOICES)
    synth, close = make_azure() if AZURE_KEY else make_edge()
    print('Service :', f'Azure AI Speech ({AZURE_REGION})' if AZURE_KEY else 'edge-tts (non officiel)')
    try:
        for key in keys:
            await generate(key, phrases, synth)
    finally:
        await close()
    manifest = {
        key: sorted(p['id'] for p in phrases if (VOICE_DIR / key / f"{p['id']}.mp3").exists()) for key in VOICES
    }
    MANIFEST.write_text(json.dumps(manifest), encoding='utf-8')
    print({k: len(v) for k, v in manifest.items()})


asyncio.run(main())
