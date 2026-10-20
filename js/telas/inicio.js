/* ============================================================
   NavegaKids · telas/inicio.js
   Tela Inicial: personagem no convés, balão com o nome e o botão Navegar!
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, progresso, $, esc, go, I, montar } = NK;
  const { ilhaCompleta, ilhaLiberada, jornadaCompleta, estrelasTotal } = progresso;
  const { FILTRO_ASPERO } = NK.comum;
  const { pedirNome } = NK.jogador;

  // centro de cada ilha no desenho do Mapa_Home (px do frame): brilhos/estrelas por cima
  const HOME_ILHAS = [
    [1296, 548],
    [1540, 668],
    [1300, 768]
  ];

  function telaHome() {
    const nome = progresso.nome();
    const comecou = progresso.pontosTotal() > 0;
    const proxIlha = ILHAS.find(il => ilhaLiberada(il.id) && !ilhaCompleta(il.id));
    const status = !comecou
      ? ''
      : jornadaCompleta()
        ? `${I('conquistas', { cls: 'ico-txt' })} Jornada completa! Você é um Guardião dos Mares.`
        : `${I('estrela', { cls: 'ico-txt' })} ${estrelasTotal()} estrelas · Próxima parada: ${esc(proxIlha.nome)}`;
    const brilhos = ILHAS.map((il, i) => {
      const [x, y] = HOME_ILHAS[i];
      return ilhaCompleta(il.id)
        ? I('estrela', { cls: 'hm-ilha-estrela', alt: '' }).replace(
            '<img ',
            `<img style="--i:${i};left:calc(${x - 40} * var(--u));top:calc(${y - 150} * var(--u))" `
          )
        : `<span class="hm-brilho" style="--i:${i};left:calc(${x + 50} * var(--u));top:calc(${y - 120} * var(--u))" aria-hidden="true"></span>`;
    }).join('');

    /* Composição da Home reconstruída sobre o frame do Figma (1728 × 1683 px,
       navbar de 182 px incluída). Cada camada usa o PNG atual de /img com o
       canvas transparente preservado; posições/escala em unidades do frame
       (ver .home-frame no CSS). */
    montar(
      `
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
    </div>`,
      'home'
    );
    document.body.classList.add('tela-figma');
    window.scrollTo(0, 0);
    const navegar = () => (progresso.nome() ? go('#/ilhas') : pedirNome(() => go('#/ilhas')));
    $('#btNavegar').onclick = navegar;
    $('#hmMapa').onclick = navegar;
  }

  NK.telas = Object.assign(NK.telas || {}, { home: telaHome });
})();
