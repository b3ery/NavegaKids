/* ============================================================
   NavegaKids — config.js
   Liga o código à pasta /img.
   Cada chave abaixo aponta para o NOME DO ARQUIVO (sem extensão)
   que está na pasta img/. Se o arquivo não existir, o jogo usa
   um emoji no lugar — então nada quebra enquanto você não copia
   todas as imagens.
   ============================================================ */
(() => {
  'use strict';
  // Único objeto global do projeto — todos os arquivos se registram nele.
  const NK = (window.NavegaKids ??= {});

  /* Extensões testadas, nessa ordem. Ajuste se as suas forem outras. */
  const EXTS = ['png', 'webp', 'jpg', 'jpeg', 'svg'];

  /* chave : [nome-do-arquivo, emoji-reserva] */
  const IMG = {
    /* ---- cenários / fundos ---- */
    fundoHome:        ['Fundo_Home', null],
    fundoIlhas:       ['Fundo_Ilhas', null],
    fundoFases:       ['FundoFases', null],
    fundoCarregando:  ['fundo_carregando', null],
    fundo:            ['fundo', null],
    mapaTesouro:      ['mapa-do-tesouro', '🗺️'],
    mapa:             ['mapa', '🗺️'],
    mapaHome:         ['Mapa_Home', '🗺️'],

    /* ---- personagens e cenário ---- */
    pirata:           ['pirata', '🏴‍☠️'],
    barco:            ['Barco', '⛵'],
    navio:            ['navio-mayflower', '🚢'],
    navioPirata:      ['navio-pirata', '🏴‍☠️'],   // card "Fase atual" do mapa da ilha
    volante:          ['Volante', 'svg:volante'],
    ilha1:            ['ilha1', '🏝️'],
    ilha2:            ['ilha2', '🏝️'],
    ilha3:            ['ilha3', '🏝️'],

    /* ---- medalha: selos conquistados e "Fase atual" ---- */
    medalha:          ['medalha', '🏅'],

    /* ---- ícones das ilhas no Diário do Capitão (liberada / bloqueada) ---- */
    ilhaPraia:                ['ilha-praia', '🏝️'],
    ilhaPraiaBloqueada:       ['ilha-praia-bloqueada', '🔒'],
    ilhaArvores:              ['ilha-arvores', '🌳'],
    ilhaArvoresBloqueada:     ['ilha-arvores-bloqueada', '🔒'],
    ilhaMontanhas:            ['ilha-montanhas', '⛰️'],
    ilhaMontanhasBloqueada:   ['ilha-montanhas-bloqueada', '🔒'],
    bau:              ['treasure-chest', '🧰'],
    policial:         ['policial', '👮'],

    /* ---- interface / HUD ---- */
    estrela:          ['estrela', '⭐'],
    levelup:          ['levelup', '✦'],
    moedas:           ['moedas', '🪙'],
    diamond:          ['diamond', '💎'],
    conquistas:       ['conquistas', '🏆'],
    cronometro:       ['cronometro', '⏱️'],
    config:           ['simbolo-de-interface-da-roda-dentada-de-configuracao', '⚙️'],
    editar:           ['editar', '✏️'],
    usuario:          ['usuario', '👤'],
    utilizador:       ['do-utilizador', '👤'],
    dadosPessoais:    ['dados-pessoais', '🪪'],
    bloqueado:        ['bloqueado', '🔒'],

    /* ---- ícones de fases / feedback ---- */
    luneta:           ['luneta', '🔍'],
    anonimo:          ['anonimo', '🕵️'],
    misterio:         ['misterio', '🤐'],
    interrogacao:     ['ponto-de-interrogacao', '❓'],
    interrogacao2:    ['ponto-de-interrogacao (1)', '❓'],
    bubbleChat:       ['bubble-chat', '💬'],
    comunicacao:      ['comunicacao', '💬'],
    comunicacao2:     ['comunicacao (1)', '💬'],
    falando:          ['falando', '🗣️'],
    corre:            ['corre', '🏃'],
    escudo:           ['escudo', '🛡️'],
    bloquearUsuario:  ['bloquear-usuario', '🚫'],
    pare:             ['pare-de-intimidar', '✋'],
    exclamacao3:      ['3exclamacao', '❗'],
    alerta:           ['alerta (1)', '⚠️'],
    atencao:          ['atencao', '⚠️'],
    critico:          ['critico', '❗'],
    botaoVermelho:    ['botao-vermelho', '🔴'],
    apoio:            ['apoio-suporte', '🤝'],
    assistencia:      ['assistencia-social', '🫂'],
    pedidoAmizade:    ['pedido-de-amizade', '🧑‍🤝‍🧑'],
    correto:          ['correto', '✅'],
    falha:            ['falha', '❌'],
    nao:              ['nao', '✖️'],
    naoGosto:         ['nao-gosto', '👎'],
    martelo:          ['martelo', '🔨'],

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
