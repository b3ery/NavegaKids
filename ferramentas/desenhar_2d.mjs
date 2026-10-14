/* ============================================================
   NavegaKids — ferramentas/desenhar_2d.mjs   (JavaScript / Node.js)

   Desenha em 2D (estilo "flat": formas simples, contorno Azul Noturno e as cores
   da paleta) as artes do jogo que eram 3D, e grava:
     arte/<nome>.svg   o desenho editável (vetor)
     img/<nome>.png    a imagem que o jogo usa (mesmo nome e tamanho da antiga)

   Todas as peças (nuvem, sol, mar, ilha, navio...) saem das mesmas funções,
   então ficam com o mesmo traço. Para mudar uma cor ou uma ilha, edite aqui e
   rode de novo:
     npm install --no-save playwright      (uma vez; usa o Chromium do Playwright)
     node ferramentas/desenhar_2d.mjs           (todas)
     node ferramentas/desenhar_2d.mjs estrela   (só uma)

   As posições seguem as artes antigas, porque as telas do Figma contam com elas:
   o horizonte do FundoFases fica em y 887, as ilhas do Mapa_Home ficam onde o
   router.js põe os brilhos (HOME_ILHAS) e cada ilha1-3 ocupa a mesma caixa.
   O certificado e o convés do navio (Barco.png) não são gerados aqui.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------------- paleta oficial (+ tons para madeira e pele) ---------------- */
const C = {
  navy: '#1E293B', yellow: '#FFC83B', yellowD: '#E0A91D', yellowL: '#FFE9A8',
  coral: '#FF7A59', coralD: '#E2593A', blue: '#4EA8DE', blueD: '#3388BD', blueL: '#E6F3FC',
  teal: '#2EC4B6', tealD: '#1C9F8D', cream: '#FFF9E6', white: '#FFFFFF',
  ceu: '#8FD0F5', mar: '#3FA9E0', marD: '#2C8CC6',
  areia: '#FFE3A1', areiaD: '#F2C66B',
  madeira: '#C27C4A', madeiraD: '#8A5A2B',
  pele: '#F8C9A0', peleD: '#E9A77C'
};
const T = 8;   // espessura do contorno (px na arte de 1728 de largura)
const L = (w = T) => `stroke="${C.navy}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/* ---------------- peças ---------------- */
const nuvem = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-110 30 Q-130 -10 -85 -22 Q-80 -70 -30 -68 Q-5 -110 45 -82 Q95 -92 100 -40 Q140 -30 125 12 Q120 34 90 34 L-80 34 Q-104 34 -110 30 Z" fill="${C.white}" ${L(7)}/>
  <path d="M-92 22 Q-60 30 -20 22 Q30 32 70 22 Q100 28 112 14" fill="none" stroke="${C.blueL}" stroke-width="10" stroke-linecap="round"/>
</g>`;

const sol = (x, y, r = 70) => {
  const raios = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30;
    return `<rect x="${-7}" y="${-r - 48}" width="14" height="30" rx="7" fill="${C.yellow}" ${L(6)} transform="rotate(${a})"/>`;
  }).join('');
  return `<g transform="translate(${x} ${y})">${raios}
    <circle r="${r}" fill="${C.yellow}" ${L(7)}/>
    <circle cx="${-r * .32}" cy="${-r * .3}" r="${r * .22}" fill="${C.white}" opacity=".55"/></g>`;
};

const ceu = (w, h, horizonte) => `<defs><linearGradient id="gCeu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.ceu}"/></linearGradient></defs>
  <rect width="${w}" height="${horizonte + 20}" fill="url(#gCeu)"/>`;

/* faixa de mar com ondinhas brancas */
const mar = (w, y, h) => {
  const ondas = [];
  for (let linha = 0; linha < 6; linha++) {
    const yy = y + 50 + linha * (h / 6.2);
    for (let i = 0; i < 7; i++) {
      const xx = ((i * 290 + linha * 140) % (w + 200)) - 100;
      ondas.push(`<path d="M${xx} ${yy} q 22 -18 44 0 q 22 18 44 0" fill="none" stroke="${C.white}" stroke-width="${6 + linha}" stroke-linecap="round" opacity=".75"/>`);
    }
  }
  return `<rect x="0" y="${y}" width="${w}" height="${h}" fill="${C.mar}"/>
    <rect x="0" y="${y + h * .45}" width="${w}" height="${h * .55}" fill="${C.marD}" opacity=".45"/>
    <path d="M0 ${y} H${w}" ${L(6)} opacity=".35"/>${ondas.join('')}`;
};

/* palmeira simples (tronco curvo e folhas turquesa) */
const palmeira = (x, y, s = 1, lado = 1) => `<g transform="translate(${x} ${y}) scale(${s * lado} ${s})">
  <path d="M0 0 Q 8 -60 -6 -120" fill="none" stroke="${C.navy}" stroke-width="22" stroke-linecap="round"/>
  <path d="M0 0 Q 8 -60 -6 -120" fill="none" stroke="${C.madeira}" stroke-width="12" stroke-linecap="round"/>
  <g transform="translate(-6 -122)">
    <path d="M0 0 Q -40 -30 -78 -6 Q -40 -12 0 6 Z" fill="${C.teal}" ${L(6)}/>
    <path d="M0 0 Q 42 -32 82 -4 Q 40 -10 0 6 Z" fill="${C.teal}" ${L(6)}/>
    <path d="M0 2 Q -24 -50 -4 -74 Q -2 -40 6 0 Z" fill="${C.tealD}" ${L(6)}/>
    <path d="M0 2 Q 30 -44 58 -46 Q 26 -24 6 6 Z" fill="${C.tealD}" ${L(6)}/>
    <circle cx="-4" cy="6" r="9" fill="${C.madeiraD}" ${L(5)}/><circle cx="10" cy="8" r="9" fill="${C.madeiraD}" ${L(5)}/>
  </g></g>`;

/* bandeira no mastro, com número opcional */
const bandeira = (x, y, cor, num, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-7" y="-150" width="14" height="160" rx="7" fill="${C.yellowD}" ${L(6)}/>
  <circle cx="0" cy="-156" r="12" fill="${C.yellow}" ${L(6)}/>
  <path d="M7 -142 H96 L78 -112 L96 -82 H7 Z" fill="${cor}" ${L(7)}/>
  ${num ? `<text x="46" y="-98" text-anchor="middle" font-family="Fredoka, Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="40" fill="${C.white}" stroke="${C.navy}" stroke-width="3" paint-order="stroke">${num}</text>` : ''}
</g>`;

/* ilha: areia, morro laranja com mato turquesa, palmeiras e bandeira.
   (cx, base) = centro da areia; largura = largura da areia */
function ilha(cx, base, largura, cor, num, { bandeiraNum = true, alto = 1, semBandeira = false } = {}) {
  const w = largura, h = w * .62 * alto;
  const s = w / 560;
  return `<g>
    <ellipse cx="${cx}" cy="${base}" rx="${w * .62}" ry="${w * .07}" fill="${C.white}" opacity=".45"/>
    <ellipse cx="${cx}" cy="${base - 6 * s}" rx="${w * .52}" ry="${w * .1}" fill="${C.areia}" ${L(T * s)}/>
    <path d="M${cx - w * .44} ${base - 18 * s}
      C ${cx - w * .40} ${base - h * .55}, ${cx - w * .24} ${base - h * .72}, ${cx - w * .12} ${base - h * .86}
      C ${cx - w * .05} ${base - h * .98}, ${cx + w * .06} ${base - h * 1.0}, ${cx + w * .13} ${base - h * .86}
      C ${cx + w * .25} ${base - h * .68}, ${cx + w * .40} ${base - h * .5}, ${cx + w * .44} ${base - 18 * s} Z"
      fill="${C.coral}" ${L(T * s)}/>
    <path d="M${cx + w * .06} ${base - h * .96} C ${cx + w * .2} ${base - h * .7}, ${cx + w * .32} ${base - h * .5}, ${cx + w * .38} ${base - 26 * s}
      L ${cx + w * .44} ${base - 18 * s} C ${cx + w * .40} ${base - h * .5}, ${cx + w * .25} ${base - h * .68}, ${cx + w * .13} ${base - h * .86} Z"
      fill="${C.coralD}" opacity=".7"/>
    <path d="M${cx - w * .2} ${base - h * .7} q ${w * .05} ${h * .06} ${w * .1} 0 M${cx + w * .02} ${base - h * .5} q ${w * .05} ${h * .06} ${w * .1} 0 M${cx - w * .26} ${base - h * .36} q ${w * .05} ${h * .06} ${w * .1} 0"
      fill="none" stroke="${C.coralD}" stroke-width="${10 * s}" stroke-linecap="round"/>
    <path d="M${cx - w * .16} ${base - h * .8} C ${cx - w * .1} ${base - h * 1.02}, ${cx + w * .12} ${base - h * 1.04}, ${cx + w * .16} ${base - h * .8}
      Q ${cx + w * .08} ${base - h * .74} ${cx + w * .02} ${base - h * .8} Q ${cx - w * .06} ${base - h * .72} ${cx - w * .16} ${base - h * .8} Z"
      fill="${C.teal}" ${L(T * s)}/>
    <path d="M${cx - w * .44} ${base - 18 * s} Q ${cx - w * .38} ${base - h * .3} ${cx - w * .24} ${base - h * .26} Q ${cx - w * .18} ${base - h * .14} ${cx - w * .06} ${base - h * .18}
      Q ${cx + w * .06} ${base - h * .06} ${cx + w * .2} ${base - h * .16} Q ${cx + w * .32} ${base - h * .12} ${cx + w * .44} ${base - 18 * s} Z"
      fill="${C.teal}" ${L(T * s)}/>
    ${palmeira(cx - w * .34, base - 24 * s, s * 1.15, 1)}
    ${palmeira(cx + w * .36, base - 22 * s, s * 1.0, -1)}
    ${palmeira(cx - w * .18, base - 30 * s, s * .8, -1)}
    ${semBandeira ? '' : bandeira(cx, base - h * .97, cor, bandeiraNum ? num : '', s * 1.25)}
  </g>`;
}

/* navio pirata simples, de lado */
const navio = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="-8" y="-330" width="16" height="320" rx="6" fill="${C.madeiraD}" ${L()}/>
  <rect x="-150" y="-250" width="12" height="230" rx="6" fill="${C.madeiraD}" ${L()} transform="translate(30 0)"/>
  <path d="M-14 -310 Q 120 -270 -14 -150 Z" fill="${C.white}" ${L()}/>
  <path d="M-14 -140 Q 140 -100 -14 -20 Z" fill="${C.cream}" ${L()}/>
  <path d="M-126 -240 Q -20 -200 -126 -90 Z" fill="${C.white}" ${L()}/>
  <path d="M8 -330 H90 L74 -304 L90 -278 H8 Z" fill="${C.navy}"/>
  <circle cx="46" cy="-306" r="10" fill="${C.white}"/>
  <path d="M-230 -20 H230 L190 70 Q 0 100 -190 70 Z" fill="${C.madeira}" ${L()}/>
  <path d="M-222 -2 H222" ${L(6)}/>
  <path d="M-205 30 H205" stroke="${C.madeiraD}" stroke-width="8" stroke-linecap="round"/>
  ${[-120, -40, 40, 120].map(cx => `<circle cx="${cx}" cy="12" r="14" fill="${C.navy}" stroke="${C.yellow}" stroke-width="5"/>`).join('')}
  <path d="M-240 -40 H-180 V-20 H-240 Z M180 -50 H250 V-20 H180 Z" fill="${C.madeiraD}" ${L(6)}/>
</g>`;

/* ---------------- artes ---------------- */
const W = 1728, H = 1683;
const svg = (w, h, corpo) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${corpo}</svg>`;

const nuvens = lista => lista.map(([x, y, s]) => nuvem(x, y, s)).join('');

const ARTES = {
  /* Home: céu, mar, uma ilha grande à esquerda e duas pequenas */
  Fundo_Home: () => svg(W, H, `${ceu(W, H, 1080)}
    ${sol(1500, 300, 80)}
    ${nuvens([[380, 260, 1.1], [820, 160, .8], [1180, 380, 1.2], [260, 620, .7], [1600, 640, .9], [900, 560, .6]])}
    ${mar(W, 1080, H - 1080)}
    ${ilha(1000, 1150, 330, C.coral, '')}
    ${ilha(1420, 1170, 320, C.teal, '')}
    ${ilha(300, 1640, 820, C.blue, '', { semBandeira: true })}`),

  /* Ilhas: céu e mar (as ilhas vêm das camadas ilha1-3) */
  Fundo_Ilhas: () => svg(W, 1309, `${ceu(W, 1309, 880)}
    ${sol(1560, 170, 70)}
    ${nuvens([[260, 210, 1], [700, 120, .8], [1180, 230, 1.1], [1480, 420, .7], [480, 420, .6]])}
    ${mar(W, 880, 1309 - 880)}`),

  /* mapa de cada ilha: céu em cima, areia embaixo; horizonte em y 887 */
  FundoFases: () => svg(W, H, `${ceu(W, H, 887)}
    ${sol(1180, 170, 70)}
    ${nuvens([[260, 200, .9], [620, 120, .7], [900, 300, .6], [1480, 150, .9], [1600, 420, .6], [420, 460, .55]])}
    <rect x="0" y="887" width="${W}" height="${H - 887}" fill="${C.areia}"/>
    <path d="M0 887 H${W}" ${L(6)} opacity=".3"/>
    ${Array.from({ length: 140 }, (_, i) => `<circle cx="${(i * 197) % W}" cy="${930 + ((i * 89) % (H - 960))}" r="${4 + (i % 4) * 2}" fill="${C.areiaD}" opacity=".7"/>`).join('')}
    ${Array.from({ length: 18 }, (_, i) => `<path d="M${(i * 311) % W} ${1000 + ((i * 137) % 600)} q 30 -14 60 0" fill="none" stroke="${C.areiaD}" stroke-width="8" stroke-linecap="round"/>`).join('')}`),

  /* fundo das atividades: céu e mar */
  fundo: () => svg(W, H, `${ceu(W, H, 900)}
    ${sol(1440, 230, 80)}
    ${nuvens([[300, 260, 1.1], [760, 160, .8], [1120, 420, 1], [1600, 520, .8], [420, 620, .7]])}
    ${mar(W, 900, H - 900)}`),

  /* tela "carregando": mar e o navio grande */
  fundo_carregando: () => svg(W, H, `${ceu(W, H, 900)}
    ${sol(1520, 220, 80)}
    ${nuvens([[360, 220, 1.2], [880, 150, .9], [1240, 360, 1.1], [240, 560, .8], [1560, 600, .9]])}
    ${mar(W, 900, H - 900)}
    ${navio(620, 960, 1.3)}`),

  /* ilhas das camadas da tela Ilhas (mesma caixa das antigas: x≈580-1160, y≈548-1130) */
  ilha1: () => svg(W, H, ilha(868, 1100, 450, C.blue, '1', { alto: 1.3 })),
  ilha2: () => svg(W, H, ilha(868, 1100, 430, C.coral, '2', { alto: 1.35 })),
  ilha3: () => svg(W, H, ilha(868, 1100, 460, C.teal, '3', { alto: 1.28 })),

  /* mapa de pergaminho do Início (ilhas onde o router.js põe os brilhos) */
  Mapa_Home: () => {
    const ilhas = [[1056, 678, C.blue, '1'], [1465, 879, C.coral, '2'], [1063, 1046, C.teal, '3']];
    return svg(W, H, `
      <path d="M800 500 Q 860 470 940 492 Q 1060 462 1180 488 Q 1320 470 1440 494 Q 1580 466 1680 506
        Q 1700 640 1684 780 Q 1702 930 1686 1080 Q 1700 1240 1676 1360 Q 1540 1384 1400 1362 Q 1260 1386 1120 1364
        Q 980 1382 860 1360 Q 790 1366 780 1340 Q 798 1200 784 1060 Q 800 900 782 760 Q 796 620 800 500 Z"
        fill="${C.yellowL}" ${L(10)}/>
      <path d="M830 540 Q 1240 510 1650 548 Q 1662 950 1640 1320 Q 1240 1340 830 1318 Q 820 930 830 540 Z" fill="none" stroke="${C.yellowD}" stroke-width="8" stroke-dasharray="2 18" stroke-linecap="round"/>
      <path d="M1100 700 C 1300 640, 1420 760, 1450 860 M1440 920 C 1400 1040, 1220 1080, 1110 1050" fill="none" stroke="${C.navy}" stroke-width="9" stroke-dasharray="20 18" stroke-linecap="round"/>
      ${ilhas.map(([x, y, cor, n]) => `${ilha(x, y + 70, 220, cor, '', { bandeiraNum: false })}
        <text x="${x - 150}" y="${y - 30}" text-anchor="middle" font-family="Fredoka, Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="86" fill="${cor}" stroke="${C.navy}" stroke-width="6" paint-order="stroke">${n}</text>`).join('')}
      <g transform="translate(1520 1250) scale(.9)" fill="none" ${L(7)}>
        <rect x="-60" y="-40" width="120" height="76" rx="12" fill="${C.madeira}"/><path d="M-60 -10 H60 M-10 -40 V36"/><rect x="-14" y="-18" width="28" height="22" rx="4" fill="${C.yellow}"/>
      </g>
      <path d="M880 1270 q 20 -16 40 0 q 20 16 40 0 M900 1300 q 20 -16 40 0 q 20 16 40 0" fill="none" stroke="${C.blueD}" stroke-width="8" stroke-linecap="round"/>
      <g transform="translate(1250 1240)">${'<path d="M-50 40 L50 40 L36 64 L-36 64 Z" fill="' + C.madeira + '" ' + L(6) + '/><path d="M0 -40 V40 M0 -36 Q40 0 0 30" fill="' + C.white + '" ' + L(6) + '/>'}</g>
      <path d="M1600 600 l 40 -40 m -40 0 l 40 40" ${L(10)} stroke="${C.coralD}"/>`);
  },

  /* mapa da partida (Fase 2, lobby): pergaminho com ilhas e X */
  mapa: () => svg(1440, 1024, `
    <rect width="1440" height="1024" fill="${C.mar}"/>
    ${mar(1440, 0, 1024)}
    <path d="M90 90 Q 400 50 720 80 Q 1040 50 1350 92 Q 1390 512 1350 934 Q 1040 970 720 942 Q 400 974 90 934 Q 50 512 90 90 Z" fill="${C.yellowL}" ${L(12)}/>
    <path d="M330 420 C 520 300, 760 360, 860 480 S 1080 660, 1180 600" fill="none" stroke="${C.navy}" stroke-width="10" stroke-dasharray="22 20" stroke-linecap="round"/>
    ${ilha(330, 560, 320, C.blue, '', { bandeiraNum: false })}
    ${ilha(800, 760, 300, C.coral, '', { bandeiraNum: false })}
    ${ilha(1110, 470, 280, C.teal, '', { bandeiraNum: false })}
    <path d="M1150 580 l 60 60 m -60 0 l 60 -60" stroke="${C.coralD}" stroke-width="18" stroke-linecap="round"/>`),

  /* timão de madeira (Início e abertura) */
  Volante: () => {
    const cabos = Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45})">
      <rect x="-13" y="-250" width="26" height="90" rx="13" fill="${C.madeira}" ${L()}/>
      <rect x="-9" y="-170" width="18" height="120" fill="${C.madeiraD}" ${L(6)}/></g>`).join('');
    return svg(526, 526, `<g transform="translate(263 263)">${cabos}
      <circle r="170" fill="none" stroke="${C.navy}" stroke-width="56"/>
      <circle r="170" fill="none" stroke="${C.madeira}" stroke-width="40"/>
      <circle r="170" fill="none" stroke="${C.madeiraD}" stroke-width="6" stroke-dasharray="30 26"/>
      <circle r="56" fill="${C.madeira}" ${L()}/><circle r="22" fill="${C.yellow}" ${L(6)}/></g>`);
  },

  /* estrela do placar */
  estrela: () => svg(1098, 1149, `<g transform="translate(549 486)">
    <path d="M0 -410 L 120 -140 L 410 -120 L 190 70 L 260 360 L 0 210 L -260 360 L -190 70 L -410 -120 L -120 -140 Z"
      fill="${C.yellow}" stroke="${C.navy}" stroke-width="34" stroke-linejoin="round"/>
    <path d="M0 -300 L 82 -110 L 290 -95 L 130 40 L 180 250 L 0 145 Z" fill="${C.yellowD}" opacity=".55"/>
    <path d="M-150 -170 Q -110 -230 -40 -260" fill="none" stroke="${C.white}" stroke-width="34" stroke-linecap="round" opacity=".8"/></g>`),

  /* medalha: fita azul e moeda dourada com estrela */
  medalha: () => svg(964, 1244, `<g transform="translate(566 0)">
    <path d="M-300 120 L -120 120 L 40 560 L -140 560 Z" fill="${C.blue}" stroke="${C.navy}" stroke-width="28" stroke-linejoin="round"/>
    <path d="M300 120 L 120 120 L -40 560 L 140 560 Z" fill="${C.blueD}" stroke="${C.navy}" stroke-width="28" stroke-linejoin="round"/>
    <circle cx="0" cy="760" r="270" fill="${C.yellow}" stroke="${C.navy}" stroke-width="30"/>
    <circle cx="0" cy="760" r="200" fill="none" stroke="${C.yellowD}" stroke-width="22"/>
    <path d="M0 620 L 40 720 L 145 725 L 65 790 L 92 895 L 0 838 L -92 895 L -65 790 L -145 725 L -40 720 Z" fill="${C.white}" stroke="${C.navy}" stroke-width="16" stroke-linejoin="round"/>
    <path d="M-180 640 Q -140 560 -60 530" fill="none" stroke="${C.white}" stroke-width="26" stroke-linecap="round" opacity=".75"/></g>`),

  /* piratinha (personagem principal): caixa x 418-1308, y 338-1680 */
  usuario: () => svg(W, H, `<g transform="translate(860 0)">
    <!-- pernas e botas -->
    <rect x="-150" y="1250" width="110" height="300" rx="40" fill="${C.navy}" ${L()}/>
    <rect x="40" y="1250" width="110" height="300" rx="40" fill="${C.navy}" ${L()}/>
    <path d="M-180 1520 H-30 Q -10 1520 -10 1560 V1640 Q -10 1670 -40 1670 H-200 Q -230 1670 -230 1640 Q -230 1520 -180 1520 Z" fill="${C.madeiraD}" ${L()}/>
    <path d="M30 1520 H180 Q 230 1520 230 1640 Q 230 1670 200 1670 H40 Q 10 1670 10 1640 V1560 Q 10 1520 30 1520 Z" fill="${C.madeiraD}" ${L()}/>
    <!-- casaco -->
    <path d="M-250 860 Q -260 800 -190 780 L 190 780 Q 260 800 250 860 L 280 1320 Q 0 1380 -280 1320 Z" fill="${C.blue}" ${L()}/>
    <path d="M-60 780 L 0 900 L 60 780 Z" fill="${C.white}" ${L(6)}/>
    <path d="M0 900 V1330" ${L(6)}/>
    ${[960, 1060, 1160].map(y => `<circle cx="-40" cy="${y}" r="14" fill="${C.yellow}" ${L(5)}/><circle cx="40" cy="${y}" r="14" fill="${C.yellow}" ${L(5)}/>`).join('')}
    <rect x="-262" y="1110" width="524" height="70" rx="16" fill="${C.navy}"/>
    <rect x="-46" y="1102" width="92" height="86" rx="14" fill="${C.yellow}" ${L(7)}/><rect x="-18" y="1128" width="36" height="34" rx="6" fill="${C.navy}"/>
    <!-- braço esquerdo (acenando) e direito -->
    <path d="M-230 840 Q -380 760 -400 600" fill="none" stroke="${C.navy}" stroke-width="118" stroke-linecap="round"/>
    <path d="M-230 840 Q -380 760 -400 600" fill="none" stroke="${C.blue}" stroke-width="100" stroke-linecap="round"/>
    <circle cx="-405" cy="560" r="62" fill="${C.pele}" ${L()}/>
    <ellipse cx="-455" cy="575" rx="22" ry="34" fill="${C.pele}" ${L(7)} transform="rotate(-30 -455 575)"/>
    <path d="M230 840 Q 330 980 300 1150" fill="none" stroke="${C.navy}" stroke-width="118" stroke-linecap="round"/>
    <path d="M230 840 Q 330 980 300 1150" fill="none" stroke="${C.blue}" stroke-width="100" stroke-linecap="round"/>
    <circle cx="300" cy="1190" r="60" fill="${C.pele}" ${L()}/>
    <!-- cabeça -->
    <circle cx="-245" cy="600" r="0"/>
    <ellipse cx="0" cy="610" rx="250" ry="230" fill="${C.pele}" ${L()}/>
    <ellipse cx="-252" cy="630" rx="44" ry="56" fill="${C.pele}" ${L()}/>
    <ellipse cx="252" cy="630" rx="44" ry="56" fill="${C.pele}" ${L()}/>
    <circle cx="-140" cy="690" r="40" fill="${C.coral}" opacity=".45"/><circle cx="150" cy="690" r="40" fill="${C.coral}" opacity=".45"/>
    <!-- tapa-olho e olho -->
    <path d="M-250 560 L -100 600 M-40 572 L 236 456" ${L(14)}/>
    <ellipse cx="-90" cy="610" rx="70" ry="62" fill="${C.navy}"/>
    <ellipse cx="96" cy="610" rx="40" ry="48" fill="${C.white}" ${L(7)}/>
    <circle cx="104" cy="616" r="22" fill="${C.navy}"/><circle cx="112" cy="606" r="8" fill="${C.white}"/>
    <path d="M40 545 Q 96 520 150 548" fill="none" ${L(12)}/>
    <!-- sorriso com dentinho -->
    <path d="M-70 720 Q 10 800 90 715" fill="${C.white}" ${L(10)}/>
    <!-- cabelo -->
    <path d="M-250 520 Q -270 600 -230 640 Q -210 580 -190 560 Q -200 610 -170 600 Q -180 540 -150 520 Z M250 520 Q 270 600 230 640 Q 210 580 190 560 Q 200 610 170 600 Q 180 540 150 520 Z" fill="${C.madeiraD}" ${L(7)}/>
    <!-- chapéu -->
    <path d="M-320 470 Q -300 330 -150 300 Q 0 200 150 300 Q 300 330 320 470 Q 0 410 -320 470 Z" fill="${C.navy}" ${L()}/>
    <path d="M-340 480 Q 0 400 340 480 Q 360 520 320 530 Q 0 460 -320 530 Q -360 520 -340 480 Z" fill="${C.coral}" ${L()}/>
    <circle cx="0" cy="360" r="38" fill="${C.white}"/>
    <rect x="-18" y="380" width="36" height="22" rx="6" fill="${C.white}"/>
    <circle cx="-13" cy="356" r="8" fill="${C.navy}"/><circle cx="13" cy="356" r="8" fill="${C.navy}"/>
    <path d="M-60 420 L 60 440 M60 420 L -60 440" stroke="${C.white}" stroke-width="12" stroke-linecap="round"/>
  </g>`)
};

/* ---------------- gravação ---------------- */
const pedidas = process.argv.slice(2);
const nomes = pedidas.length ? pedidas : Object.keys(ARTES);
const TRANSPARENTES = new Set(['ilha1', 'ilha2', 'ilha3', 'Mapa_Home', 'Volante', 'estrela', 'medalha', 'usuario']);

let pw;
try { pw = await import(process.env.PLAYWRIGHT || 'playwright'); }
catch { console.error('Falta o Playwright. Rode: npm install --no-save playwright'); process.exit(1); }
const navegador = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const pagina = await navegador.newPage();
fs.mkdirSync(path.join(raiz, 'arte'), { recursive: true });

for (const nome of nomes) {
  if (!ARTES[nome]) { console.log(`  (não existe a arte "${nome}")`); continue; }
  const codigo = ARTES[nome]();
  fs.writeFileSync(path.join(raiz, 'arte', `${nome}.svg`), codigo + '\n');
  const [, w, h] = codigo.match(/width="(\d+)" height="(\d+)"/);
  await pagina.setViewportSize({ width: +w, height: +h });
  await pagina.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${codigo}</body></html>`);
  await pagina.screenshot({ path: path.join(process.env.SAIDA || path.join(raiz, 'img'), `${nome}.png`), omitBackground: TRANSPARENTES.has(nome), clip: { x: 0, y: 0, width: +w, height: +h } });
  console.log(`  img/${nome}.png  (${w} × ${h})`);
}
await navegador.close();
console.log('Pronto. Os desenhos editáveis estão em arte/.');
