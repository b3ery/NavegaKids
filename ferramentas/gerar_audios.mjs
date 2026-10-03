/* ============================================================
   NavegaKids — ferramentas/gerar_audios.mjs   (JavaScript / Node.js)

   Grava com uma voz neural (API de voz) cada frase de audios/frases.json em
   audios/<chave>.mp3 e atualiza audios/manifest.json. O jogo toca essas
   gravações no botão "Ouvir"; o que não tiver gravação sai na voz do navegador.

   Escolha a API com --api:

   edge    (padrão, grátis, sem chave) vozes neurais do Microsoft Edge pelo
           pacote msedge-tts. Voz padrão: pt-BR-ThalitaMultilingualNeural (jovem).
             npm install --no-save msedge-tts
             node ferramentas/gerar_audios.mjs

   google  Google Cloud Text-to-Speech (oficial, cota gratuita mensal). Chave de API
           com a "Cloud Text-to-Speech API" ativada:
             Windows (PowerShell):  $env:GOOGLE_TTS_KEY="sua-chave"
             Mac/Linux:             export GOOGLE_TTS_KEY=sua-chave
             node ferramentas/gerar_audios.mjs --api google

   azure   Azure AI Speech (oficial, cota gratuita mensal). Chave e região:
             AZURE_SPEECH_KEY=sua-chave  AZURE_SPEECH_REGION=brazilsouth
             node ferramentas/gerar_audios.mjs --api azure

   A chave NUNCA vai para o site: só é usada aqui, no seu computador, para gerar
   os .mp3, que depois são publicados junto com o jogo.

   Opções:  --voz NOME   (ex.: pt-BR-FranciscaNeural, pt-BR-Neural2-C)
            --refazer    grava de novo todas as frases (ex.: trocou a voz)
            --limite N   grava só N frases (para testar antes)

   Se os textos do jogo mudaram, antes rode:  node ferramentas/extrair_frases.mjs
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASTA = path.join(raiz, 'audios');
const FRASES = path.join(PASTA, 'frases.json');
const MANIFESTO = path.join(PASTA, 'manifest.json');

const VOZ_PADRAO = { edge: 'pt-BR-ThalitaMultilingualNeural', google: 'pt-BR-Neural2-C', azure: 'pt-BR-ThalitaMultilingualNeural' };
const RESERVA_EDGE = ['pt-BR-ThalitaNeural', 'pt-BR-FranciscaNeural'];

// ---------------------------------------------------------------- opções
const args = process.argv.slice(2);
const opcao = nome => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : undefined; };
const api = opcao('--api') || 'edge';
if (!VOZ_PADRAO[api]) sair(`API desconhecida: ${api} (use edge, google ou azure)`);
const voz = opcao('--voz') || VOZ_PADRAO[api];
const refazer = args.includes('--refazer');
const limite = Number(opcao('--limite')) || 0;

function sair(msg) { console.error(msg); process.exit(1); }
const escXml = t => t.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const esperar = ms => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------- APIs
let edge = null;   // conexão reaproveitada entre as frases
let vozEdge = null;
async function gravarEdge(texto, destino) {
  let mod;
  try { mod = await import('msedge-tts'); } catch { sair('Falta o pacote msedge-tts. Rode: npm install --no-save msedge-tts'); }
  const { MsEdgeTTS, OUTPUT_FORMAT } = mod;
  const candidatas = vozEdge ? [vozEdge] : [voz, ...RESERVA_EDGE.filter(v => v !== voz)];
  let ultimoErro;
  for (const v of candidatas) {
    try {
      if (!edge || vozEdge !== v) {
        edge?.close?.();
        edge = new MsEdgeTTS();
        await edge.setMetadata(v, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      }
      // um pouco mais devagar e tom levemente mais alto: soa mais acolhedor para criança
      const { audioStream } = await edge.toStream(escXml(texto), { rate: '-6%', pitch: '+6Hz' });
      const partes = [];
      await new Promise((ok, falha) => {
        audioStream.on('data', d => partes.push(d));
        audioStream.on('close', ok);
        audioStream.on('end', ok);
        audioStream.on('error', falha);
      });
      const audio = Buffer.concat(partes);
      if (!audio.length) throw new Error('áudio vazio');
      fs.writeFileSync(destino, audio);
      vozEdge = v;
      return v;
    } catch (e) { ultimoErro = e; edge = null; }
  }
  throw ultimoErro;
}

async function gravarGoogle(texto, destino) {
  const chave = process.env.GOOGLE_TTS_KEY;
  if (!chave) sair('Defina a variável GOOGLE_TTS_KEY com a sua chave da API do Google Cloud Text-to-Speech.');
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(chave)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: { text: texto }, voice: { languageCode: 'pt-BR', name: voz }, audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 } })
  });
  if (!r.ok) throw new Error(`Google respondeu ${r.status}: ${(await r.text()).slice(0, 200)}`);
  fs.writeFileSync(destino, Buffer.from((await r.json()).audioContent, 'base64'));
  return voz;
}

async function gravarAzure(texto, destino) {
  const chave = process.env.AZURE_SPEECH_KEY, regiao = process.env.AZURE_SPEECH_REGION;
  if (!chave || !regiao) sair('Defina AZURE_SPEECH_KEY e AZURE_SPEECH_REGION (ex.: brazilsouth).');
  const ssml = `<speak version='1.0' xml:lang='pt-BR'><voice name='${voz}'><prosody rate='-6%' pitch='+4%'>${escXml(texto)}</prosody></voice></speak>`;
  const r = await fetch(`https://${regiao}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST', body: ssml,
    headers: { 'Ocp-Apim-Subscription-Key': chave, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'NavegaKids' }
  });
  if (!r.ok) throw new Error(`Azure respondeu ${r.status}`);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  return voz;
}

const GRAVAR = { edge: gravarEdge, google: gravarGoogle, azure: gravarAzure };

// ---------------------------------------------------------------- principal
if (!fs.existsSync(FRASES)) sair('Não achei audios/frases.json. Rode antes: node ferramentas/extrair_frases.mjs');
const frases = JSON.parse(fs.readFileSync(FRASES, 'utf8'));
const manifesto = fs.existsSync(MANIFESTO) ? JSON.parse(fs.readFileSync(MANIFESTO, 'utf8')) : {};
if (manifesto.voz && manifesto.voz !== voz && !refazer)
  console.log(`Aviso: os áudios existentes usam a voz ${manifesto.voz}. Use --refazer para regravar tudo com ${voz}.`);

let pendentes = Object.entries(frases).filter(([k]) => refazer || !fs.existsSync(path.join(PASTA, `${k}.mp3`)));
if (limite) pendentes = pendentes.slice(0, limite);
console.log(`API ${api} · voz ${voz} · ${pendentes.length} frase(s) para gravar de ${Object.keys(frases).length}`);

let vozUsada = voz, erros = 0;
for (const [i, [chave, texto]] of pendentes.entries()) {
  const destino = path.join(PASTA, `${chave}.mp3`);
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try { vozUsada = await GRAVAR[api](texto, destino); break; }
    catch (e) {
      if (tentativa === 2) { erros++; console.log(`  ERRO em ${chave} (${texto.slice(0, 40)}…): ${e.message || e}`); }
      else await esperar(2000 * (tentativa + 1));
    }
  }
  if ((i + 1) % 25 === 0 || i + 1 === pendentes.length) console.log(`  ${i + 1}/${pendentes.length}`);
}
edge?.close?.();

// o manifesto lista só as frases que têm arquivo (e que ainda existem no jogo)
const gravadas = Object.keys(frases).filter(k => fs.existsSync(path.join(PASTA, `${k}.mp3`))).sort();
fs.writeFileSync(MANIFESTO, JSON.stringify({ voz: vozUsada, api, arquivos: gravadas }, null, 1) + '\n');
console.log(`Pronto: ${gravadas.length} áudios em audios/ e audios/manifest.json atualizado${erros ? ` (${erros} com erro: rode de novo para tentar)` : ''}.`);
console.log('Publique a pasta audios/ junto com o jogo (git add audios, commit e push).');
process.exit(0);
