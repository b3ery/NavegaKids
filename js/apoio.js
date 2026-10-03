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
  function textoDe(el) {
    if (!el) return '';
    const partes = [el.innerText];
    $$('.dica-recolhida:not([open]) .dica-flutua', el).forEach(d => partes.push('Dica: ' + d.textContent));
    return partes.join('. ')
      .replace(/\b(Ouvir|Parar|Ver dica)\b/g, '')
      .replace(/\s*\n+\s*/g, '. ')
      .replace(/(\d+)\/(\d+)/g, '$1 de $2')          // "0/3" → "0 de 3"
      .replace(/([!?])\./g, '$1')
      .replace(/(\.\s*){2,}/g, '. ')
      .trim();
  }

  /* O navegador não tem voz de criança de verdade: a mais próxima é uma voz feminina em
     português com o tom lá em cima (pitch vai de 0 a 2; 1 é o normal). */
  const VOZ_INFANTIL = { tom: 1.75, ritmo: 1.05, ritmoMarujo: 0.92 };
  const VOZES_FEMININAS = /francisca|luciana|vit[oó]ria|thalita|maria|fernanda|camila|helo[ií]sa|raquel|leila|brenda|female|feminin|google portugu[eê]s do brasil/i;
  const VOZES_MASCULINAS = /daniel|ant[oô]nio|felipe|male\b|masculin/i;
  function escolherVoz() {
    const pt = window.speechSynthesis.getVoices().filter(v => /^pt/i.test(v.lang));
    const br = pt.filter(v => /BR/i.test(v.lang));
    const lista = br.length ? br : pt;
    return lista.find(v => VOZES_FEMININAS.test(v.name)) || lista.find(v => !VOZES_MASCULINAS.test(v.name)) || lista[0] || null;
  }
  if (temVoz) window.speechSynthesis.getVoices();   // alguns navegadores só carregam a lista depois do 1º pedido

  let botaoFalando = null;
  function marcar(bt) {
    $$('.bt-ouvir.on').forEach(b => { b.classList.remove('on'); b.querySelector('span').textContent = 'Ouvir'; });
    botaoFalando = bt;
    if (bt) { bt.classList.add('on'); bt.querySelector('span').textContent = 'Parar'; }
  }

  function parar() {
    if (temVoz) window.speechSynthesis.cancel();
    marcar(null);
  }

  function falar(texto, bt) {
    if (!temVoz || !texto) return;
    const synth = window.speechSynthesis;
    const mesmo = bt && bt === botaoFalando;
    parar();
    if (mesmo) return;   // segundo toque no mesmo botão: só para
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'pt-BR';
    // voz infantil: tom bem mais agudo e ritmo animado (um pouco mais calmo no Marujo)
    u.pitch = VOZ_INFANTIL.tom;
    u.rate = progresso.modo() === 'marujo' ? VOZ_INFANTIL.ritmoMarujo : VOZ_INFANTIL.ritmo;
    const voz = escolherVoz();
    if (voz) u.voice = voz;
    u.onend = u.onerror = () => { if (botaoFalando === bt) marcar(null); };
    marcar(bt);
    synth.speak(u);
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

  Object.assign(NK, { dicaHtml, botaoOuvir, pararVoz: parar, feedback });
})();
