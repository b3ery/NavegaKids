#!/usr/bin/env python3
"""
NavegaKids — ferramentas/gerar_audios.py

Grava com uma voz neural (API de voz) cada frase de audios/frases.json em
audios/<chave>.mp3 e atualiza audios/manifest.json. O jogo toca essas gravações
no botão "Ouvir"; o que não tiver gravação sai na voz do navegador.

Escolha a API com --api:

  edge    (padrão, grátis, sem chave) vozes neurais do Microsoft Edge pelo pacote
          edge-tts. Voz padrão: pt-BR-ThalitaMultilingualNeural (jovem).
            pip install edge-tts
            python ferramentas/gerar_audios.py

  google  Google Cloud Text-to-Speech (oficial, com cota gratuita mensal). Precisa
          de uma chave de API com a "Cloud Text-to-Speech API" ativada:
            set GOOGLE_TTS_KEY=sua-chave        (Windows)
            export GOOGLE_TTS_KEY=sua-chave     (Mac/Linux)
            python ferramentas/gerar_audios.py --api google

  azure   Azure AI Speech (oficial, com cota gratuita mensal). Precisa de chave e região:
            export AZURE_SPEECH_KEY=sua-chave AZURE_SPEECH_REGION=brazilsouth
            python ferramentas/gerar_audios.py --api azure

A chave NUNCA vai para o site: ela só é usada aqui, no seu computador, para gerar
os arquivos .mp3, que depois são publicados junto com o jogo.

Opções úteis:
  --voz NOME        troca a voz (ex.: pt-BR-FranciscaNeural, pt-BR-Neural2-C)
  --refazer         grava de novo todas as frases (ex.: depois de trocar a voz)
  --limite N        grava só N frases (para testar antes)

Antes, se os textos do jogo mudaram:  node ferramentas/extrair_frases.mjs
"""
import argparse
import asyncio
import base64
import json
import os
import sys
import time
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "audios"
FRASES = PASTA / "frases.json"
MANIFESTO = PASTA / "manifest.json"

VOZ_PADRAO = {
    "edge": "pt-BR-ThalitaMultilingualNeural",
    "google": "pt-BR-Neural2-C",
    "azure": "pt-BR-ThalitaMultilingualNeural",
}
RESERVA_EDGE = ["pt-BR-ThalitaNeural", "pt-BR-FranciscaNeural"]


# ---------------------------------------------------------------- APIs
async def gravar_edge(texto, voz, destino):
    import edge_tts  # pip install edge-tts
    ultimo_erro = None
    for v in [voz] + [r for r in RESERVA_EDGE if r != voz]:
        try:
            # um pouco mais devagar e um tom levemente mais alto: soa mais acolhedor para criança
            await edge_tts.Communicate(texto, v, rate="-6%", pitch="+6Hz").save(str(destino))
            return v
        except Exception as e:  # voz indisponível: tenta a próxima
            ultimo_erro = e
    raise ultimo_erro


def gravar_google(texto, voz, destino):
    chave = os.environ.get("GOOGLE_TTS_KEY")
    if not chave:
        sys.exit("Defina a variável GOOGLE_TTS_KEY com a sua chave da API do Google Cloud Text-to-Speech.")
    corpo = {
        "input": {"text": texto},
        "voice": {"languageCode": "pt-BR", "name": voz},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": 0.95, "pitch": 1.0},
    }
    req = urllib.request.Request(
        f"https://texttospeech.googleapis.com/v1/text:synthesize?key={chave}",
        data=json.dumps(corpo).encode(), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        destino.write_bytes(base64.b64decode(json.load(r)["audioContent"]))
    return voz


def gravar_azure(texto, voz, destino):
    chave, regiao = os.environ.get("AZURE_SPEECH_KEY"), os.environ.get("AZURE_SPEECH_REGION")
    if not chave or not regiao:
        sys.exit("Defina AZURE_SPEECH_KEY e AZURE_SPEECH_REGION (ex.: brazilsouth).")
    ssml = (f"<speak version='1.0' xml:lang='pt-BR'><voice name='{voz}'>"
            f"<prosody rate='-6%' pitch='+4%'>{escape(texto)}</prosody></voice></speak>")
    req = urllib.request.Request(
        f"https://{regiao}.tts.speech.microsoft.com/cognitiveservices/v1", data=ssml.encode(), method="POST",
        headers={"Ocp-Apim-Subscription-Key": chave, "Content-Type": "application/ssml+xml",
                 "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "NavegaKids"})
    with urllib.request.urlopen(req, timeout=60) as r:
        destino.write_bytes(r.read())
    return voz


# ---------------------------------------------------------------- principal
def main():
    ap = argparse.ArgumentParser(description="Grava os áudios do botão Ouvir com uma voz neural.")
    ap.add_argument("--api", choices=["edge", "google", "azure"], default="edge")
    ap.add_argument("--voz")
    ap.add_argument("--refazer", action="store_true")
    ap.add_argument("--limite", type=int)
    a = ap.parse_args()
    voz = a.voz or VOZ_PADRAO[a.api]

    if not FRASES.exists():
        sys.exit("Não achei audios/frases.json. Rode antes: node ferramentas/extrair_frases.mjs")
    frases = json.loads(FRASES.read_text(encoding="utf-8"))
    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8")) if MANIFESTO.exists() else {}
    if manifesto.get("voz") and manifesto.get("voz") != voz and not a.refazer:
        print(f"Aviso: os áudios existentes usam a voz {manifesto['voz']}. Use --refazer para regravar tudo com {voz}.")

    pendentes = [(k, t) for k, t in frases.items() if a.refazer or not (PASTA / f"{k}.mp3").exists()]
    if a.limite:
        pendentes = pendentes[:a.limite]
    print(f"API {a.api} · voz {voz} · {len(pendentes)} frase(s) para gravar de {len(frases)}")

    voz_usada = voz
    for i, (chave, texto) in enumerate(pendentes, 1):
        destino = PASTA / f"{chave}.mp3"
        for tentativa in range(3):
            try:
                if a.api == "edge":
                    voz_usada = asyncio.run(gravar_edge(texto, voz, destino))
                elif a.api == "google":
                    voz_usada = gravar_google(texto, voz, destino)
                else:
                    voz_usada = gravar_azure(texto, voz, destino)
                break
            except SystemExit:
                raise
            except Exception as e:
                if tentativa == 2:
                    print(f"  ERRO em {chave} ({texto[:40]}…): {e}")
                else:
                    time.sleep(2 * (tentativa + 1))
        if i % 25 == 0 or i == len(pendentes):
            print(f"  {i}/{len(pendentes)}")

    # o manifesto lista só as frases que têm arquivo (as que ainda existem no jogo)
    gravadas = sorted(k for k in frases if (PASTA / f"{k}.mp3").exists())
    MANIFESTO.write_text(json.dumps({"voz": voz_usada, "api": a.api, "arquivos": gravadas}, ensure_ascii=False, indent=1) + "\n",
                         encoding="utf-8")
    print(f"Pronto: {len(gravadas)} áudios em audios/ e audios/manifest.json atualizado.")
    print("Publique a pasta audios/ junto com o jogo (git add audios && git commit && git push).")


if __name__ == "__main__":
    main()
