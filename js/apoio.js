/* ============================================================
   NavegaKids — apoio.js
   Recursos de apoio pedidos no relato de testes:
   - dicas recolhidas no modo Marujo (menos texto na tela);
   - "Ouvir": leitura em voz alta dos textos (voz do navegador, pt-BR);
   - incentivo: sequência de acertos comemorada, erro como parte do aprendizado.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { progresso, $$, esc, I, comIcone, toast } = NK;

  /* ---------- dicas ---------- */
  /** Dica da atividade: aberta no modo Capitão; recolhida atrás de "Ver dica" no Marujo. */
  function dicaHtml(dica) {
    if (!dica) return '';
    if (!progresso.modoInfo().dicaRecolhida) return `<p class="dica-flutua">${comIcone('luneta', dica)}</p>`;
    return `<details class="dica-recolhida"><summary>${I('luneta', { cls: 'ico-txt' })} Ver dica</summary>
      <p class="dica-flutua">${esc(dica)}</p></details>`;
  }

  /* ---------- ouvir (leitura em voz alta) ---------- */
  const temVoz = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const ICONE_SOM = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>`;

  /**
   * Botão "Ouvir". `alvo` é um seletor CSS (o texto é lido do elemento na hora do clique)
   * ou, com `{ texto }`, um texto fixo.
   */
  function botaoOuvir(alvo, { texto, rotulo = 'Ouvir', cls = '' } = {}) {
    if (!temVoz) return '';
    const dado = texto ? `data-ouvir-txt="${esc(texto)}"` : `data-ouvir="${esc(alvo)}"`;
    return `<button type="button" class="bt-ouvir ${cls}" ${dado} aria-label="Ouvir o texto em voz alta">${ICONE_SOM}<span>${esc(rotulo)}</span></button>`;
  }

  /** Texto visível do elemento + as dicas recolhidas (que o innerText não inclui). */
  /* partes que só atrapalham na leitura: o nome do contato em cada balão (já foi lido no
     topo do chat), "online", os botões do rodapé (Avançar, Voltar…) e o próprio "Ouvir" */
  const NAO_LER = '.bolha .msg small, .chat-head small, .rodape, .bt-ouvir, .dica-recolhida summary';

  function textoDe(el) {
    if (!el) return '';
    // esconde por um instante (sem repintar a tela) só para o innerText ignorar
    const escondidos = $$(NAO_LER, el).map(x => [x, x.style.display]);
    escondidos.forEach(([x]) => { x.style.display = 'none'; });
    const partes = [el.innerText];
    escondidos.forEach(([x, d]) => { x.style.display = d; });
    $$('.dica-recolhida:not([open]) .dica-flutua', el).forEach(d => partes.push('Dica: ' + d.textContent));
    return partes.join('. ')
      .replace(/_/g, ' ')                               // "Capitão_Lesma2120" → "Capitão Lesma2120"
      .replace(/\s*\n+\s*/g, '. ')
      .replace(/(\d+)\/(\d+)/g, '$1 de $2')          // "0/3" → "0 de 3"
      .replace(/([!?])\./g, '$1')
      .replace(/(\.\s*){2,}/g, '. ')
      .trim();
  }

  /* ---------- escolha da voz ----------
     O navegador não tem voz de criança. Forçar o tom muito agudo (pitch alto) deixa a voz
     robótica e distorcida, então o tom sobe só um pouco e o que faz diferença é escolher a
     MELHOR voz do aparelho, sem mexer no tom: as "Natural/Online" do Edge (Thalita, Francisca…), as do Google
     no Chrome e as "Aprimoradas/Premium" da Apple soam bem mais humanas. A criança (ou o
     professor) também pode escolher a voz no Diário; a escolha fica salva neste aparelho. */
  const CHAVE_VOZ = 'navegakids-voz';
  // tom 1 = voz original: qualquer mudança de tom é feita por processamento e deixa a voz
  // mais robótica; um ritmo um pouco mais lento soa mais natural (e ajuda quem lê devagar)
  const TOM = { natural: 1, comum: 1 };
  const RITMO = { capitao: 0.95, marujo: 0.88 };
  const VOZES_JOVENS = /thalita|francisca|vit[oó]ria|luciana|leila|brenda|elza|manuela|yara|giovanna|leticia|let[ií]cia|camila|fernanda|maria|helo[ií]sa|raquel/i;
  const VOZES_MASCULINAS = /daniel|ant[oô]nio|felipe|donato|fabio|f[aá]bio|humberto|julio|j[uú]lio|nicolau|valerio|val[eé]rio|male\b|masculin/i;

  const vozesPt = () => temVoz ? window.speechSynthesis.getVoices().filter(v => /^pt/i.test(v.lang)) : [];
  const ehNatural = v => /natural|online|neural|premium|enhanced|aprimorad|wavenet/i.test(v.name) || /^google/i.test(v.name);

  /** Nota de qualidade: português do Brasil, voz natural/da nuvem, feminina/jovem; evita eSpeak e "compact". */
  function notaVoz(v) {
    let n = 0;
    if (/BR/i.test(v.lang)) n += 40;
    if (ehNatural(v)) n += 30;
    if (!v.localService) n += 10;
    if (/thalita/i.test(v.name)) n += 25;              // voz jovem do Edge
    if (VOZES_JOVENS.test(v.name)) n += 15;
    if (VOZES_MASCULINAS.test(v.name)) n -= 30;
    if (/espeak|compact|mbrola/i.test(v.name)) n -= 60;
    return n;
  }

  function vozSalva() { try { return localStorage.getItem(CHAVE_VOZ) || ''; } catch (e) { return ''; } }
  function salvarVoz(nome) { try { nome ? localStorage.setItem(CHAVE_VOZ, nome) : localStorage.removeItem(CHAVE_VOZ); } catch (e) {} }

  function escolherVoz() {
    const pt = vozesPt();
    const salva = vozSalva();
    return pt.find(v => v.name === salva) || pt.slice().sort((x, y) => notaVoz(y) - notaVoz(x))[0] || null;
  }
  /** Vozes em português, da melhor para a pior (para o seletor do Diário). */
  const listaVozes = () => vozesPt().sort((x, y) => notaVoz(y) - notaVoz(x));
  /** O aparelho tem alguma voz natural/neural em português? (senão, sugerimos o Edge) */
  const temVozNatural = () => vozesPt().some(ehNatural);

  if (temVoz) {
    window.speechSynthesis.getVoices();   // alguns navegadores só carregam a lista depois do 1º pedido
    window.speechSynthesis.addEventListener?.('voiceschanged', () => document.dispatchEvent(new Event('nk-vozes')));
  }

  let botaoFalando = null;
  let avisouRobotica = false;
  function marcar(bt) {
    $$('.bt-ouvir.on').forEach(b => { b.classList.remove('on'); b.querySelector('span').textContent = b.dataset.rotulo || 'Ouvir'; });
    botaoFalando = bt;
    if (bt) { bt.dataset.rotulo ??= bt.querySelector('span').textContent; bt.classList.add('on'); bt.querySelector('span').textContent = 'Parar'; }
  }

  function parar() {
    if (temVoz) window.speechSynthesis.cancel();
    marcar(null);
  }

  /* O Chrome corta falas longas (~15 s) nas vozes do Google: lê frase por frase. */
  function emFrases(texto) {
    const frases = texto.match(/[^.!?…]+[.!?…]*\s*/g) || [texto];
    const blocos = [];
    frases.forEach(f => {
      const ult = blocos[blocos.length - 1];
      if (ult && (ult + f).length < 180) blocos[blocos.length - 1] = ult + f; else blocos.push(f);
    });
    return blocos.map(b => b.trim()).filter(Boolean);
  }

  function falar(texto, bt, { voz: vozForcada } = {}) {
    if (!temVoz || !texto) return;
    const synth = window.speechSynthesis;
    const mesmo = bt && bt === botaoFalando;
    parar();
    if (mesmo) return;   // segundo toque no mesmo botão: só para
    const voz = vozForcada || escolherVoz();
    if (!vozForcada && !avisouRobotica && vozesPt().length && !vozesPt().some(ehNatural)) {
      avisouRobotica = true;
      toast('Dica: no Microsoft Edge ou no Chrome a voz fica bem mais natural.');
    }
    const blocos = emFrases(texto);
    marcar(bt);
    blocos.forEach((bloco, i) => {
      const u = new SpeechSynthesisUtterance(bloco);
      u.lang = voz?.lang || 'pt-BR';
      if (voz) u.voice = voz;
      u.pitch = voz && ehNatural(voz) ? TOM.natural : TOM.comum;
      u.rate = RITMO[progresso.modo()] || 1;
      if (i === blocos.length - 1) u.onend = () => { if (botaoFalando === bt) marcar(null); };
      u.onerror = () => { if (botaoFalando === bt) marcar(null); };
      synth.speak(u);
    });
  }

  if (temVoz) {
    document.addEventListener('click', e => {
      const bt = e.target.closest('.bt-ouvir');
      if (!bt) return;
      e.preventDefault(); e.stopPropagation();
      const texto = bt.dataset.ouvirTxt ?? textoDe(document.querySelector(bt.dataset.ouvir));
      falar(texto, bt);
    });
    window.addEventListener('hashchange', parar);   // trocou de tela: para de falar
  }

  /* ---------- incentivo ---------- */
  let seguidos = 0;
  const COMEMORA = {
    3: 'Três acertos seguidos! Você está pegando o jeito!',
    5: 'Cinco seguidos! Navegador de olho vivo!',
    8: 'Oito seguidos! Ninguém engana você!',
    12: 'Doze seguidos! Você é uma lenda dos mares!'
  };
  const feedback = {
    acerto() {
      NK.som?.acerto();
      seguidos++;
      const msg = COMEMORA[seguidos] || (seguidos > 12 && seguidos % 5 === 0 ? `${seguidos} acertos seguidos! Que sequência!` : '');
      if (msg) toast(msg);
    },
    erro() {
      NK.som?.erro();
      seguidos = 0;
    }
  };

  Object.assign(NK, { dicaHtml, botaoOuvir, pararVoz: parar, feedback, voz: { temVoz, listaVozes, temVozNatural, ehNatural, escolherVoz, vozSalva, salvarVoz, falar } });
})();
