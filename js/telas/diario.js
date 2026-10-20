/* ============================================================
   NavegaKids · telas/diario.js
   Diário do Capitão: personagem, nome, tempo, nível, conquistas e o progresso das três ilhas.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, FASES, progresso, $, $$, esc, go, later, I, popup, toast, montar, cadeadoIcon } = NK;
  const { ilhaById, fasesDaIlha, nFeitas, faseCompleta, faseLiberada, ilhaCompleta, ilhaLiberada, jornadaCompleta, estrelasTotal } = progresso;
  const { iconeFase, bandeira } = NK.comum;
  const { pedirNome, pedirAvatar, pedirModo } = NK.jogador;

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

  function telaDiario() {
    /* Diário do Capitão — geometria medida no print do Figma (frame 1728 px). */
    const nome = progresso.nome() || 'sem nome';   // sem nome: o lápis ao lado permite editar
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
            aria-label="${tem ? `Selo ${esc(il.selo)} · ver conquistas da ${esc(il.nome)}` : `Selo da ${esc(il.nome)} ainda não conquistado · ver o que falta`}"></button>`;
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
          { cls: 'dr-ilha', alt: lib ? il.nome : `${il.nome} · bloqueada` })
        + `<span class="dr-bandeira" ${box(cx - 92, ILHA_BASE_Y - ILHA_A - 22, 46, 54)}>${bandeira(il)}</span>`
        + `<button class="dr-btn ${ehProx ? 'go-y' : 'go-grey'}" data-ir="${il.id}" ${at(BTX[i], ehProx ? 753 : 759)}
            ${lib ? '' : 'aria-disabled="true"'} aria-label="${esc(il.nome)}${lib ? '' : ' · bloqueada'}">${ehProx ? 'Começar' : 'VER'}</button>`
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
        <button class="dr-editar dr-editar-av" id="btEditarAvatar" ${box(256, 339, 34, 34)} aria-label="Trocar personagem">${I('editar')}</button>
        <span class="dr-avatar" ${box(282, 339, 128, 128)}>${NK.fotoPerfil(progresso.avatar(), { alt: 'Seu personagem' })}</span>
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
      <div class="diario-acoes"><button class="btn" id="btConquistas">${I('conquistas', { cls: 'ico-txt' })} Minhas Conquistas</button><button class="btn" id="btModo">Nível: ${progresso.modoInfo().nome} (${progresso.modoInfo().idade}) · trocar</button>${jornada ? `<button class="btn" id="btVerCert">Ver Certificado</button>` : ''}<button class="btn" id="btReset">Recomeçar a aventura</button></div>
    </div>`, 'diario');
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);

    const cert = $('#btVerCert'); if (cert) cert.onclick = () => go('#/certificado');
    $('#btReset').onclick = () => NK.jogador.confirmarRecomecar();
    $('#btEditarNome').onclick = () => pedirNome(telaDiario, { comModo: false });
    $('#btEditarAvatar').onclick = () => pedirAvatar(telaDiario);
    $('#btModo').onclick = () => pedirModo(telaDiario);
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

  NK.telas = Object.assign(NK.telas || {}, { diario: telaDiario });
})();
