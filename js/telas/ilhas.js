/* ============================================================
   NavegaKids · telas/ilhas.js
   Tela de Ilhas (as três ilhas desenhadas à mão) e a viagem do navio até a ilha escolhida.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, $$, esc, go, later, I, montar } = NK;
  const { ilhaById, ilhaCompleta, ilhaLiberada } = NK.progresso;
  const { FILTRO_ASPERO, bandeira } = NK.comum;

  function telaIlhas() {
    /* Fundo geral + as 3 ilhas desenhadas à mão, centralizadas, com a bandeira numerada
       (a mesma do Diário). Ilha bloqueada usa o desenho com cadeado; ilha liberada
       recebe “Explorar” (ou “Revisitar” se já concluída) logo abaixo. */
    const camadas = ILHAS.map(il => {
      const lib = ilhaLiberada(il.id);
      return `<div class="il-ilha il-ilha${il.id} ${lib ? '' : 'bloq'}">
        <span class="il-bandeira">${bandeira(il)}</span>
        ${I(lib ? il.icone : il.iconeBloqueado, { cls: 'il-desenho', alt: lib ? il.nome : `${il.nome} · bloqueada` })}
      </div>`;
    }).join('');
    const controles = ILHAS.map(il => {
      const liberada = ilhaLiberada(il.id);
      const completa = ilhaCompleta(il.id);
      return liberada
        ? `<button class="btn-figma il-explorar il-explorar${il.id}" data-il="${il.id}"
            aria-label="${esc(il.nome)}${completa ? ' · concluída' : ''}">${completa ? 'Revisitar' : 'Explorar'}</button>`
        : '';
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

  function telaCarregando(iid) {
    /* Viagem até a ilha, no estilo da introdução: o navio navega pelo mar
       até a ilha, que vai surgindo no horizonte. */
    const il = ilhaById(+iid) || ILHAS[0];
    montar(`
    <div class="scene prologo viagem">
      <div class="pr-ceu" aria-hidden="true"><i class="pr-sol"></i><i class="pr-nuvem n1"></i><i class="pr-nuvem n2"></i><i class="pr-nuvem n3"></i></div>
      <figure class="vg-ilha" style="--cor:${il.cor}" aria-hidden="true">${I(il.icone, { alt: '' })}</figure>
      <div class="pr-mar" aria-hidden="true"><i class="pr-onda"></i><i class="pr-onda o2"></i><i class="pr-onda o3"></i></div>
      <span class="pr-navio vg-navio">${I('navioPirata', { alt: 'Navio navegando até a ilha' })}</span>
      <div class="vg-txt" role="status">${esc(il.carregando)}<div class="barra"><i></i></div></div>
    </div>`, 'ilhas');
    later(() => { go(`#/fase/${il.id}`); }, 3600);
  }

  NK.telas = Object.assign(NK.telas || {}, { ilhas: telaIlhas, carregando: telaCarregando });
})();
