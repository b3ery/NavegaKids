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
  /**
   * Botão único de voz: "Voz: ligada / desligada". Ligado, lê a tela na hora e segue lendo
   * sozinho as próximas telas, popups e feedbacks; desligado, fica em silêncio.
   * `alvo` é o seletor do que ler nesta tela (ou `{ texto }`, um texto fixo).
   */
  function botaoOuvir(alvo, { texto, cls = '' } = {}) {
    if (!temVoz && typeof Audio === 'undefined') return '';
    const on = progresso.vozAuto();
    const dado = texto ? `data-ouvir-txt="${esc(texto)}"` : `data-ouvir="${esc(alvo)}"`;
    return `<button type="button" class="bt-ouvir bt-ouvir-principal ${on ? 'ligada' : ''} ${cls}" ${dado} aria-pressed="${on}"
      aria-label="Voz que lê os textos">${ICONE_SOM}<span>Voz: <b>${on ? 'ligada' : 'desligada'}</b></span></button>`;
  }

  /* ---------- texto → frases → chave do áudio ----------
     Funções puras, usadas aqui e em ferramentas/extrair_frases.mjs: o mesmo texto gera a
     mesma chave nos dois lados, e é por ela que se acha o áudio gravado (audios/<chave>.mp3). */

  /** Ajustes para a fala: "_" vira espaço, "0/3" vira "0 de 3", pontuação repetida some. */
  function prepararFala(texto) {
    return String(texto)
      .replace(/_/g, ' ')
      .replace(/\s*\n+\s*/g, '. ')
      .replace(/(\d+)\/(\d+)/g, '$1 de $2')
      .replace(/([!?])\./g, '$1')
      .replace(/(\.\s*){2,}/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  /** Divide em frases (cada frase tem o seu áudio). */
  const frasesDe = texto => (prepararFala(texto).match(/[^.!?…]+[.!?…]*/g) || []).map(f => f.trim()).filter(f => /[\p{L}\p{N}]/u.test(f));
  /** Chave da frase: minúsculas, sem pontuação nas pontas, espaços únicos → hash FNV-1a (8 dígitos hex). */
  function chaveFrase(frase) {
    const n = frase.toLowerCase().replace(/[“”"«»]/g, '').replace(/^[\s.,;:!?…-]+|[\s.,;:!?…-]+$/g, '').replace(/\s+/g, ' ');
    let h = 0x811c9dc5;
    for (const ch of n) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }

  /* partes que só atrapalham na leitura: o nome do contato em cada balão (já foi lido no
     topo do chat), "online", os botões do rodapé (Avançar, Voltar…), contadores e o "Ouvir" */
  const NAO_LER = '.bolha .msg small, .chat-head small, .rodape, .bt-ouvir, .dica-recolhida summary, .prog-hunt, .quiz-top, .popup .btns, .popup .x';

  /** Texto visível do elemento + as dicas recolhidas (que o innerText não inclui). */
  function textoDe(el) {
    if (!el) return '';
    // esconde por um instante (sem repintar a tela) só para o innerText ignorar
    const escondidos = $$(NAO_LER, el).map(x => [x, x.style.display]);
    escondidos.forEach(([x]) => { x.style.display = 'none'; });
    const partes = [el.innerText];
    escondidos.forEach(([x, d]) => { x.style.display = d; });
    $$('.dica-recolhida:not([open]) .dica-flutua', el).forEach(d => partes.push('Dica.', d.textContent));
    return prepararFala(partes.join('\n'));
  }

  /* ---------- áudios gravados (voz neural) ----------
     ferramentas/gerar_audios.mjs grava cada frase do jogo com uma voz neural (API de voz) em
     audios/<chave>.mp3 e lista as gravadas em audios/manifest.json. Se o pacote existir, o
     "Ouvir" toca as gravações; o que não tiver gravação (nome da criança, por exemplo) sai
     na voz do navegador. Sem pacote, tudo sai na voz do navegador, como antes. */
  let gravadas = null;   // Set de chaves gravadas, ou null
  let vozGravada = '';
  fetch('audios/manifest.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : null))
    .then(m => { if (m && Array.isArray(m.arquivos) && m.arquivos.length) { gravadas = new Set(m.arquivos); vozGravada = m.voz || ''; } })
    .catch(() => {});

  /* ---------- voz do navegador (reserva) ----------
     Forçar o tom agudo deixa a voz robótica; o que faz diferença é escolher a MELHOR voz do
     aparelho, sem mexer no tom: as "Natural/Online" do Edge (Thalita, Francisca…), as do
     Google no Chrome e as "Aprimoradas/Premium" da Apple. Também dá para escolher no Diário. */
  const CHAVE_VOZ = 'navegakids-voz';
  const RITMO = { capitao: 0.95, marujo: 0.88 };
  const VOZES_JOVENS = /thalita|francisca|vit[oó]ria|luciana|leila|brenda|elza|manuela|yara|giovanna|let[ií]cia|camila|fernanda|maria|helo[ií]sa|raquel/i;
  const VOZES_MASCULINAS = /daniel|ant[oô]nio|felipe|donato|f[aá]bio|humberto|j[uú]lio|nicolau|val[eé]rio|male\b|masculin/i;

  const vozesPt = () => temVoz ? window.speechSynthesis.getVoices().filter(v => /^pt/i.test(v.lang)) : [];
  const ehNatural = v => /natural|online|neural|premium|enhanced|aprimorad|wavenet/i.test(v.name) || /^google/i.test(v.name);

  /** Nota de qualidade: português do Brasil, voz natural/da nuvem, feminina/jovem; evita eSpeak e "compact". */
  function notaVoz(v) {
    let n = 0;
    if (/BR/i.test(v.lang)) n += 40;
    if (ehNatural(v)) n += 30;
    if (!v.localService) n += 10;
    if (/thalita/i.test(v.name)) n += 25;
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
  const listaVozes = () => vozesPt().sort((x, y) => notaVoz(y) - notaVoz(x));
  const temVozNatural = () => vozesPt().some(ehNatural);

  if (temVoz) {
    window.speechSynthesis.getVoices();   // alguns navegadores só carregam a lista depois do 1º pedido
    window.speechSynthesis.addEventListener?.('voiceschanged', () => document.dispatchEvent(new Event('nk-vozes')));
  }

  /* ---------- tocar ---------- */
  let botaoFalando = null;
  let avisouRobotica = false;
  let sessao = 0;          // muda a cada "parar": callbacks de falas antigas são ignorados
  let audioAtual = null;

  function marcar(bt) {
    botaoFalando = bt;
    $$('.bt-ouvir-principal').forEach(b => b.classList.toggle('falando', !!bt));   // ícone pulsa enquanto fala
  }

  function parar() {
    sessao++;
    if (temVoz) window.speechSynthesis.cancel();
    if (audioAtual) { audioAtual.pause(); audioAtual = null; }
    marcar(null);
  }

  /** Fala um trecho na voz do navegador (em blocos curtos: o Chrome corta falas longas). */
  function sintetizar(texto, voz, depois) {
    if (!temVoz) { depois(); return; }
    const blocos = [];
    (texto.match(/[^.!?…]+[.!?…]*\s*/g) || [texto]).forEach(f => {
      const ult = blocos[blocos.length - 1];
      if (ult && (ult + f).length < 180) blocos[blocos.length - 1] = ult + f; else blocos.push(f);
    });
    const lista = blocos.map(b => b.trim()).filter(Boolean);
    if (!lista.length) { depois(); return; }
    lista.forEach((bloco, i) => {
      const u = new SpeechSynthesisUtterance(bloco);
      u.lang = voz?.lang || 'pt-BR';
      if (voz) u.voice = voz;
      u.pitch = 1;   // tom original: mudar o tom deixa a voz mais robótica
      u.rate = RITMO[progresso.modo()] || 1;
      if (i === lista.length - 1) { u.onend = depois; u.onerror = depois; }
      window.speechSynthesis.speak(u);
    });
  }

  function falar(texto, bt, { voz: vozForcada } = {}) {
    if (!texto) return;
    parar();
    const minha = sessao;
    const voz = vozForcada || escolherVoz();

    // fila: frases gravadas viram áudio; frases seguidas sem gravação são faladas juntas
    const fila = [];
    frasesDe(texto).forEach(f => {
      const chave = chaveFrase(f);
      if (!vozForcada && gravadas?.has(chave)) fila.push({ audio: `audios/${chave}.mp3`, texto: f });
      else if (fila.length && !fila[fila.length - 1].audio) fila[fila.length - 1].texto += ' ' + f;
      else fila.push({ texto: f });
    });
    if (!fila.length) return;

    const usaSintese = fila.some(it => !it.audio);
    if (usaSintese && !vozForcada && !avisouRobotica && !gravadas && vozesPt().length && !temVozNatural()) {
      avisouRobotica = true;
      toast('Dica: no Microsoft Edge ou no Chrome a voz fica bem mais natural.');
    }
    if (usaSintese && !temVoz && !gravadas) return;

    marcar(bt);
    let i = 0;
    const proximo = () => {
      if (minha !== sessao) return;
      if (i >= fila.length) { if (botaoFalando === bt) marcar(null); return; }
      const it = fila[i++];
      if (!it.audio) { sintetizar(it.texto, voz, proximo); return; }
      const a = new Audio(it.audio);
      audioAtual = a;
      a.playbackRate = progresso.modo() === 'marujo' ? 0.92 : 1;
      a.onended = proximo;
      a.onerror = () => { if (minha === sessao) sintetizar(it.texto, voz, proximo); };   // sem o arquivo: voz do navegador
      a.play().catch(a.onerror);
    };
    proximo();
  }

  /* Leitura automática (progresso.vozAuto): no Marujo (8 anos) vem ligada; no Capitão
     (9 e 10 anos) vem desligada e a criança escolhe no botão "Voz". */
  const vozLigada = () => progresso.vozAuto();
  const textoDoBotao = bt => bt.dataset.ouvirTxt ?? textoDe(document.querySelector(bt.dataset.ouvir));

  function atualizarBotoes() {
    const on = vozLigada();
    $$('.bt-ouvir-principal').forEach(b => {
      b.classList.toggle('ligada', on); b.setAttribute('aria-pressed', on);
      const t = b.querySelector('b'); if (t) t.textContent = on ? 'ligada' : 'desligada';
    });
  }

  document.addEventListener('click', e => {
    const bt = e.target.closest('.bt-ouvir-principal');
    if (!bt) return;
    e.preventDefault(); e.stopPropagation();
    progresso.definirVozAuto(!vozLigada());
    atualizarBotoes();
    if (vozLigada()) {
      const pop = document.querySelector('.popup-wrap .popup');
      falar(pop ? textoDe(pop) : textoDoBotao(bt), bt);
    } else parar();
  });

  /* Com a voz ligada, lê sozinho: a tela nova (atividade, abertura, Missões), os popups e
     os feedbacks (certo / repensar), que são criados em vários lugares do jogo; um
     observador percebe quando eles aparecem. */
  const FEEDBACK = '.quiz-fb, .dica-flutua.boa, .dica-flutua.ruim';

  function lerPopup(wrap) {
    const caixa = wrap.querySelector('.popup');
    if (!caixa || caixa.dataset.lido) return;
    caixa.dataset.lido = '1';
    if (vozLigada()) setTimeout(() => { if (document.body.contains(caixa)) falar(textoDe(caixa), null); }, 350);
  }

  function lerFeedback(fb) {
    if (fb.closest('.popup') || getComputedStyle(fb).display === 'none') return;
    const texto = prepararFala(fb.innerText);
    if (!texto || fb.dataset.lido === texto) return;
    fb.dataset.lido = texto;
    if (vozLigada()) falar(texto, null);
  }

  if (typeof MutationObserver !== 'undefined') {
    let pendente = false;
    const varrer = () => {
      pendente = false;
      $$('.bt-ouvir-principal:not([data-auto])').forEach(bt => {
        bt.dataset.auto = '1';
        if (vozLigada() && !document.querySelector('.popup-wrap'))
          setTimeout(() => { if (document.body.contains(bt) && !botaoFalando) falar(textoDoBotao(bt), bt); }, 400);
      });
      $$('.popup-wrap').forEach(lerPopup);
      $$(FEEDBACK).forEach(lerFeedback);
    };
    new MutationObserver(() => { if (!pendente) { pendente = true; requestAnimationFrame(varrer); } })
      .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style'] });
  }
  window.addEventListener('hashchange', parar);   // trocou de tela: para de falar

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

  Object.assign(NK, { dicaHtml, botaoOuvir, pararVoz: parar, feedback, voz: { temVoz, listaVozes, temVozNatural, ehNatural, escolherVoz, vozSalva, salvarVoz, falar, prepararFala, frasesDe, chaveFrase, temGravacao: () => !!gravadas, vozGravada: () => vozGravada } });
})();
