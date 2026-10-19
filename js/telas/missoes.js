/* ============================================================
   NavegaKids · telas/missoes.js
   Missões: as três atividades da fase em trilha, o painel da fase atual e a escolha da voz.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { progresso, $, $$, esc, go, I, popup, montar, cadeadoIcon } = NK;
  const { DEV, faseById, fasesDaIlha, feita, nFeitas, faseLiberada, faseAtual } = progresso;

  function telaMissoes() {
    // mostra a fase que está sendo jogada (para exibir 100% e “Próxima fase”
    // ao concluir), senão a fase atual da progressão
    const vista = progresso.faseVista();
    const f = (vista && faseLiberada(vista)) ? faseById(vista) : faseAtual();
    renderMissoesFase(f.id);
  }

  /* Relato de testes (profa. Camila): cada quadrado de atividade com uma cor forte,
     para a tela ficar com mais cara de jogo infantil. */
  const CORES_PASSO = ['#4EA8DE', '#FF7A59', '#2EC4B6'];

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
        <span>${esc(a.titulo)}</span>
        ${lib ? (ft ? `<span class="n ok">${I('correto', { cls: 'ico-txt' })}</span>` : '<span class="n go">Começar</span>') : `<span class="cad">${cadeadoIcon({ size: 20 })}</span>`}
      </button>`;
    }).join('');
    const linhaArv = 'M 18 26 L 50 74 L 80 26';

    montar(`
    <div class="scene missoes" style="--cor-ilha:${NK.ILHAS.find(il => il.id === f.ilha)?.cor || '#4EA8DE'}">
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
            <div class="voz-botoes">
              ${NK.botaoOuvir('#txtMissao', { cls: 'ouvir-missao' })}
              ${NK.voz.temVoz ? `<button type="button" class="bt-ouvir bt-voz" id="btVoz" aria-label="Escolher qual voz lê os textos">${I('config', { cls: 'ico-txt' })}<span>Trocar voz</span></button>` : ''}
            </div>
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
    const bv = $('#btVoz'); if (bv) bv.onclick = popupVoz;
    // sem ter passado pela introdução, “Começar” leva primeiro à introdução da fase
    $$('.passo[data-i]', $('.arvore')).forEach(b => b.onclick = () => go(progresso.introVista(fid) || DEV ? `#/atividade/${fid}/${b.dataset.i}` : `#/abertura/${fid}`));
    const av = $('#btAvancarFase');
    if (av) av.onclick = () => aposFase(fid);
  }

  function aposFase(fid) {
    const f = faseById(fid);
    const ultimaDaIlha = fasesDaIlha(f.ilha).slice(-1)[0].id === fid;
    if (ultimaDaIlha) go(`#/capitao/ilha/${f.ilha}`);
    else {
      const proxima = fasesDaIlha(f.ilha).find(x => x.id > fid);
      go(`#/abertura/${proxima.id}`);
    }
  }

  /* Escolha da voz do botão "Ouvir" (fica salva neste aparelho; botão "Voz" em Missões). As vozes dependem do
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
      extra: `        <p class="voz-aviso">Escolha a voz que soa melhor. Ela fica salva neste aparelho.</p>
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

  NK.telas = Object.assign(NK.telas || {}, { missoes: telaMissoes });
})();
