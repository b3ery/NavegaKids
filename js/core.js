/* ============================================================
   NavegaKids — core.js
   Utilitários · ligação com a pasta /img · popups · cabeçalho
   (o progresso do jogador fica em progresso.js)
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { EXTS, IMG, SVG_RESERVA, progresso } = NK;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /** Navega para uma rota (#/home, #/ilhas, ...). */
  const go = hash => { location.hash = hash; };

  /* ---------- timers que são limpos ao trocar de tela ---------- */
  let _timers = [], _intervals = [], _leave = null;
  const later = (fn, ms) => { const id = setTimeout(fn, ms); _timers.push(id); return id; };
  const every = (fn, ms) => { const id = setInterval(fn, ms); _intervals.push(id); return id; };
  function clearTimers() {
    _timers.forEach(clearTimeout); _intervals.forEach(clearInterval);
    _timers = []; _intervals = [];
    if (_leave) { try { _leave(); } catch (e) {} _leave = null; }
  }
  const onLeave = fn => { _leave = fn; };

  /* ============================================================
     IMAGENS  →  pasta img/
     ============================================================ */
  const srcOf = (key, i) => 'img/' + encodeURIComponent(IMG[key][0]) + '.' + EXTS[i];
  const _faltando = new Set();
  function anotaFalta(key) {
    if (_faltando.has(key)) return;
    _faltando.add(key);
    clearTimeout(anotaFalta.t);
    anotaFalta.t = setTimeout(() => console.info(
      '[NavegaKids] Não achei estes arquivos em /img (usando emoji no lugar): ' +
      [..._faltando].map(k => IMG[k][0]).join(', ')), 900);
  }

  /* <img> com fallback automático: tenta as extensões e por fim vira emoji */
  function I(key, o = {}) {
    const d = IMG[key];
    if (!d) return '';
    const st = o.size ? `width:${o.size}px;height:${o.size}px;` : '';
    return `<img class="ico${o.cls ? ' ' + o.cls : ''}" src="${srcOf(key, 0)}" data-k="${key}" data-i="0" ` +
      (o.alt ? `alt="${esc(o.alt)}"` : 'alt="" aria-hidden="true"') +
      (st ? ` style="${st}"` : '') + ' draggable="false" onerror="NavegaKids.imgFail(this)">';
  }

  /* Chamado pelo onerror das imagens: tenta a próxima extensão e, por fim, troca pelo emoji. */
  function imgFail(img) {
    const key = img.dataset.k;
    const i = (+img.dataset.i) + 1;
    if (i < EXTS.length) { img.dataset.i = i; img.src = srcOf(key, i); return; }
    anotaFalta(key);
    const em = IMG[key][1];
    if (!em) { img.remove(); return; }
    const sp = document.createElement('span');
    sp.className = ('emo ' + img.className.replace('ico', '')).trim();
    if (img.alt) { sp.setAttribute('role', 'img'); sp.setAttribute('aria-label', img.alt); } else sp.setAttribute('aria-hidden', 'true');
    sp.style.cssText = img.style.cssText;
    const w = img.getBoundingClientRect().width;
    if (w >= 24) sp.style.fontSize = Math.round(w * 0.78) + 'px';
    if (em.startsWith('svg:')) sp.innerHTML = SVG_RESERVA[em.slice(4)] || '';
    else sp.textContent = em;
    img.replaceWith(sp);
  }

  /* Ícone de cadeado desenhado em SVG — não existe asset de cadeado na pasta
     img/ (o arquivo "bloqueado" é um ícone de "usuário bloqueado", não serve
     pra indicar ilha/fase trancada), então geramos um cadeado simples aqui. */
  function cadeadoIcon(o = {}) {
    const size = o.size || 22;
    return `<svg class="ico cadeado-svg${o.cls ? ' ' + o.cls : ''}" width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" focusable="false">
      <rect x="4" y="10.5" width="16" height="10.5" rx="2.4"></rect>
      <path d="M7.5 10.5V7.2a4.5 4.5 0 0 1 9 0v3.3"></path>
      <circle cx="12" cy="15.3" r="1.6" fill="currentColor" stroke="none"></circle>
    </svg>`;
  }

  /* Posiciona elementos absolutos por cima de um background-image que usa
     background-size:cover (sem esticar), calculando exatamente qual pedaço
     da imagem ficou visível — assim os botões nunca desalinham das ilhas,
     mesmo a imagem sendo cortada de forma diferente em cada tela. */
  function posicionarSobreCover(container, imgKey, pontos, modo = 'cover') {
    const url = srcOf(imgKey, 0);
    const img = new Image();
    img.onload = () => {
      if (container.isConnected) container.style.backgroundImage = `url("${url}")`;
      const aplicar = () => {
        if (!container.isConnected) return;
        const cw = container.clientWidth, ch = container.clientHeight;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        if (!cw || !ch || !iw || !ih) return;
        const scale = modo === 'contain' ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);
        const sw = iw * scale, sh = ih * scale;
        const offX = (sw - cw) / 2, offY = (sh - ch) / 2;
        pontos.forEach(p => {
          const el = container.querySelector(`[data-pos="${p.id}"]`);
          if (!el) return;
          const px = p.fx * sw - offX, py = p.fy * sh - offY;
          el.style.left = (px / cw * 100) + '%';
          el.style.top = (py / ch * 100) + '%';
        });
      };
      aplicar();
      window.addEventListener('resize', aplicar);
    };
    img.src = url;
  }

  /* fundo de tela: tenta cada chave × extensão */
  const _bgCache = {};
  function setBg(el, keys) {
    const apply = u => { el.style.backgroundImage = `url("${u}")`; el.classList.add('has-bg'); };
    const hit = keys.find(k => _bgCache[k]);
    if (hit) { apply(_bgCache[hit]); return; }
    const lista = [];
    keys.forEach(k => { if (IMG[k]) EXTS.forEach((_, i) => lista.push([k, i])); });
    let n = 0;
    const prox = () => {
      if (n >= lista.length) { keys.forEach(anotaFalta); return; }
      const [k, i] = lista[n++];
      const u = srcOf(k, i), im = new Image();
      im.onload = () => { _bgCache[k] = u; if (el.isConnected) apply(u); };
      im.onerror = prox;
      im.src = u;
    };
    prox();
  }

  /* ============================================================
     POPUPS e AVISOS
     ============================================================ */
  function fecharPopups() { $$('.popup-wrap').forEach(p => p.remove()); }

  /* opts: cor('' | t | c | b) · avatar{nome} · titulo · texto · extra(html) · btns[{t,cls,fn}] · dim · x */
  function popup(o) {
    const w = document.createElement('div');
    w.className = 'popup-wrap' + (o.dim === false ? ' nodim' : '');
    w.setAttribute('role', 'dialog');
    w.innerHTML = `<div class="popup ${o.cor ? 'cor-' + o.cor : ''}">
      ${o.x ? '<button class="x" aria-label="Fechar">X</button>' : ''}
      ${o.avatar ? `<div class="who">${I('usuario', { cls: 'av' })}<span>${esc(o.avatar.nome)}</span></div>` : ''}
      ${o.titulo ? `<h3>${o.titulo}</h3>` : ''}
      ${o.texto ? `<p>${esc(o.texto)}</p>` : ''}
      ${o.extra || ''}
      <div class="btns">${(o.btns || []).map((b, i) => `<button class="btn ${b.cls || ''}" data-b="${i}">${esc(b.t)}</button>`).join('')}</div>
    </div>`;
    document.body.appendChild(w);
    $$('[data-b]', w).forEach(bt => bt.onclick = () => {
      const b = o.btns[+bt.dataset.b];
      const r = b.fn ? b.fn(w) : undefined;
      if (r !== false) w.remove();
    });
    const x = $('.x', w);
    if (x) x.onclick = () => { w.remove(); if (o.x !== true && typeof o.x === 'function') o.x(); };
    const primeiro = $('[data-b]', w);
    if (primeiro) primeiro.focus();
    return w;
  }

  function toast(msg) {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  /* ============================================================
     CABEÇALHO e montagem de tela
     ============================================================ */
  let _destacar = false;
  /** Faz as estrelas e os pontos do cabeçalho "pularem" na próxima tela. */
  const destacarContadores = () => { _destacar = true; };

  function cabecalho(ativo) {
    const estrelas = progresso.estrelasTotal();
    const pontos = progresso.pontosTotal();
    const it = (h, id, t) => `<a href="${h}" class="${ativo === id ? 'on' : ''}" ${ativo === id ? 'aria-current="page"' : ''}>${t}</a>`;
    $('#topbar').innerHTML = `
      <a class="logo" href="#/home">NavegaKids</a>
      <nav class="nav" aria-label="Menu principal">${it('#/home', 'home', 'Início')}${it('#/ilhas', 'ilhas', 'Ilhas')}${it('#/missoes', 'missoes', 'Missões')}${it('#/diario', 'diario', 'Diário do Capitão')}</nav>
      <div class="hud">
        <span class="pontosbadge ${_destacar ? 'bump' : ''}" aria-label="Seus pontos: ${pontos}">${I('moedas')}<b>${pontos}</b></span>
        <button class="starbadge ${_destacar ? 'bump' : ''}" id="starBtn" aria-label="Suas estrelas: ${estrelas}">${I('estrela')}<b>${estrelas}</b></button>
      </div>`;
    _destacar = false;
    $('#starBtn').onclick = () => popup({
      cor: 'b', titulo: 'Suas estrelas',
      extra: `<p>Você tem ${estrelas} de ${progresso.estrelasMax()} estrelas e ${pontos} pontos. Complete as fases sem errar para ganhar mais!</p>`,
      btns: [{ t: 'Fechar', cls: 'btn-b' }]
    });
  }

  function montar(html, ativo) {
    const stage = $('#stage');
    document.body.classList.remove('tela-figma');
    stage.innerHTML = html;
    stage.scrollTop = 0;
    cabecalho(ativo);
    $$('[data-bg]', stage).forEach(el => setBg(el, el.dataset.bg.split(',')));
  }

  Object.assign(NK, {
    // utilitários
    $, $$, esc, shuffle, go, later, every, clearTimers, onLeave,
    // imagens
    I, imgFail, cadeadoIcon, posicionarSobreCover, setBg,
    // popups e tela
    fecharPopups, popup, toast, destacarContadores, cabecalho, montar
  });
})();
