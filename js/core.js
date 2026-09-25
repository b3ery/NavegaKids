/* ============================================================
   NavegaKids — core.js
   Utilitários · ligação com a pasta /img · progresso salvo · popups
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

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
    (st ? ` style="${st}"` : '') + ' draggable="false" onerror="NK.imgFail(this)">';
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

const NK = {
  imgFail(img) {
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
  },
  reset() { S = estadoInicial(); }
};

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
   PROGRESSO (em memória apenas — NÃO persiste entre recarregamentos)
   Esta é uma simulação sem persistência: a cada F5 o jogo deve voltar
   sempre para Ilha 1 / Fase 1 / Atividade 1. Dentro da MESMA sessão
   (navegando pelas rotas sem recarregar a página), o progresso é mantido
   normalmente na variável S.
   ============================================================ */
const DEV = /[?&]dev=1/.test(location.search);          // ?dev=1 libera tudo (teste)
const estadoInicial = () => ({ nome: '', feitas: {}, intro: {}, faseVista: null });
let S = estadoInicial();
const salvar = () => { /* intencionalmente vazio: sem persistência entre reloads */ };

const faseById = id => FASES.find(f => f.id === id);
const ilhaById = id => ILHAS.find(i => i.id === id);
const fasesDaIlha = iid => FASES.filter(f => f.ilha === iid);
const feita = (fid, i) => !!S.feitas[fid + '-' + i];
const nFeitas = fid => faseById(fid).atividades.filter((_, i) => feita(fid, i)).length;
const faseCompleta = fid => nFeitas(fid) === faseById(fid).atividades.length;
const faseLiberada = fid => DEV || fid === 1 || faseCompleta(fid - 1);
const ilhaCompleta = iid => fasesDaIlha(iid).every(f => faseCompleta(f.id));
const ilhaLiberada = iid => DEV || iid === 1 || ilhaCompleta(iid - 1);
const estrelasTotal = () => FASES.reduce((s, f) => s + nFeitas(f.id) * (f.dobro ? 2 : 1), 0);
const estrelasMax = () => FASES.reduce((s, f) => s + f.atividades.length * (f.dobro ? 2 : 1), 0);
const proximaAtv = fid => faseById(fid).atividades.findIndex((_, i) => !feita(fid, i));
const faseAtual = () => FASES.find(f => faseLiberada(f.id) && !faseCompleta(f.id)) || FASES[FASES.length - 1];
const jornadaCompleta = () => ilhaCompleta(3);
const temProgresso = () => Object.keys(S.feitas).length > 0;

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
let _bump = false;
function cabecalho(ativo) {
  const it = (h, id, t) => `<a href="${h}" class="${ativo === id ? 'on' : ''}" ${ativo === id ? 'aria-current="page"' : ''}>${t}</a>`;
  $('#topbar').innerHTML = `
    <a class="logo" href="#/home">NavegaKids</a>
    <nav class="nav" aria-label="Menu principal">${it('#/home', 'home', 'Início')}${it('#/ilhas', 'ilhas', 'Ilhas')}${it('#/missoes', 'missoes', 'Missões')}${it('#/diario', 'diario', 'Diário do Capitão')}</nav>
    <button class="starbadge ${_bump ? 'bump' : ''}" id="starBtn" aria-label="Suas estrelas: ${estrelasTotal()}">${I('estrela')}<b>${estrelasTotal()}</b></button>`;
  _bump = false;
  $('#starBtn').onclick = () => popup({
    cor: 'b', titulo: 'Suas estrelas',
    extra: `<p>Você tem ${estrelasTotal()} de ${estrelasMax()} estrelas. Complete as atividades para ganhar mais!</p>`,
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
