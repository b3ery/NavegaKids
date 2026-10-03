/* ============================================================
   NavegaKids — router.js
   Todas as telas, exceto a tela de atividade (fica em activities.js)
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, FASES, progresso, $, $$, esc, go, later, I, popup, toast, montar, clearTimers, fecharPopups, cadeadoIcon, telaAtividade } = NK;
  const {
    DEV, faseById, ilhaById, fasesDaIlha, feita, nFeitas, faseCompleta, faseLiberada,
    ilhaCompleta, ilhaLiberada, faseAtual, jornadaCompleta, estrelasTotal
  } = progresso;

  window.addEventListener('hashchange', renderRota);
  window.addEventListener('DOMContentLoaded', () => {
    // simulação sem progresso persistente: ao recarregar, o estado volta ao zero;
    // rotas que dependem de progresso voltam para a Home (recomeça pela Ilha 1)
    const rota = location.hash.replace('#/', '').split('/')[0];
    if (!['home', 'ilhas', 'diario'].includes(rota)) { history.replaceState(null, '', '#/home'); }
    renderRota();
  });

  function renderRota() {
    clearTimers();
    fecharPopups();
    const h = location.hash.replace('#/', '') || 'home';
    const [rota, ...resto] = h.split('/');
    const p = resto.join('/');
    try {
      ({
        home: telaHome,
        ilhas: telaIlhas,
        carregando: () => telaCarregando(p),
        fase: () => telaMapaFase(p),
        missoes: telaMissoes,
        abertura: () => telaAbertura(p),
        atividade: () => telaAtividade(p),
        conclusao: () => telaConclusao(p),
        diario: telaDiario,
        certificado: telaCertificado
      }[rota] || telaHome)();
    } catch (e) {
      console.error(e);
      telaHome();
    }
  }

  /* ============================================================
     HOME
     ============================================================ */
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
  /* ícones compostos no mapa da ilha (roteiro): Fase 1 "lupa + silhueta de perfil", Fase 5 "lupa + estrela" */
  const ICONE_DUPLO = { 1: ['misterio', 'anonimo'], 5: ['misterio', 'estrela'] };

  // centro de cada ilha no desenho do Mapa_Home (px do frame) — brilhos/estrelas por cima
  const HOME_ILHAS = [[1296, 548], [1540, 668], [1300, 768]];

  function telaHome() {
    const nome = progresso.nome();
    const comecou = progresso.pontosTotal() > 0;
    const proxIlha = ILHAS.find(il => ilhaLiberada(il.id) && !ilhaCompleta(il.id));
    const status = !comecou ? ''
      : jornadaCompleta() ? `${I('conquistas', { cls: 'ico-txt' })} Jornada completa! Você é um Guardião dos Mares.`
      : `${I('estrela', { cls: 'ico-txt' })} ${estrelasTotal()} estrelas · Próxima parada: ${esc(proxIlha.nome)}`;
    const brilhos = ILHAS.map((il, i) => {
      const [x, y] = HOME_ILHAS[i];
      return ilhaCompleta(il.id)
        ? I('estrela', { cls: 'hm-ilha-estrela', alt: '' }).replace('<img ', `<img style="--i:${i};left:calc(${x - 40} * var(--u));top:calc(${y - 150} * var(--u))" `)
        : `<span class="hm-brilho" style="--i:${i};left:calc(${x + 50} * var(--u));top:calc(${y - 120} * var(--u))" aria-hidden="true"></span>`;
    }).join('');

    /* Composição da Home reconstruída sobre o frame do Figma (1728 × 1683 px,
       navbar de 182 px incluída). Cada camada usa o PNG atual de /img com o
       canvas transparente preservado; posições/escala em unidades do frame
       (ver .home-frame no CSS). */
    montar(`
    <div class="scene home">
      <div class="home-frame">
        ${I('fundoHome', { cls: 'hm-fundo', alt: '' })}
        ${I('mapaHome', { cls: 'hm-mapa', alt: 'Mapa do tesouro com as três ilhas' })}
        ${I('barco', { cls: 'hm-barco', alt: '' })}
        ${I('usuario', { cls: 'hm-pirata', alt: 'Pequeno pirata, personagem principal do NavegaKids' })}
        ${I('volante', { cls: 'hm-volante', alt: '' })}
        ${I('barco', { cls: 'hm-barco2', alt: '' })}
        <button class="hm-mapa-link" id="hmMapa" aria-label="Ver as ilhas no mapa"></button>
        ${brilhos}
        <div class="hm-balao">
          <h1>Olá, ${esc(nome || 'Navegador')}!</h1>
          <p>${comecou ? 'Bora continuar a aventura? Ainda tem estrela escondida por aí!' : 'Explore as ilhas e encontre as estrelas!'}</p>
          ${status ? `<p class="hm-status">${status}</p>` : ''}
        </div>
        <button class="btn-figma hm-navegar" id="btNavegar">${comecou ? 'Continuar!' : 'Navegar!'}</button>
        ${FILTRO_ASPERO}
      </div>
    </div>`, 'home');
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);
    const navegar = () => (progresso.nome() ? go('#/ilhas') : pedirNome(() => go('#/ilhas')));
    $('#btNavegar').onclick = navegar;
    $('#hmMapa').onclick = navegar;
  }

  /* PopUP-Usuario do Figma: pede o nome (ou apelido) do navegador e o modo por idade
     (Marujo, 8 anos · Capitão, 9 e 10 anos — relato de testes).
     Fica só na memória da sessão, como o resto do progresso. */
  function pedirNome(depois) {
    const modoAtual = progresso.modo();
    const cartao = m => `<label class="modo-op">
        <input type="radio" name="modo" value="${m.id}" ${m.id === modoAtual ? 'checked' : ''}>
        <span class="modo-card modo-${m.id}">
          ${I(m.id === 'marujo' ? 'usuario' : 'pirata', { cls: 'modo-ico' })}
          <b>${m.nome}</b><small>${m.idade}</small>
          <em>${m.id === 'marujo' ? 'Mais tempo para responder e dicas guardadas no botão' : 'Desafio com tempo de 15 segundos'}</em>
        </span>
      </label>`;
    const w = popup({
      cor: 'b', titulo: 'Qual é o seu nome de navegador?',
      extra: `<label class="campo-nome"><span>Pode ser um apelido!</span>
        <input id="inNome" type="text" maxlength="20" autocomplete="off"
          value="${esc(progresso.nome())}" placeholder="Ex.: Pirata Corajoso"></label>
        <fieldset class="campo-modo"><legend>Como você quer navegar?</legend>
          <div class="modo-ops">${Object.values(progresso.MODOS).map(cartao).join('')}</div>
        </fieldset>`,
      btns: [
        { t: 'Agora não', cls: 'btn-ghost', fn: () => depois?.() },
        { t: 'Confirmar', cls: 'btn-t', fn: janela => {
          progresso.definirNome($('#inNome', janela).value);
          progresso.definirModo($('input[name="modo"]:checked', janela)?.value);
          depois?.();
        } }
      ]
    });
    const campo = $('#inNome', w);
    campo.focus();
    campo.onkeydown = e => { if (e.key === 'Enter') $('[data-b="1"]', w).click(); };
  }

  /* ============================================================
     ILHAS
     ============================================================ */
  function telaIlhas() {
    /* Frame de Ilhas do Figma/Locofy (1728 × 1117). Fundo_Ilhas + ilha1/2/3 com
       canvas inteiro; ilha liberada recebe “Explorar” (ou “Revisitar” se já
       concluída), ilha bloqueada recebe o cadeado grande. */
    const camadas = ILHAS.map(il => I(il.img, { cls: `il-ilha il-ilha${il.id}`, alt: il.nome })).join('');
    const controles = ILHAS.map(il => {
      const liberada = ilhaLiberada(il.id);
      const completa = ilhaCompleta(il.id);
      return liberada
        ? `<button class="btn-figma il-explorar il-explorar${il.id}" data-il="${il.id}"
            aria-label="${esc(il.nome)}${completa ? ' — concluída' : ''}">${completa ? 'Revisitar' : 'Explorar'}</button>`
        : `<button class="il-lock il-lock${il.id}" disabled aria-label="${esc(il.nome)} — bloqueada">${CADEADO_FILL}</button>`;
    }).join('');

    montar(`
    <div class="scene ilhas">
      <div class="ilhas-frame" id="mapaIlhas">
        ${I('fundoIlhas', { cls: 'il-fundo', alt: '' })}
        ${camadas}
        ${controles}
        ${FILTRO_ASPERO}
      </div>
    </div>`, 'ilhas');
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);
    $$('[data-il]').forEach(b => b.onclick = () => {
      const id = +b.dataset.il;
      if (!ilhaLiberada(id)) return;
      go(`#/carregando/${id}`);
    });
  }

  /* ============================================================
     CARREGAMENTO
     ============================================================ */
  function telaCarregando(iid) {
    const il = ilhaById(+iid) || ILHAS[0];
    montar(`
    <div class="scene carregando">
      <div class="carregando-img">
        ${I('fundoCarregando', { cls: 'fundo-full', alt: 'Navegando pelo mar' })}
        <div class="txt">${esc(il.carregando)}
          <div class="barra"><i></i></div>
        </div>
      </div>
    </div>`, 'ilhas');
    later(() => { go(`#/fase/${il.id}`); }, 2200);
  }

  /* ============================================================
     MAPA DE FASES DA ILHA
     ============================================================ */
  function telaMapaFase(iid) {
    /* Mapa interno da ilha — geometria medida no print do Figma da Ilha 1
       (frame 1728 px de largura, coordenadas em px do Figma − 182 da navbar).
       A mesma composição serve às 3 ilhas; os dados vêm de data.js. */
    const il = ilhaById(+iid) || ILHAS[0];
    const fs = fasesDaIlha(il.id);
    const atual = fs.find(f => faseLiberada(f.id) && !faseCompleta(f.id)) || fs[fs.length - 1];
    const ilhaFeita = ilhaCompleta(il.id);
    const jogoVencido = ilhaFeita && il.id === ILHAS.at(-1).id;   // última ilha concluída: card de parabéns

    // centro (x, y) e rotação de cada card de fase — todos na região de areia
    const NOS = [
      { x: 203,  y: 1138, ang: -21.3, n: { x: 141,  y: 1020 } },
      { x: 419,  y: 1717, ang: -20.6, n: { x: 370,  y: 1602 } },
      { x: 840,  y: 1395, ang: -21.6, n: { x: 721,  y: 1456 } },
      { x: 1387, y: 1721, ang: -21.3, n: { x: 1328, y: 1596 } },
      { x: 1513, y: 1118, ang: -21.0, n: { x: 1567, y: 1239 } },
    ];
    // linhas do caminho (px do frame)
    const LINHAS = [
      [238, 1251, 355, 1584], [525, 1657, 712, 1473], [1027, 1397, 1320, 1584], [1501, 1654, 1571, 1263],
    ];
    // decorações do Figma por ilha: [asset, left, top, tamanho, rotação]
    const DECOR_POR_ILHA = {
      1: [
        ['atencao',       229, 1011,  42,   0],
        ['interrogacao',  304,  987, 156,   0],
        ['interrogacao2', 435, 1400, 176,   0],
        ['critico',       634, 1278, 126,   0],
        ['exclamacao3',   939, 1268, 156, -12],
        ['bubbleChat',   1373, 1417, 142,   0],
      ],
      // Ilha 2 — export do Figma "ilha-2" (coordenadas do card-fases + 3, + 883)
      2: [
        ['nao',        117, 1252, 188, 0],
        ['corre',      658, 1135, 194, 0],
        ['escudo',     918, 1233, 168, 0],
        ['bloqueado',   45, 1752, 246, 0],
      ],
      // Ilha 3 — export do Figma "ilha-3" (coordenadas do card-fases, + 883 no y)
      3: [
        ['policial',    -10, 1238, 229, 0],
        ['alerta',      661, 1115, 189, 0],
        ['pare',        944, 1231, 191, 0],
        ['diamond',    1091, 1712, 187, 0],
        ['apoio',       133, 1774, 150, 0],
        ['mapaTesouro',1579, 1242, 130, 0],
      ],
    };
    const DECOR = DECOR_POR_ILHA[il.id] || DECOR_POR_ILHA[1];
    const U = v => `calc(${v} * var(--u))`;

    const linhas = `<svg class="mf-linhas" viewBox="0 0 1728 2034" preserveAspectRatio="none" aria-hidden="true">
      ${LINHAS.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('')}</svg>`;
    const decor = DECOR.map(([k, l, t, sz, r], i) =>
      I(k, { cls: k === 'atencao' ? 'mf-decor mf-decor-topo' : 'mf-decor', alt: '' }).replace('<img ', `<img style="--i:${i};left:${U(l)};top:${U(t)};width:${U(sz)};height:${U(sz)};${r ? `transform:rotate(${r}deg);` : ''}" `)).join('');

    const nos = fs.map((f, i) => {
      const p = NOS[i] || NOS[NOS.length - 1];
      const lib = faseLiberada(f.id), comp = faseCompleta(f.id);
      const conteudo = !lib
        ? `<span class="mf-cad">${CADEADO_FILL}</span>`
        : (ICONE_DUPLO[f.id]
            ? `${I(ICONE_DUPLO[f.id][0], { cls: 'mf-ic-m' })}${I(ICONE_DUPLO[f.id][1], { cls: 'mf-ic-a' })}`   // composição do Figma / roteiro
            : I(f.icone, { cls: f.titulo.length > 24 ? 'mf-ic mf-ic-menor' : 'mf-ic' })) + `<span class="mf-tit">${esc(f.titulo)}</span>`;   // título longo (3 linhas): ícone menor
      return `
      <span class="mf-num" style="--i:${i};left:${U(p.n.x)};top:${U(p.n.y)}" aria-hidden="true">${i + 1}</span>
      <button class="mf-no ${comp ? 'feita' : ''} ${!lib ? 'trancada' : ''} ${f.id === atual.id && !comp ? 'atual' : ''}"
        style="--i:${i};left:${U(p.x)};top:${U(p.y)};--ang:${p.ang}deg" data-f="${f.id}" ${lib ? '' : 'aria-disabled="true"'}
        aria-label="Fase ${i + 1}: ${esc(f.titulo)}${f.dobro ? ' — estrelas em dobro' : ''}${comp ? ' — concluída' : lib ? '' : ' — bloqueada'}">
        ${conteudo}
        ${comp ? I('correto', { cls: 'mf-ok' }) : ''}
        ${f.dobro ? `${I('estrela', { cls: 'mf-dobro' })}<b class="mf-x2" aria-hidden="true">x2</b>` : ''}
      </button>`;
    }).join('');

    const PASSOS_X = [500.7, 638.7, 775.5, 896, 1001.4];
    const stepper = `<i class="mf-trilho"></i>` + fs.map((f, i) => {
      const on = faseCompleta(f.id) || f.id === atual.id;
      return `<b class="mf-pnum ${on ? 'on' : ''}" style="left:${U(PASSOS_X[i])}">${i + 1}</b>
              <i class="mf-passo ${on ? 'on' : ''} ${f.id === atual.id && !faseCompleta(f.id) ? 'agora' : ''}" style="left:${U(PASSOS_X[i])}"></i>`;
    }).join('');

    montar(`
    <div class="scene ilha-mapa">
      <div class="mapa-frame ilha${il.id}" id="mapaVertical">
        ${I('fundoFases', { cls: 'mf-fundo2', alt: '' })}
        ${I('fundoFases', { cls: 'mf-fundo', alt: '' })}
        <div class="mf-card">
          ${I('navioPirata', { cls: 'mf-navio', alt: '' })}
          <h2 class="mf-titulo">${esc(il.nome.toUpperCase())}</h2>
          ${jogoVencido
            ? `<p class="mf-parabens">Parabéns, Pirata! Você venceu o Grande Desafio!</p>
          <button class="mf-prosseguir mf-tesouro" id="btProsseguir">Descubra<br>seu tesouro</button>`
            : `<p class="mf-label">FASE ATUAL:</p>
          <p class="mf-fase">${esc(atual.titulo)}</p>
          <button class="mf-prosseguir" id="btProsseguir">${ilhaFeita ? 'Voltar às Ilhas' : 'Prosseguir'}</button>`}
          <span class="mf-estrela" aria-label="Estrelas: ${estrelasTotal()}">${I('estrela')}<b>${estrelasTotal()}</b></span>
          ${stepper}
        </div>
        ${linhas}
        ${decor}
        ${nos}
      </div>
    </div>`, 'ilhas');
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);

    const abrir = fid => { progresso.definirFaseVista(fid); go(progresso.introVista(fid) ? `#/missoes` : `#/abertura/${fid}`); };
    $('#btProsseguir').onclick = () => jogoVencido ? go('#/certificado') : ilhaFeita ? go('#/ilhas') : abrir(atual.id);
    $$('[data-f]', $('#stage')).forEach(b => b.onclick = () => {
      const fid = +b.dataset.f;
      if (!faseLiberada(fid)) {
        b.classList.remove('nega'); void b.offsetWidth; b.classList.add('nega');   // reinicia a animação
        toast('Complete a fase anterior para desbloquear esta.');
        return;
      }
      abrir(fid);
    });
  }

  /* ============================================================
     ABERTURA DE FASE (introdução)
     ============================================================ */
  function telaAbertura(fid) {
    /* Template de introdução — obrigatório antes das atividades de TODA fase.
       Composição fixa do Figma; título, ícone, texto e botão vêm da fase. */
    const f = faseById(+fid);
    if (!f) return go('#/ilhas');
    if (!faseLiberada(f.id)) return go(`#/fase/${f.ilha}`);
    progresso.definirFaseVista(f.id);
    montar(`
    <div class="scene abertura">
      <div class="intro-frame">
        ${I('fundo', { cls: 'it-fundo', alt: '' })}
        ${I('barco', { cls: 'it-barco2', alt: '' })}
        ${I('barco', { cls: 'it-barco', alt: '' })}
        ${I('usuario', { cls: 'it-pirata', alt: 'Pirata explicando a missão' })}
        ${I('volante', { cls: 'it-volante', alt: '' })}
        ${I('interrogacao', { cls: 'it-interrog', alt: '' })}
        ${I(iconeFase(f), { cls: 'it-icone', alt: '' })}
        <h1 class="it-titulo">${esc(f.titulo)}</h1>
        ${f.dobro ? `<div class="it-dobro">${NK.seloDobro('Nesta missão as estrelas e os pontos valem em dobro!')}</div>` : ''}
        <p class="it-texto">${esc(f.abertura.texto)}</p>
        ${NK.botaoOuvir('', { texto: f.titulo + '. ' + f.abertura.texto, cls: 'it-ouvir' })}
        <button class="btn-figma it-comecar" id="btComecar">${esc(f.abertura.btn)}</button>
        ${FILTRO_ASPERO}
      </div>
    </div>`, 'ilhas');
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);
    $('#btComecar').onclick = () => { progresso.marcarIntroVista(f.id); go('#/missoes'); };
  }

  /* ============================================================
     MISSÕES (árvore da fase + detalhe)
     ============================================================ */
  function telaMissoes() {
    // mostra a fase que está sendo jogada (para exibir 100% e “Próxima fase”
    // ao concluir), senão a fase atual da progressão
    const vista = progresso.faseVista();
    const f = (vista && faseLiberada(vista)) ? faseById(vista) : faseAtual();
    renderMissoesFase(f.id);
  }

  /* Relato de testes (profa. Camila): cada quadrado de atividade com uma cor forte e
     um ícone do tipo de atividade, para a tela ficar com mais cara de jogo infantil. */
  const CORES_PASSO = ['#4EA8DE', '#FF7A59', '#2EC4B6'];
  const ICONE_TIPO = {
    discover: 'luneta', explain: 'luneta', choice: 'interrogacao', classify: 'bau', hunt: 'luneta',
    quiz: 'cronometro', sequence: 'mapaTesouro', compose: 'comunicacao', doors: 'misterio',
    match: 'pedidoAmizade', bau: 'bau', block: 'escudo'
  };

  function renderMissoesFase(fid) {
    const f = faseById(fid);
    const total = f.atividades.length;
    const done = nFeitas(fid);
    const pct = Math.round((done / total) * 100);

    const passos = f.atividades.map((a, i) => {
      const ft = feita(fid, i);
      const lib = i === 0 || feita(fid, i - 1);
      // trilha em zigue-zague ocupando a página toda: 1 em cima, 2 embaixo, 3 em cima
      const posArv = [
        { left: '4%', top: '6%' },
        { left: 'calc(50% - 62px)', top: '54%' },
        { left: 'calc(92% - 124px)', top: '6%' },   // longe da fita amarela do centro do painel
      ][i] || { left: '4%', top: '6%' };
      return `<button class="passo ${ft ? 'feita' : ''} ${!lib ? 'trancada' : ''}" data-i="${i}" ${lib ? '' : 'disabled'}
        style="left:${posArv.left};top:${posArv.top};--cor:${CORES_PASSO[i % CORES_PASSO.length]}">
        <span class="passo-num">${i + 1}</span>
        ${I(ICONE_TIPO[a.tipo] || 'estrela', { cls: 'passo-ico' })}
        <span>${esc(a.titulo)}</span>
        ${lib ? (ft ? `<span class="n ok">${I('correto', { cls: 'ico-txt' })}</span>` : '<span class="n go">Começar</span>') : `<span class="cad">${cadeadoIcon({ size: 20 })}</span>`}
      </button>`;
    }).join('');
    const linhaArv = 'M 18 26 L 50 74 L 80 26';

    montar(`
    <div class="scene missoes">
      <h1>Missões</h1>
      <div class="sub">${I(f.icone, { size: 30 })}<span>${esc(f.titulo)}</span></div>
      <div class="painel-missao">
        <span class="fita" aria-hidden="true"></span>
        <div class="in">
          <div class="arvore">
            <svg class="arvore-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${linhaArv}"></path></svg>
            ${passos}
          </div>
          <div class="detalhe">
            <div class="fase-atual">${I('medalha', { size: 56 })}<div><b>FASE ATUAL</b><small>${esc(f.titulo)}</small></div></div>
            ${f.dobro ? NK.seloDobro('Estrelas e pontos em dobro nesta missão!') : ''}
            <p id="txtMissao">${esc(f.missao || f.abertura.texto)}</p>
            ${NK.botaoOuvir('#txtMissao', { cls: 'ouvir-missao' })}
            <div class="progresso">
              <span>Seu progresso</span>
              <div class="trilho"><i style="width:${pct}%"></i></div>
              <em>${pct}%</em>
            </div>
          </div>
        </div>
      </div>
      <div class="baixo">
        <button class="btn btn-ghost" id="btIlhas">← Voltar para Ilhas</button>
        ${done === total ? `<button class="btn btn-t" id="btAvancarFase">Próxima fase →</button>` : ''}
      </div>
    </div>`, 'missoes');

    $('#btIlhas').onclick = () => go('#/ilhas');
    // sem ter passado pela introdução, “Começar” leva primeiro à introdução da fase
    $$('[data-i]', $('.arvore')).forEach(b => b.onclick = () => go(progresso.introVista(fid) || DEV ? `#/atividade/${fid}/${b.dataset.i}` : `#/abertura/${fid}`));
    const av = $('#btAvancarFase');
    if (av) av.onclick = () => aposFase(fid);
  }

  function aposFase(fid) {
    const f = faseById(fid);
    const ultimaDaIlha = fasesDaIlha(f.ilha).slice(-1)[0].id === fid;
    if (ultimaDaIlha) go(`#/conclusao/${f.ilha}`);
    else {
      const proxima = fasesDaIlha(f.ilha).find(x => x.id > fid);
      go(`#/abertura/${proxima.id}`);
    }
  }

  /* ============================================================
     CONCLUSÃO DE ILHA
     ============================================================ */
  /* confetes coloridos caindo (posição, cor, atraso e duração variados) */
  function confetes(n) {
    const cores = ['#FFC83B', '#2ec4b0', '#ff7a59', '#4EA8DE', '#ffffff'];
    return Array.from({ length: n }, (_, i) => {
      const esq = (i * 37) % 100, cor = cores[i % cores.length];
      const dur = 3 + (i % 5) * .6, atraso = -((i * 0.73) % dur), dx = ((i % 7) - 3) * 18;
      return `<i style="left:${esq}%;background:${cor};animation-duration:${dur}s;animation-delay:${atraso.toFixed(2)}s;--dx:${dx}px"></i>`;
    }).join('');
  }

  function telaConclusao(iid) {
    const il = ilhaById(+iid);
    const ultimaIlha = il.id === ILHAS.at(-1).id;
    montar(`
    <div class="scene conclusao" data-bg="fundo">
      <div class="confetes" aria-hidden="true">${confetes(28)}</div>
      <div class="cx">
        <span class="selo">${I('conquistas', { size: 70 })}</span>
        <p>${esc(il.conclusao)}</p>
        ${il.conclusaoExtra ? `<p class="extra">${esc(il.conclusaoExtra)}</p>` : ''}
        <span class="selo-tag">${esc(il.selo)}</span>
        <div class="btns">
          <button class="btn btn-t" id="btProx">${esc(il.conclusaoBtn)}</button>
          ${ultimaIlha ? '<button class="btn btn-ghost" id="btDiario2">Ver o Diário do Capitão</button>' : ''}
        </div>
      </div>
    </div>`, 'ilhas');
    // última ilha: o botão principal leva ao certificado (roteiro: "Imprimir meu certificado")
    $('#btProx').onclick = () => go(ultimaIlha ? '#/certificado' : '#/ilhas');
    const bd = $('#btDiario2'); if (bd) bd.onclick = () => go('#/diario');   // roteiro: só na conclusão da jornada
  }

  /* ============================================================
     DIÁRIO DO CAPITÃO
     ============================================================ */
  /* bandeirinha numerada na cor da ilha, igual às do mapa de Ilhas */
  const bandeira = il => `<svg viewBox="0 0 60 70" aria-hidden="true" focusable="false">
    <rect x="4" y="6" width="5" height="62" rx="2.5" fill="#E2A92E"/><circle cx="6.5" cy="6" r="4.5" fill="#F6C945"/>
    <path d="M9 9 H56 L46 24 L56 39 H9 Z" fill="${il.cor}" stroke="#1E293B" stroke-width="2" stroke-linejoin="round"/>
    <text x="29" y="32" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" font-family="inherit">${il.id}</text></svg>`;

  /* "Minhas Conquistas": resumo geral + cada ilha (cor, selo e estrelas por fase).
     Com `foco`, mostra só a ilha escolhida. */
  function popupConquistas(foco) {
    const estrelasMax = progresso.estrelasMax();
    const estrelas = estrelasTotal();
    const selos = progresso.selos();
    const jornada = jornadaCompleta();
    const resumo = foco ? '' : `<div class="cq-resumo">
      <div>${I('estrela', { cls: 'ico-txt' })}<b>${estrelas}/${estrelasMax}</b><small>estrelas</small></div>
      <div>${I('moedas', { cls: 'ico-txt' })}<b>${progresso.pontosTotal()}</b><small>pontos</small></div>
      <div>${I('mapaTesouro', { cls: 'ico-txt' })}<b>${progresso.fasesConcluidas()}/${FASES.length}</b><small>fases</small></div>
      <div>${I('medalha', { cls: 'ico-txt' })}<b>${selos.length}/${ILHAS.length}</b><small>selos</small></div>
    </div>
    <p class="cq-cert ${jornada ? 'ok' : ''}">${jornada ? `${I('conquistas', { cls: 'ico-txt' })} Certificado de Navegador Seguro desbloqueado!` : `${cadeadoIcon({ size: 18 })} Certificado: complete as 3 ilhas para desbloquear.`}</p>`;

    const ilhaHtml = il => {
      const lib = ilhaLiberada(il.id);
      const tem = selos.includes(il);
      const fases = fasesDaIlha(il.id).map(f => {
        const r = progresso.resultadoDaFase(f.id);
        const estado = r ? I('estrela', { cls: 'cq-ico' }).repeat(r.estrelas) + I('estrela', { cls: 'cq-ico apagada' }).repeat(r.maxEstrelas - r.estrelas)
          : faseLiberada(f.id) ? `<em>${nFeitas(f.id)}/${f.atividades.length} atividades</em>`
          : `<em>${cadeadoIcon({ size: 14 })} bloqueada</em>`;
        return `<li class="${r ? 'feita' : ''}">${I(iconeFase(f), { cls: 'ico-txt' })}<span>${esc(f.titulo)}</span><b class="cq-est">${estado}</b></li>`;
      }).join('');
      return `<section class="cq-ilha ${lib ? '' : 'bloq'}" style="--cor:${il.cor}">
        <h4><span class="cq-band">${bandeira(il)}</span>${esc(il.nome)}</h4>
        <p class="cq-selo">${I(il.seloImg, { cls: 'ico-txt' })}<span>Selo <b>${esc(il.selo)}</b>: ${tem ? 'conquistado!' : lib ? 'termine as 5 fases para ganhar' : 'ilha ainda bloqueada'}</span></p>
        <ul>${fases}</ul>
      </section>`;
    };

    const w = popup({
      cls: 'popup-cq', x: true,
      titulo: foco ? `Conquistas da ${esc(ilhaById(foco).nome)}` : `${I('conquistas', { cls: 'ico-txt' })} Minhas Conquistas`,
      extra: resumo + (foco ? [ilhaById(foco)] : ILHAS).map(ilhaHtml).join(''),
      btns: foco ? [{ t: 'Ver todas', cls: 'btn-ghost', fn: () => { later(() => popupConquistas(), 0); } }, { t: 'Fechar', cls: 'btn-t' }]
        : [{ t: 'Fechar', cls: 'btn-t' }]
    });
    $('.popup', w).scrollTop = 0;   // o foco no botão rola até o fim; a lista começa do topo
  }

  /* Escolha da voz do botão "Ouvir" (fica salva neste aparelho). As vozes dependem do
     navegador: no Edge as "Natural" (ex.: Thalita) e no Chrome as do Google soam melhor. */
  function popupVoz() {
    const FRASE = 'Oi, pirata! Eu vou ler os textos do jogo para você. Vamos navegar com segurança?';
    const montarOpcoes = () => {
      const vozes = NK.voz.listaVozes();
      const atual = NK.voz.escolherVoz()?.name;
      return vozes.length
        ? vozes.map((v, i) => `<label class="voz-op"><input type="radio" name="voz" value="${esc(v.name)}" ${v.name === atual ? 'checked' : ''}>
            <span><b>${esc(v.name.replace(/^Microsoft\s+|\s*-\s*Portuguese.*$/gi, ''))}</b><small>${i === 0 ? 'recomendada · ' : ''}${NK.voz.ehNatural(v) ? 'voz natural · ' : 'voz robótica · '}${esc(v.lang)}</small></span>
            <button type="button" class="btn btn-sm btn-ghost voz-testar" data-v="${esc(v.name)}">Testar</button></label>`).join('')
        : '<p>Nenhuma voz em português foi encontrada neste aparelho. No computador, o navegador Edge ou o Chrome costumam ter vozes melhores.</p>';
    };
    const w = popup({
      cor: 'b', cls: 'popup-voz', x: true, titulo: 'Voz do Ouvir',
      extra: `<p class="voz-aviso">Escolha a voz que soa melhor. Ela fica salva neste aparelho.</p>
        ${NK.voz.temVozNatural() ? '' : `<p class="voz-dica">Este navegador só tem vozes robóticas em português. Para uma voz bem mais natural, abra o jogo no <b>Microsoft Edge</b> (vozes Thalita e Francisca) ou no <b>Google Chrome</b> (voz do Google).</p>`}
        <div class="voz-lista">${montarOpcoes()}</div>`,
      btns: [
        { t: 'Usar a recomendada', cls: 'btn-ghost', fn: () => { NK.voz.salvarVoz(''); NK.pararVoz(); } },
        { t: 'Salvar', cls: 'btn-t', fn: janela => { const v = $('input[name="voz"]:checked', janela); if (v) NK.voz.salvarVoz(v.value); NK.pararVoz(); } }
      ]
    });
    const ligar = () => $$('.voz-testar', w).forEach(b => b.onclick = e => {
      e.preventDefault();
      const voz = NK.voz.listaVozes().find(v => v.name === b.dataset.v);
      NK.voz.falar(FRASE, null, { voz });
    });
    ligar();
    // a lista de vozes pode chegar um pouco depois (Chrome): redesenha quando chegar
    document.addEventListener('nk-vozes', () => { const l = $('.voz-lista', w); if (l && document.body.contains(w)) { l.innerHTML = montarOpcoes(); ligar(); } }, { once: true });
  }

  function telaDiario() {
    /* Diário do Capitão — geometria medida no print do Figma (frame 1728 px). */
    const nome = progresso.nome() || '—';   // sem nome: o lápis ao lado permite editar
    const totalFases = FASES.length;
    const feitasFases = FASES.filter(f => faseCompleta(f.id)).length;
    const pct = Math.round((feitasFases / totalFases) * 100);
    const jornada = jornadaCompleta();
    const U = v => `calc(${v} * var(--u))`;
    const at = (l, t, extra = '') => `style="left:${U(l)};top:${U(t)};${extra}"`;
    const box = (l, t, w, h) => `style="left:${U(l)};top:${U(t)};width:${U(w)};height:${U(h ?? w)}"`;
    const img = (k, l, t, w, h, o = {}) => I(k, { alt: '', ...o }).replace('<img ', `<img ${box(l, t, w, h)} `);

    // Principais Conquistas: um espaço por ilha, com a cor e o número da bandeira dela;
    // o selo aparece quando a ilha é concluída. Cada espaço abre os detalhes da ilha.
    const selos = progresso.selos();
    const CONQUISTA_X = [350, 529, 709];   // centro de cada espaço (px do frame)
    const conquistas = ILHAS.map((il, i) => {
      const cx = CONQUISTA_X[i];
      const tem = selos.includes(il);
      return (tem
        ? `<span class="dr-selo-fundo" style="--cor:${il.cor};left:${U(cx - 61)};top:${U(683)};width:${U(122)};height:${U(122)}"></span>`
          + img(il.seloImg, cx - 45, 696, 90, 90, { alt: `Selo ${il.selo}` })
          + `<p class="dr-txt dr-selo-nome" style="left:${U(cx - 90)};width:${U(180)};top:${U(812)}">${esc(il.selo)}</p>`
        : `<span class="dr-slot" style="--cor:${il.cor};left:${U(cx - 57)};top:${U(690)}"></span>`)
        + `<span class="dr-num" style="--cor:${il.cor};left:${U(cx - 72)};top:${U(674)}" aria-hidden="true">${il.id}</span>`
        + `<button class="dr-cq" data-cq="${il.id}" ${box(cx - 64, 676, 128, 132)}
            aria-label="${tem ? `Selo ${esc(il.selo)} — ver conquistas da ${esc(il.nome)}` : `Selo da ${esc(il.nome)} ainda não conquistado — ver o que falta`}"></button>`;
    }).join('');
    const iconeConquistas = img('medalha', 302, 621, 64, 64, { cls: 'dr-medalha' });

    // mini-ilhas: ícone da ilha (a versão bloqueada já tem o cadeado) + botão
    const proxIlha = ILHAS.find(il => ilhaLiberada(il.id) && !ilhaCompleta(il.id));
    const ILHA_CENTRO_X = [1006, 1183, 1372];   // centro de cada ilha, alinhado ao botão
    const ILHA_BASE_Y = 749;                     // a ilha "pousa" logo acima do botão
    const ILHA_L = 170, ILHA_A = 150;            // caixa do ícone (a arte se ajusta dentro)
    const BTX = [931, 1127, 1322];               // left do botão
    const mini = ILHAS.map((il, i) => {
      const lib = ilhaLiberada(il.id);
      const ehProx = proxIlha && il.id === proxIlha.id;
      const fs = fasesDaIlha(il.id);
      const feitas = fs.filter(f => faseCompleta(f.id)).length;
      const cx = ILHA_CENTRO_X[i];
      return img(lib ? il.icone : il.iconeBloqueado, cx - ILHA_L / 2, ILHA_BASE_Y - ILHA_A, ILHA_L, ILHA_A,
          { cls: 'dr-ilha', alt: lib ? il.nome : `${il.nome} — bloqueada` })
        + `<span class="dr-bandeira" ${box(cx - 92, ILHA_BASE_Y - ILHA_A - 22, 46, 54)}>${bandeira(il)}</span>`
        + `<button class="dr-btn ${ehProx ? 'go-y' : 'go-grey'}" data-ir="${il.id}" ${at(BTX[i], ehProx ? 753 : 759)}
            ${lib ? '' : 'aria-disabled="true"'} aria-label="${esc(il.nome)}${lib ? '' : ' — bloqueada'}">${ehProx ? 'Começar' : 'VER'}</button>`
        + `<div class="dr-ilha-prog" style="--cor:${il.cor};left:${U(cx - 66)};top:${U(806)};width:${U(132)}"
            role="progressbar" aria-label="${esc(il.nome)}: ${feitas} de ${fs.length} fases" aria-valuenow="${feitas}" aria-valuemin="0" aria-valuemax="${fs.length}">
            <i style="width:${(feitas / fs.length) * 100}%"></i></div>
          <p class="dr-txt dr-ilha-n" style="left:${U(cx - 66)};width:${U(132)};top:${U(822)}">${feitas}/${fs.length} fases</p>`;
    }).join('');

    montar(`
    <div class="scene diario">
      <div class="diario-frame">
        <h1 class="dr-titulo">Diário do Capitão</h1>
        <div class="dr-azul"></div>
        <div class="dr-branco"></div>
        <span class="dr-fita" aria-hidden="true"></span>

        <h2 class="dr-h3" ${at(403, 238)}>MEU CANTINHO</h2>
        ${img('estrela', 678, 227, 63)}
        <span class="dr-h3" style="left:${U(748)};top:${U(238)};font-weight:400">${estrelasTotal()}</span>
        ${img('editar', 262, 345, 22)}
        ${img('pirata', 282, 339, 128)}
        <p class="dr-txt" ${at(432, 386)}><b>Navegador:</b> <span>${esc(nome)}</span>
          <button class="dr-editar" id="btEditarNome" aria-label="Editar nome">${I('editar', { cls: 'dr-inline' })}</button></p>
        ${img('cronometro', 263, 529, 30)}
        <p class="dr-txt" ${at(296, 524)}><b>Tempo jogado:</b> <span>${formatarTempo(progresso.tempoJogadoMs())}</span></p>
        ${img('levelup', 625, 522, 34)}
        <p class="dr-txt" ${at(660, 524)}><b>Level:</b> <span>${String(progresso.level()).padStart(2, '0')}</span></p>
        ${selos.length ? iconeConquistas : iconeConquistas.replace('style="', 'style="opacity:.35;')}
        <button class="dr-txt dr-cq-link" id="btConquistasTit" ${at(369, 630)}><b>Principais Conquistas:</b></button>
        ${conquistas}

        ${img('luneta', 958, 230, 110)}
        <h2 class="dr-h3" ${at(1095, 238)}>MINHA AVENTURA</h2>
        <p class="dr-txt" style="left:${U(971)};width:${U(468)};top:${U(452)};text-align:center;font-size:${U(24)}">${feitasFases} de ${totalFases} níveis concluídos</p>
        <div class="dr-trilho" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:max(${U(20)}, ${pct}%)"></i></div>
        <p class="dr-txt" style="left:${U(971)};width:${U(468)};top:${U(550)};text-align:center"><b>ILHAS:</b></p>
        ${mini}
      </div>
      <div class="diario-acoes"><button class="btn btn-t" id="btConquistas">${I('conquistas', { cls: 'ico-txt' })} Minhas Conquistas</button><button class="btn btn-ghost" id="btModo">Modo ${progresso.modoInfo().nome} (${progresso.modoInfo().idade}) · trocar</button>${NK.voz.temVoz ? '<button class="btn btn-ghost" id="btVoz">Voz do Ouvir</button>' : ''}${jornada ? `<button class="btn btn-t" id="btVerCert">Ver Certificado</button>` : ''}${DEV ? `<button class="btn btn-c" id="btReset">Reiniciar progresso (dev)</button>` : ''}</div>
    </div>`, 'diario');
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);

    const cert = $('#btVerCert'); if (cert) cert.onclick = () => go('#/certificado');
    const rst = $('#btReset'); if (rst) rst.onclick = () => { progresso.resetar(); go('#/home'); };
    $('#btEditarNome').onclick = $('#btModo').onclick = () => pedirNome(telaDiario);
    const bv = $('#btVoz'); if (bv) bv.onclick = popupVoz;
    $('#btConquistas').onclick = $('#btConquistasTit').onclick = $('.dr-medalha').onclick = () => popupConquistas();
    $$('.dr-cq').forEach(b => b.onclick = () => popupConquistas(+b.dataset.cq));
    $$('.dr-btn').forEach(b => b.onclick = () => {
      const id = +b.dataset.ir;
      if (!ilhaLiberada(id)) { toast('Complete a ilha anterior para desbloquear esta.'); return; }
      go(`#/carregando/${id}`);
    });
  }

  /* curto para caber antes do "Level" no Diário: "0 min" · "12 min" · "1h05" */
  function formatarTempo(ms) {
    const minutos = Math.floor(ms / 60000);
    if (minutos < 60) return `${minutos} min`;
    return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
  }

  /* ============================================================
     CERTIFICADO
     ============================================================ */
  function telaCertificado() {
    /* Um único cartão: começa pela frente; clique em qualquer ponto → flip (0.6s)
       para o verso; novo clique → volta para a frente. Artes originais intactas. */
    if (!jornadaCompleta()) { go('#/diario'); return; }
    montar(`
    <div class="scene certificado">
      <div class="certificado-card" id="certCard" role="button" tabindex="0" aria-label="Certificado — clique para virar" aria-pressed="false">
        <span class="certificado-inner">
          <span class="certificado-frente">${I('cert1', { alt: 'Certificado Guardião da Internet — frente' })}</span>
          <span class="certificado-verso">${I('cert2', { alt: 'Certificado — verso: Guardião dos Mares Digitais' })}</span>
        </span>
      </div>
      <p class="dica-flip">Clique no certificado para virar</p>
      <div class="acoes">
        <button class="btn btn-t" id="btImprimir">Imprimir / Salvar PDF</button>
        <button class="btn btn-ghost" id="btVoltarDiario">← Voltar ao Diário</button>
      </div>
    </div>`, 'diario');

    const card = $('#certCard');
    // div (não <button>): dentro de um botão o navegador não quebra página na impressão
    card.onclick = () => {
      const v = card.classList.toggle('virado');
      card.setAttribute('aria-pressed', v);
    };
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } };
    $('#btImprimir').onclick = () => window.print();
    $('#btVoltarDiario').onclick = () => go('#/diario');
  }

  Object.assign(NK, { renderRota, pedirNome });
})();
