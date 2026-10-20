/* ============================================================
   NavegaKids · telas/abertura.js
   Abertura de cada fase: título, ícone, texto da missão e o botão para começar.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { progresso, $, esc, go, I, montar } = NK;
  const { faseById, faseLiberada } = progresso;
  const { FILTRO_ASPERO, iconeFase } = NK.comum;

  function telaAbertura(fid) {
    /* Template de introdução: obrigatório antes das atividades de TODA fase.
       Composição fixa do Figma; título, ícone, texto e botão vêm da fase. */
    const f = faseById(+fid);
    if (!f) return go('#/ilhas');
    if (!faseLiberada(f.id)) return go(`#/fase/${f.ilha}`);
    if (f.id === 1 && !progresso.prologoVisto()) return go('#/prologo'); // antes da 1ª fase, o Capitão se apresenta
    progresso.definirFaseVista(f.id);
    montar(
      `
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
    </div>`,
      'ilhas'
    );
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);
    $('#btComecar').onclick = () => {
      progresso.marcarIntroVista(f.id);
      go('#/missoes');
    };
  }

  NK.telas = Object.assign(NK.telas || {}, { abertura: telaAbertura });
})();
