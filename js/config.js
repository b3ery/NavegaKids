/* ============================================================
   NavegaKids — config.js
   Liga o código à pasta /img.
   Cada chave abaixo aponta para o NOME DO ARQUIVO (sem extensão)
   que está na pasta img/. Se o arquivo não existir, a imagem
   simplesmente não aparece (o jogo não usa emojis).
   ============================================================ */
(() => {
  'use strict';
  // Único objeto global do projeto — todos os arquivos se registram nele.
  const NK = (window.NavegaKids ??= {});

  /* Extensões testadas, nessa ordem. Ajuste se as suas forem outras. */
  const EXTS = ['png', 'webp', 'jpg', 'jpeg', 'svg'];

  /* chave : [nome-do-arquivo, reserva ('svg:nome' ou null)] */
  const IMG = {
    /* ---- cenários / fundos ---- */
    fundoHome:        ['Fundo_Home', null],
    fundoIlhas:       ['Fundo_Ilhas', null],
    fundoFases:       ['FundoFases', null],
    fundoCarregando:  ['fundo_carregando', null],
    fundo:            ['fundo', null],
    mapaTesouro:      ['mapa-do-tesouro', null],
    mapa:             ['mapa', null],
    mapaHome:         ['Mapa_Home', null],

    /* ---- personagens e cenário ---- */
    pirata:           ['pirata', null],
    barco:            ['Barco', null],
    navio:            ['navio-mayflower', null],
    navioPirata:      ['navio-pirata', null],   // card "Fase atual" do mapa da ilha
    volante:          ['Volante', 'svg:volante'],
    ilha1:            ['ilha1', null],
    ilha2:            ['ilha2', null],
    ilha3:            ['ilha3', null],

    /* ---- medalha: selos conquistados e "Fase atual" ---- */
    medalha:          ['medalha', null],

    /* ---- ícones das ilhas no Diário do Capitão (liberada / bloqueada) ---- */
    ilhaPraia:                ['ilha-praia', null],
    ilhaPraiaBloqueada:       ['ilha-praia-bloqueada', null],
    ilhaArvores:              ['ilha-arvores', null],
    ilhaArvoresBloqueada:     ['ilha-arvores-bloqueada', null],
    ilhaMontanhas:            ['ilha-montanhas', null],
    ilhaMontanhasBloqueada:   ['ilha-montanhas-bloqueada', null],
    bau:              ['treasure-chest', null],
    policial:         ['policial', null],

    /* ---- interface / HUD ---- */
    estrela:          ['estrela', null],
    levelup:          ['levelup', null],
    moedas:           ['moedas', null],
    diamond:          ['diamond', null],
    conquistas:       ['conquistas', null],
    cronometro:       ['cronometro', null],
    config:           ['simbolo-de-interface-da-roda-dentada-de-configuracao', null],
    editar:           ['editar', null],
    usuario:          ['usuario', null],
    utilizador:       ['do-utilizador', null],
    dadosPessoais:    ['dados-pessoais', null],
    bloqueado:        ['bloqueado', null],

    /* ---- ícones de fases / feedback ---- */
    luneta:           ['luneta', null],
    anonimo:          ['anonimo', null],
    misterio:         ['misterio', null],
    interrogacao:     ['ponto-de-interrogacao', null],
    interrogacao2:    ['ponto-de-interrogacao (1)', null],
    bubbleChat:       ['bubble-chat', null],
    bocaZiper:        ['boca-ziper', null],   // Fase 4: rosto com boca fechada por zíper (roteiro)
    comunicacao:      ['comunicacao', null],
    comunicacao2:     ['comunicacao (1)', null],
    falando:          ['falando', null],
    corre:            ['corre', null],
    escudo:           ['escudo', null],
    bloquearUsuario:  ['bloquear-usuario', null],
    pare:             ['pare-de-intimidar', null],
    exclamacao3:      ['3exclamacao', null],
    alerta:           ['alerta (1)', null],
    atencao:          ['atencao', null],
    critico:          ['critico', null],
    botaoVermelho:    ['botao-vermelho', null],
    apoio:            ['apoio-suporte', null],
    assistencia:      ['assistencia-social', null],
    pedidoAmizade:    ['pedido-de-amizade', null],
    correto:          ['correto', null],
    falha:            ['falha', null],
    nao:              ['nao', null],
    naoGosto:         ['nao-gosto', null],
    martelo:          ['martelo', null],

    /* ---- certificados ---- */
    cert1:            ['certificado-final-1', null],
    cert2:            ['certificado-final-2', null]
  };

  /* SVGs de reserva (usados quando o emoji é 'svg:nome') */
  const SVG_RESERVA = {
    volante: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="#7a4a1e" stroke-linecap="round">
        <g stroke-width="7"><path d="M50 8v84M8 50h84M20 20l60 60M80 20L20 80"/></g>
        <circle cx="50" cy="50" r="27" fill="none" stroke-width="9"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke-width="6" stroke="#a6672a"/>
        <circle cx="50" cy="50" r="9" fill="#e0a13a" stroke-width="3"/>
      </g>
      <g fill="#e0a13a" stroke="#7a4a1e" stroke-width="2">
        <circle cx="50" cy="6" r="5"/><circle cx="50" cy="94" r="5"/><circle cx="6" cy="50" r="5"/><circle cx="94" cy="50" r="5"/>
        <circle cx="19" cy="19" r="5"/><circle cx="81" cy="81" r="5"/><circle cx="81" cy="19" r="5"/><circle cx="19" cy="81" r="5"/>
      </g></svg>`
  };

  Object.assign(NK, { EXTS, IMG, SVG_RESERVA });
})();
