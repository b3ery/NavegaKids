/* ============================================================
   NavegaKids — musica.js
   Música de fundo animada, composta aqui mesmo e tocada pelo
   navegador (Web Audio) — não precisa de arquivo de áudio.
   Uma "jiga de pirata" em Dó maior, compasso 6/8, em loop.
   Os navegadores só deixam tocar som depois de um toque/clique,
   então ela começa na primeira interação (se estiver ligada).
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});

  const CHAVE = 'navegakids-musica';
  const VOLUME = 0.11;
  const COLCHEIA = 0.19;          // duração de uma colcheia (s) → ~105 bpm de semínima pontuada
  const ADIANTE = 0.35;           // agenda as notas com essa antecedência (s)

  /* melodia: [nota MIDI ou null (pausa), duração em colcheias] — 8 compassos de 6 colcheias */
  const MELODIA = [
    [76, 1], [74, 1], [72, 1], [67, 2], [67, 1],
    [72, 1], [76, 1], [79, 1], [76, 3],
    [77, 1], [76, 1], [74, 1], [69, 2], [69, 1],
    [71, 1], [74, 1], [77, 1], [74, 3],
    [76, 1], [79, 1], [76, 1], [72, 2], [76, 1],
    [77, 1], [81, 1], [77, 1], [74, 2], [71, 1],
    [72, 1], [76, 1], [74, 1], [71, 1], [67, 1], [71, 1],
    [72, 3], [null, 3]
  ];
  /* harmonia por compasso: [baixo no 1º tempo, baixo no 2º tempo, acorde] */
  const C = [60, 64, 67], F = [65, 69, 72], G = [62, 67, 71];
  const HARMONIA = [
    [36, 43, C], [36, 43, C], [41, 48, F], [43, 50, G],
    [36, 43, C], [41, 48, F], [43, 50, G], [36, 43, C]
  ];
  const TOTAL = 48;               // colcheias no loop

  const freq = m => 440 * Math.pow(2, (m - 69) / 12);

  let ctx = null, mestre = null, ruido = null, timer = null;
  let tocando = false, proxTempo = 0, passo = 0;
  let ligada = true;
  try { ligada = localStorage.getItem(CHAVE) !== 'off'; } catch (e) {}

  function prepara() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    mestre = ctx.createGain();
    mestre.gain.value = 0;
    mestre.connect(ctx.destination);
    // ruído branco curtinho para a percussão
    ruido = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function nota(m, t, dur, tipo, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = freq(m);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(mestre);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function batida(t, vol) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = ruido; f.type = 'highpass'; f.frequency.value = 5000;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.06);
    s.connect(f); f.connect(g); g.connect(mestre);
    s.start(t); s.stop(t + 0.08);
  }

  /* posição de cada nota da melodia (em colcheias) — calculada uma vez */
  const INICIO_MELODIA = [];
  MELODIA.reduce((pos, [, dur]) => { INICIO_MELODIA.push(pos); return pos + dur; }, 0);

  function agendaColcheia(i, t) {
    const compasso = Math.floor(i / 6), dentro = i % 6;
    const [b1, b2, acorde] = HARMONIA[compasso];
    // melodia
    const k = INICIO_MELODIA.indexOf(i);
    if (k >= 0 && MELODIA[k][0] !== null) nota(MELODIA[k][0], t, MELODIA[k][1] * COLCHEIA * 0.95, 'square', 0.16);
    // baixo nos dois tempos do 6/8
    if (dentro === 0) nota(b1, t, COLCHEIA * 2.6, 'triangle', 0.5);
    if (dentro === 3) nota(b2, t, COLCHEIA * 2.6, 'triangle', 0.42);
    // "pa-pa" do acorde nas colcheias fracas
    if (dentro === 1 || dentro === 2 || dentro === 4 || dentro === 5) acorde.forEach(m => nota(m, t, COLCHEIA * 0.7, 'triangle', 0.07));
    // percussão
    batida(t, dentro === 0 || dentro === 3 ? 0.22 : 0.08);
  }

  function agendador() {
    while (proxTempo < ctx.currentTime + ADIANTE) {
      agendaColcheia(passo, proxTempo);
      proxTempo += COLCHEIA;
      passo = (passo + 1) % TOTAL;
    }
  }

  function tocar() {
    if (tocando || !ligada || document.hidden || videoTocando()) return;
    if (!prepara()) return;
    ctx.resume();
    tocando = true;
    proxTempo = ctx.currentTime + 0.1;
    mestre.gain.cancelScheduledValues(ctx.currentTime);
    mestre.gain.setValueAtTime(mestre.gain.value, ctx.currentTime);
    mestre.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + 1.2);   // entra suave
    timer = setInterval(agendador, 90);
    agendador();
  }

  function parar() {
    if (!tocando) return;
    tocando = false;
    clearInterval(timer);
    mestre.gain.cancelScheduledValues(ctx.currentTime);
    mestre.gain.setValueAtTime(mestre.gain.value, ctx.currentTime);
    mestre.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  }

  const videoTocando = () => Array.from(document.querySelectorAll('video')).some(v => !v.paused && !v.ended);

  function atualizaBotao() {
    const b = document.getElementById('musicaBtn');
    if (!b) return;
    b.classList.toggle('off', !ligada);
    b.setAttribute('aria-pressed', String(ligada));
    b.setAttribute('aria-label', ligada ? 'Desligar música' : 'Ligar música');
    b.title = ligada ? 'Desligar música' : 'Ligar música';
  }

  function alternar() {
    // ligada mas ainda sem som (nenhum toque antes): o 1º clique no botão só começa a tocar
    if (ligada && !tocando && !document.hidden && !videoTocando()) { tocar(); atualizaBotao(); return; }
    ligada = !ligada;
    try { localStorage.setItem(CHAVE, ligada ? 'on' : 'off'); } catch (e) {}
    ligada ? tocar() : parar();
    atualizaBotao();
  }

  /* botão do cabeçalho (nota musical em SVG; riscada quando desligada) */
  const botaoHtml = () => `<button class="musica-btn ${ligada ? '' : 'off'}" id="musicaBtn" aria-pressed="${ligada}"
      aria-label="${ligada ? 'Desligar música' : 'Ligar música'}" title="${ligada ? 'Desligar música' : 'Ligar música'}">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="17" cy="16" r="3" fill="currentColor"/>
        <path class="risco" d="M3 3l18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      </svg></button>`;

  // começa na primeira interação (exigência dos navegadores para tocar som)
  const primeiraVez = e => {
    if (e.target.closest && e.target.closest('#musicaBtn')) return;   // o próprio botão já cuida
    tocar();
  };
  document.addEventListener('pointerdown', primeiraVez, { once: true });
  document.addEventListener('keydown', primeiraVez, { once: true });

  // pausa quando a aba some e enquanto um vídeo da fase toca
  // ao trocar de tela (um vídeo tocando pode ter sido removido), retoma a música
  window.addEventListener('hashchange', () => setTimeout(tocar, 300));
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : tocar()));
  document.addEventListener('play', e => { if (e.target.tagName === 'VIDEO') parar(); }, true);
  ['pause', 'ended'].forEach(ev => document.addEventListener(ev, e => {
    if (e.target.tagName === 'VIDEO') setTimeout(tocar, 300);
  }, true));

  NK.musica = { alternar, tocar, parar, botaoHtml, atualizaBotao, ligada: () => ligada };

  /* ============================================================
     EFEITOS SONOROS: acerto, erro e vitória.
     Saem por um volume próprio, então tocam mesmo com a música desligada.
     ============================================================ */
  let efeitos = null;
  function saidaEfeitos() {
    if (!prepara()) return null;
    ctx.resume();
    if (!efeitos) { efeitos = ctx.createGain(); efeitos.gain.value = 0.32; efeitos.connect(ctx.destination); }
    return efeitos;
  }

  /* um "bip" com envelope e, opcionalmente, deslize de altura */
  function tom(saida, { de, ate = de, t = 0, dur = 0.15, tipo = 'sine', vol = 1 }) {
    const t0 = ctx.currentTime + t;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(de, t0);
    if (ate !== de) o.frequency.exponentialRampToValueAtTime(ate, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(saida);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  /** "Plim!" — duas notas subindo, brilhantes. */
  function acerto() {
    const s = saidaEfeitos(); if (!s) return;
    tom(s, { de: freq(84), t: 0, dur: 0.12, tipo: 'triangle', vol: 0.7 });          // Dó
    tom(s, { de: freq(91), t: 0.09, dur: 0.28, tipo: 'triangle', vol: 0.7 });       // Sol
    tom(s, { de: freq(103), t: 0.09, dur: 0.22, tipo: 'sine', vol: 0.18 });         // brilho
  }

  /** "Buóm" — som grave descendo, curto e sem susto. */
  function erro() {
    const s = saidaEfeitos(); if (!s) return;
    tom(s, { de: 260, ate: 150, t: 0, dur: 0.18, tipo: 'square', vol: 0.22 });
    tom(s, { de: 200, ate: 105, t: 0.16, dur: 0.3, tipo: 'square', vol: 0.22 });
  }

  /** Fanfarra ao concluir a atividade (maior quando fecha a fase). */
  function vitoria(grande) {
    const s = saidaEfeitos(); if (!s) return;
    const notas = grande ? [72, 76, 79, 84, 79, 84] : [72, 76, 79, 84];
    const passo = grande ? 0.11 : 0.09;
    notas.forEach((m, i) => {
      const ultima = i === notas.length - 1;
      tom(s, { de: freq(m), t: i * passo, dur: ultima ? 0.5 : 0.14, tipo: 'triangle', vol: 0.6 });
      tom(s, { de: freq(m + 12), t: i * passo, dur: ultima ? 0.4 : 0.1, tipo: 'sine', vol: 0.12 });
    });
  }

  NK.som = { acerto, erro, vitoria };
})();
