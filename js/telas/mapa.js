/* ============================================================
   NavegaKids · telas/mapa.js
   Mapa da ilha: card da fase atual, barra de 1 a 5 e os cards das cinco fases ligados por um caminho.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, progresso, $, $$, esc, go, I, toast, montar } = NK;
  const { ilhaById, fasesDaIlha, faseCompleta, faseLiberada, ilhaCompleta, estrelasTotal } = progresso;
  const { CADEADO_FILL, ICONE_DUPLO } = NK.comum;

  function telaMapaFase(iid) {
    /* Mapa interno da ilha: geometria medida no print do Figma da Ilha 1
       (frame 1728 px de largura, coordenadas em px do Figma − 182 da navbar).
       A mesma composição serve às 3 ilhas; os dados vêm de data.js. */
    const il = ilhaById(+iid) || ILHAS[0];
    const fs = fasesDaIlha(il.id);
    const atual = fs.find(f => faseLiberada(f.id) && !faseCompleta(f.id)) || fs[fs.length - 1];
    const ilhaFeita = ilhaCompleta(il.id);
    const jogoVencido = ilhaFeita && il.id === ILHAS.at(-1).id; // última ilha concluída: card de parabéns

    // centro (x, y) de cada card de fase: todos na região de areia, retos (sem inclinação)
    const NOS = [
      { x: 203, y: 1138, ang: 0, n: { x: 141, y: 1020 } },
      { x: 419, y: 1717, ang: 0, n: { x: 370, y: 1602 } },
      { x: 840, y: 1395, ang: 0, n: { x: 721, y: 1456 } },
      { x: 1387, y: 1721, ang: 0, n: { x: 1328, y: 1596 } },
      { x: 1513, y: 1118, ang: 0, n: { x: 1567, y: 1239 } }
    ];
    // caminho: liga o centro de cada card ao do seguinte (as linhas passam por baixo dos cards)
    const LINHAS = NOS.slice(0, -1).map((p, i) => [p.x, p.y, NOS[i + 1].x, NOS[i + 1].y]);
    // decorações do Figma por ilha: [asset, left, top, tamanho, rotação]
    const DECOR_POR_ILHA = {
      1: [
        ['atencao', 229, 1011, 42, 0],
        ['interrogacao', 304, 987, 156, 0],
        ['interrogacao2', 435, 1400, 176, 0],
        ['critico', 575, 1290, 126, 0],
        ['exclamacao3', 985, 1268, 156, -12],
        ['bubbleChat', 1373, 1417, 142, 0]
      ],
      // Ilha 2: export do Figma "ilha-2" (coordenadas do card-fases + 3, + 883)
      2: [
        ['nao', 117, 1252, 188, 0],
        ['corre', 540, 1110, 194, 0],
        ['escudo', 990, 1233, 168, 0],
        ['bloqueado', 45, 1752, 246, 0]
      ],
      // Ilha 3: export do Figma "ilha-3" (coordenadas do card-fases, + 883 no y)
      3: [
        ['policial', -10, 1238, 229, 0],
        ['alerta', 540, 1085, 189, 0],
        ['pare', 990, 1231, 191, 0],
        ['diamond', 1091, 1712, 187, 0],
        ['apoio', 133, 1774, 150, 0],
        ['mapaTesouro', 1579, 1242, 130, 0]
      ]
    };
    const DECOR = DECOR_POR_ILHA[il.id] || DECOR_POR_ILHA[1];
    const U = v => `calc(${v} * var(--u))`;

    const linhas = `<svg class="mf-linhas" viewBox="0 0 1728 2034" preserveAspectRatio="none" aria-hidden="true">
      ${LINHAS.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('')}</svg>`;
    const decor = DECOR.map(([k, l, t, sz, r], i) =>
      I(k, { cls: k === 'atencao' ? 'mf-decor mf-decor-topo' : 'mf-decor', alt: '' }).replace(
        '<img ',
        `<img style="--i:${i};left:${U(l)};top:${U(t)};width:${U(sz)};height:${U(sz)};${r ? `transform:rotate(${r}deg);` : ''}" `
      )
    ).join('');

    const nos = fs
      .map((f, i) => {
        const p = NOS[i] || NOS[NOS.length - 1];
        const lib = faseLiberada(f.id),
          comp = faseCompleta(f.id);
        const conteudo = !lib
          ? `<span class="mf-cad">${CADEADO_FILL}</span>`
          : (ICONE_DUPLO[f.id]
              ? `${I(ICONE_DUPLO[f.id][0], { cls: 'mf-ic-m' })}${I(ICONE_DUPLO[f.id][1], { cls: 'mf-ic-a' })}` // composição do Figma / roteiro
              : I(f.icone, { cls: f.titulo.length > 24 ? 'mf-ic mf-ic-menor' : 'mf-ic' })) +
            `<span class="mf-tit">${esc(f.titulo)}</span>`; // título longo (3 linhas): ícone menor
        return `
      <span class="mf-num" style="--i:${i};left:${U(p.x - 117)};top:${U(p.y - 117)}" aria-hidden="true">${i + 1}</span>
      <button class="mf-no ${comp ? 'feita' : ''} ${!lib ? 'trancada' : ''} ${f.id === atual.id && !comp ? 'atual' : ''}"
        style="--i:${i};left:${U(p.x)};top:${U(p.y)};--ang:${p.ang}deg" data-f="${f.id}" ${lib ? '' : 'aria-disabled="true"'}
        aria-label="Fase ${i + 1}: ${esc(f.titulo)}${f.dobro ? ' · estrelas em dobro' : ''}${comp ? ' · concluída' : lib ? '' : ' · bloqueada'}">
        ${conteudo}
        ${comp ? I('correto', { cls: 'mf-ok' }) : ''}
        ${f.dobro ? `${I('estrela', { cls: 'mf-dobro' })}<b class="mf-x2" aria-hidden="true">x2</b>` : ''}
      </button>`;
      })
      .join('');

    const PASSOS_X = [500.7, 638.7, 775.5, 896, 1001.4];
    const stepper =
      `<i class="mf-trilho"></i>` +
      fs
        .map((f, i) => {
          const on = faseCompleta(f.id) || f.id === atual.id;
          return `<b class="mf-pnum ${on ? 'on' : ''}" style="left:${U(PASSOS_X[i])}">${i + 1}</b>
              <i class="mf-passo ${on ? 'on' : ''} ${f.id === atual.id && !faseCompleta(f.id) ? 'agora' : ''}" style="left:${U(PASSOS_X[i])}"></i>`;
        })
        .join('');

    montar(
      `
    <div class="scene ilha-mapa">
      <div class="mapa-frame ilha${il.id}" id="mapaVertical">
        ${I('fundoFases', { cls: 'mf-fundo2', alt: '' })}
        ${I('fundoFases', { cls: 'mf-fundo', alt: '' })}
        <div class="mf-card">
          ${I('navioPirata', { cls: 'mf-navio', alt: '' })}
          <h2 class="mf-titulo">${esc(il.nome.toUpperCase())}</h2>
          ${
            jogoVencido
              ? `<p class="mf-parabens">Parabéns, Pirata! Você venceu o Grande Desafio!</p>
          <button class="mf-prosseguir mf-tesouro" id="btProsseguir">Descubra<br>seu tesouro</button>`
              : `<p class="mf-label">FASE ATUAL:</p>
          <p class="mf-fase">${esc(atual.titulo)}</p>
          <button class="mf-prosseguir" id="btProsseguir">${ilhaFeita ? 'Voltar às Ilhas' : 'Prosseguir'}</button>`
          }
          <span class="mf-estrela" aria-label="Estrelas: ${estrelasTotal()}">${I('estrela')}<b>${estrelasTotal()}</b></span>
          ${stepper}
        </div>
        ${linhas}
        ${decor}
        ${nos}
      </div>
    </div>`,
      'ilhas'
    );
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);

    const abrir = fid => {
      progresso.definirFaseVista(fid);
      go(progresso.introVista(fid) ? `#/missoes` : `#/abertura/${fid}`);
    };
    $('#btProsseguir').onclick = () =>
      jogoVencido ? go('#/certificado') : ilhaFeita ? go('#/ilhas') : abrir(atual.id);
    $$('[data-f]', $('#stage')).forEach(
      b =>
        (b.onclick = () => {
          const fid = +b.dataset.f;
          if (!faseLiberada(fid)) {
            b.classList.remove('nega');
            void b.offsetWidth;
            b.classList.add('nega'); // reinicia a animação
            toast('Complete a fase anterior para desbloquear esta.');
            return;
          }
          abrir(fid);
        })
    );
  }

  NK.telas = Object.assign(NK.telas || {}, { fase: telaMapaFase });
})();
