"""Génère la voix pré-enregistrée (Vivienne, Microsoft neural) pour chaque phrase de séance.

Usage (depuis la racine du projet) :
    node scripts/voice-phrases.mjs > scripts/.voice-phrases.json
    python scripts/generate_voice.py

- Ne régénère que les phrases manquantes (public/voice/<id>.mp3).
- Supprime les fichiers des phrases qui n'existent plus.
- Écrit src/data/voice-manifest.json (liste des ids disponibles) lu par l'app.
Requiert : pip install edge-tts
"""
import asyncio
import json
import pathlib

import edge_tts

VOICE = 'fr-FR-VivienneMultilingualNeural'
RATE = '-5%'
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'voice'
MANIFEST = ROOT / 'src' / 'data' / 'voice-manifest.json'


async def main():
    phrases = json.loads((ROOT / 'scripts' / '.voice-phrases.json').read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    wanted = {p['id'] for p in phrases}
    for f in OUT.glob('*.mp3'):
        if f.stem not in wanted:
            f.unlink()
    todo = [p for p in phrases if not (OUT / f"{p['id']}.mp3").exists()]
    for n, p in enumerate(todo, 1):
        await edge_tts.Communicate(p['text'], VOICE, rate=RATE).save(str(OUT / f"{p['id']}.mp3"))
        print(f"[{n}/{len(todo)}] {p['text'][:70]}")
    ids = sorted(p['id'] for p in phrases if (OUT / f"{p['id']}.mp3").exists())
    MANIFEST.write_text(json.dumps(ids), encoding='utf-8')
    print(f'{len(ids)} phrases disponibles, {len(todo)} générées.')


asyncio.run(main())
