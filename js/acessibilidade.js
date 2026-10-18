/* ============================================================
   NavegaKids — acessibilidade.js
   Painel de acessibilidade com a cara do jogo: botão redondo amarelo
   no canto e um cartão com as opções. Tudo feito aqui, sem script de
   fora. As escolhas ficam guardadas neste aparelho (localStorage);
   se o navegador não deixar guardar, o painel funciona do mesmo jeito.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { progresso, I, esc } = NK;
  const CHAVE = 'navegakids-acessibilidade';

  // texto: 0 normal, 1 grande, 2 maior · o resto liga/desliga
  const PADRAO = { texto: 0, contraste: false, leitura: false, parado: false, destaque: false, cursor: false, regua: false };
  let op = { ...PADRAO };
  try { Object.assign(op, JSON.parse(localStorage.getItem(CHAVE) || '{}')); } catch (e) {}
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(op)); } catch (e) {} };

  /* Ícones desenhados em linha (SVG), no traço do jogo */
  const svg = d => `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICONES = {
    acess: svg('<circle cx="12" cy="4.5" r="2"/><path d="M4 8.5c2.6.9 5.3 1.3 8 1.3s5.4-.4 8-1.3"/><path d="M12 9.8v4.4"/><path d="M8.5 21l3.5-6.8 3.5 6.8"/>'),
    contraste: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
    leitura: svg('<path d="M4 19V6"/><path d="M4 6h5"/><path d="M4 12h4"/><path d="M13 19l3.5-12L20 19"/><path d="M14.3 15h4.4"/>'),
    parado: svg('<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>'),
    destaque: svg('<rect x="3" y="7" width="18" height="10" rx="4"/><path d="M7 12h10"/><path d="M2 4l2 2M22 4l-2 2M2 20l2-2M22 20l-2-2"/>'),
    cursor: svg('<path d="M5 3l14 7-6 2-2 6z"/>'),
    regua: svg('<rect x="2" y="9" width="20" height="6" rx="2"/><path d="M6 9v3M10 9v3M14 9v3M18 9v3"/>'),
    voz: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/>'),
    refazer: svg('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>')
  };

  const OPCOES = [
    { k: 'contraste', t: 'Cores fortes', s: 'Mais contraste' },
    { k: 'leitura', t: 'Letra espaçada', s: 'Mais fácil de ler' },
    { k: 'parado', t: 'Parar animações', s: 'Tela sem movimento' },
    { k: 'destaque', t: 'Destacar botões', s: 'Botões bem marcados' },
    { k: 'cursor', t: 'Cursor grande', s: 'Setinha maior' },
    { k: 'regua', t: 'Régua de leitura', s: 'Faixa que segue o mouse' },
    { k: 'voz', t: 'Ler em voz alta', s: 'A voz lê a tela' }
  ];
  const TAMANHOS = ['Normal', 'Grande', 'Maior'];

  /* ---------- aplicar ---------- */
  const html = document.documentElement;
  function aplicar() {
    html.classList.remove('a11y-texto-1', 'a11y-texto-2');
    if (op.texto) html.classList.add(`a11y-texto-${op.texto}`);
    ['contraste', 'leitura', 'parado', 'destaque', 'cursor', 'regua'].forEach(k => html.classList.toggle(`a11y-${k}`, !!op[k]));
    NK.semMovimento = !!op.parado;   // o chat que "digita" mostra tudo de uma vez
    if (!op.regua) regua?.remove(), regua = null;
    else if (!regua) { regua = document.createElement('div'); regua.className = 'a11y-faixa'; regua.setAttribute('aria-hidden', 'true'); document.body.appendChild(regua); }
  }
  let regua = null;
  document.addEventListener('pointermove', e => { if (regua) regua.style.top = `${e.clientY}px`; }, { passive: true });

  const vozLigada = () => !!progresso?.vozAuto?.();

  /* ---------- painel ---------- */
  function montarPainel() {
    const bt = document.createElement('button');
    bt.className = 'a11y-bt';
    bt.id = 'a11yBotao';
    bt.setAttribute('aria-label', 'Acessibilidade');
    bt.setAttribute('aria-expanded', 'false');
    bt.setAttribute('aria-controls', 'a11yPainel');
    bt.innerHTML = ICONES.acess;

    const painel = document.createElement('section');
    painel.className = 'a11y-painel';
    painel.id = 'a11yPainel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'Acessibilidade');
    painel.hidden = true;
    document.body.append(bt, painel);

    const desenhar = () => {
      painel.innerHTML = `
        <header class="a11y-topo">
          <span class="a11y-capitao">${I ? I('capitao') : ''}</span>
          <div><h2>Acessibilidade</h2><small>Deixe o jogo do seu jeito</small></div>
          <button class="a11y-x" aria-label="Fechar">✕</button>
        </header>
        <div class="a11y-corpo">
          <fieldset class="a11y-tamanho"><legend>Tamanho do texto</legend>
            <div>${TAMANHOS.map((t, i) => `<button data-tam="${i}" aria-pressed="${op.texto === i}" style="--a:${1 + i * .22}"><b>A</b><span>${t}</span></button>`).join('')}</div>
          </fieldset>
          <div class="a11y-grade">
            ${OPCOES.map(o => {
              const on = o.k === 'voz' ? vozLigada() : !!op[o.k];
              return `<button class="a11y-op" data-k="${o.k}" aria-pressed="${on}">
                <span class="a11y-ico">${ICONES[o.k]}</span>
                <span class="a11y-txt"><b>${esc(o.t)}</b><small>${esc(o.s)}</small></span>
                <span class="a11y-check" aria-hidden="true"></span>
              </button>`;
            }).join('')}
          </div>
          <button class="a11y-limpar">${ICONES.refazer}<span>Voltar ao normal</span></button>
        </div>`;
      painel.querySelector('.a11y-x').onclick = () => fechar(true);
      painel.querySelectorAll('[data-tam]').forEach(b => b.onclick = () => { op.texto = +b.dataset.tam; mudou(); });
      painel.querySelectorAll('.a11y-op').forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        if (k === 'voz') {
          progresso.definirVozAuto(!vozLigada());
          NK.atualizarVoz?.();
          if (!vozLigada()) NK.pararVoz?.();
        } else op[k] = !op[k];
        mudou(k);
      });
      painel.querySelector('.a11y-limpar').onclick = () => { op = { ...PADRAO }; mudou(); };
    };
    const mudou = foco => {
      salvar(); aplicar(); desenhar();
      (painel.querySelector(foco ? `[data-k="${foco}"]` : '[aria-pressed="true"]') || painel.querySelector('button'))?.focus();
    };

    const abrir = () => {
      desenhar();
      painel.hidden = false; bt.setAttribute('aria-expanded', 'true'); bt.classList.add('aberto');
      painel.querySelector('[data-tam]')?.focus();
    };
    function fechar(devolverFoco) {
      if (painel.hidden) return;
      painel.hidden = true; bt.setAttribute('aria-expanded', 'false'); bt.classList.remove('aberto');
      if (devolverFoco) bt.focus();
    }
    bt.onclick = () => (painel.hidden ? abrir() : fechar(true));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !painel.hidden) { e.stopPropagation(); fechar(true); } }, true);
    document.addEventListener('pointerdown', e => { if (!painel.hidden && !painel.contains(e.target) && !bt.contains(e.target)) fechar(false); });
  }

  aplicar();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarPainel);
  else montarPainel();
})();
