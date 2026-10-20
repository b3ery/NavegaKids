/* ============================================================
   NavegaKids · telas/comum.js
   Peças usadas por várias telas: botão áspero do Figma, cadeado, ícone de cada fase,
   bandeira numerada das ilhas e as ilhas e estrelas das cenas do Capitão.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, progresso, esc, I } = NK;

  /* filtro SVG das bordas ásperas dos botões amarelos do Figma (.btn-figma) */
  const FILTRO_ASPERO = `<svg class="filtros-svg" aria-hidden="true" focusable="false">
    <filter id="nkAspero"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
  </svg>`;

  /* cadeado preenchido (Remix Icon lock-2-fill), como no frame de Ilhas */
  const CADEADO_FILL = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 1 1 14 0v1zm-2 0V9A5 5 0 0 0 7 9v1h10zm-6 4v4h2v-4h-2z"/></svg>`;

  /* Ícone usado no Figma quando ele difere do campo "icone" de data.js
     (Fase 1: o Figma usa o anônimo; data.js indica a luneta). */
  const ICONE_FIGMA = { 1: 'anonimo' };
  const iconeFase = f => ICONE_FIGMA[f.id] || f.icone;
  /* ícone composto do Figma no mapa da ilha: Fase 1 = lupa + silhueta de perfil */
  const ICONE_DUPLO = { 1: ['misterio', 'anonimo'] };

  /* bandeirinha numerada na cor da ilha, igual às do mapa de Ilhas */
  const bandeira = il => `<svg viewBox="0 0 60 70" aria-hidden="true" focusable="false">
    <rect x="4" y="6" width="5" height="62" rx="2.5" fill="#E2A92E"/><circle cx="6.5" cy="6" r="4.5" fill="#F6C945"/>
    <path d="M9 9 H56 L46 24 L56 39 H9 Z" fill="${il.cor}" stroke="#1E293B" stroke-width="2" stroke-linejoin="round"/>
    <text x="29" y="32" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" font-family="inherit">${il.id}</text></svg>`;

  const ilhasHtml = () =>
    ILHAS.map(
      (il, i) =>
        `<figure style="--i:${i};--cor:${il.cor}">${I(il.icone, { alt: '' })}<figcaption>${esc(il.nome)}</figcaption></figure>`
    ).join('');
  const estrelasHtml = n =>
    Array.from(
      { length: Math.max(1, n) },
      (_, i) => `<span style="--i:${i}">${I('estrela', { alt: '' })}</span>`
    ).join(''); // só as estrelas ganhas
  const nomeNav = () => progresso.nome() || 'navegador';

  NK.comum = {
    FILTRO_ASPERO,
    CADEADO_FILL,
    iconeFase,
    ICONE_DUPLO,
    bandeira,
    nomeNav,
    ilhasHtml,
    estrelasHtml
  };
})();
