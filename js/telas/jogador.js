/* ============================================================
   NavegaKids · telas/jogador.js
   Popups do jogador: nome, personagem e nível (Marujo ou Capitão), as boas-vindas
   de quem volta ao jogo e a confirmação para recomeçar do zero.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { progresso, $, esc, later, I, popup } = NK;

  /* Popup do jogador (Figma): pede o nome (ou apelido) do navegador e o nível por idade
     (Marujo, 8 anos · Capitão, 9 e 10 anos, conforme o relato de testes). */
  const cartaoModo = (m, atual) => `<label class="modo-op">
      <input type="radio" name="modo" value="${m.id}" ${m.id === atual ? 'checked' : ''}>
      <span class="modo-card modo-${m.id}">
        ${I(m.id === 'marujo' ? 'usuario' : 'pirata', { cls: 'modo-ico' })}
        <b>${m.nome}</b><small>${m.idade}</small>
        <em>${m.id === 'marujo' ? 'Voz que lê tudo sozinha e sem tempo para responder' : 'Desafio com tempo de 15 segundos e voz só se quiser'}</em>
      </span>
    </label>`;
  const escolhaModoHtml = legenda => `<fieldset class="campo-modo"><legend>${legenda}</legend>
      <div class="modo-ops">${Object.values(progresso.MODOS)
        .map(m => cartaoModo(m, progresso.modo()))
        .join('')}</div>
    </fieldset>`;

  const escolhaAvatarHtml = () => `<fieldset class="campo-avatar"><legend>Escolha seu personagem</legend>
      <div class="avatar-ops">${progresso.AVATARES.map(
        (a, i) => `<label class="avatar-op">
        <input type="radio" name="avatar" value="${a}" ${a === progresso.avatar() ? 'checked' : ''}>
        ${NK.fotoPerfil(a, { alt: `Personagem ${i + 1}` })}</label>`
      ).join('')}</div>
    </fieldset>`;

  /** Na primeira vez (Navegar!) pede nome, personagem e nível; o lápis do nome no Diário pede só o nome. */
  function pedirNome(depois, { comModo = true } = {}) {
    const w = popup({
      cor: 'b',
      titulo: 'Qual é o seu nome de navegador?',
      extra: `<label class="campo-nome"><span>Pode ser um apelido!</span>
        <input id="inNome" type="text" maxlength="20" autocomplete="off"
          value="${esc(progresso.nome())}" placeholder="Ex.: Pirata Corajoso"></label>
        ${comModo ? escolhaAvatarHtml() : ''}
        ${comModo ? escolhaModoHtml('Como você quer navegar?') : ''}`,
      btns: [
        { t: 'Agora não', cls: 'btn-ghost', fn: () => depois?.() },
        {
          t: 'Confirmar',
          cls: 'btn-t',
          fn: janela => {
            progresso.definirNome($('#inNome', janela).value);
            if (comModo) progresso.definirAvatar($('input[name="avatar"]:checked', janela)?.value);
            if (comModo) progresso.definirModo($('input[name="modo"]:checked', janela)?.value);
            depois?.();
          }
        }
      ]
    });
    const campo = $('#inNome', w);
    campo.focus();
    campo.onkeydown = e => {
      if (e.key === 'Enter') $('[data-b="1"]', w).click();
    };
  }

  /** Diário: o lápis ao lado do retrato troca o personagem. */
  function pedirAvatar(depois) {
    popup({
      cor: 'b',
      titulo: 'Trocar o personagem',
      extra: escolhaAvatarHtml(),
      btns: [
        { t: 'Cancelar', cls: 'btn-ghost' },
        {
          t: 'Confirmar',
          cls: 'btn-t',
          fn: janela => {
            progresso.definirAvatar($('input[name="avatar"]:checked', janela)?.value);
            depois?.();
          }
        }
      ]
    });
  }

  /** Diário: troca só o nível (8 anos ou 9 e 10 anos). */
  function pedirModo(depois) {
    popup({
      cor: 'b',
      titulo: 'Trocar o nível',
      extra: escolhaModoHtml('Escolha a idade de quem está jogando'),
      btns: [
        { t: 'Cancelar', cls: 'btn-ghost' },
        {
          t: 'Confirmar',
          cls: 'btn-t',
          fn: janela => {
            progresso.definirModo($('input[name="modo"]:checked', janela)?.value);
            depois?.();
          }
        }
      ]
    });
  }

  /** Recomeçar do zero: pede confirmação antes de apagar as estrelas. */
  function confirmarRecomecar(seVoltar) {
    popup({
      capitao: true,
      titulo: 'Começar do zero?',
      texto: 'As fases, as estrelas e os selos vão ser apagados. O seu nome e o personagem também.',
      btns: [
        { t: 'Voltar', cls: 'btn-ghost', fn: () => seVoltar?.() },
        {
          t: 'Sim, recomeçar',
          cls: 'btn-c',
          fn: () => {
            progresso.resetar();
            location.hash === '#/home' ? NK.renderRota() : (location.hash = '#/home');
          }
        }
      ]
    });
  }

  /** Ao abrir o jogo com progresso salvo: o Capitão dá as boas-vindas e pergunta se continua ou recomeça. */
  function boasVindas() {
    const nome = progresso.nome();
    const estrelas = progresso.estrelasTotal();
    const fase = progresso.faseAtual();
    const w = popup({
      cor: 'b',
      capitao: true,
      titulo: 'Bem-vindo de volta!',
      texto: `Olá, ${nome ? 'navegador ' + nome : 'navegador'}! Que bom ter você de volta. Quer continuar de onde parou ou recomeçar a aventura?`,
      extra: progresso.jornadaCompleta()
        ? `<p class="voltou-onde">${I('conquistas', { cls: 'ico-txt' })} Você já completou a jornada!</p>`
        : `<p class="voltou-onde">${I('estrela', { cls: 'ico-txt' })} ${estrelas} ${estrelas === 1 ? 'estrela' : 'estrelas'} · Próxima: Fase ${fase.id}, ${esc(fase.titulo)}</p>`,
      btns: [
        {
          t: 'Recomeçar',
          cls: 'btn-ghost',
          fn: () => {
            later(() => confirmarRecomecar(boasVindas), 0);
          }
        },
        { t: 'Continuar', cls: 'btn-t' }
      ]
    });
    $('[data-b="1"]', w).focus(); // Enter continua
  }

  NK.jogador = { pedirNome, pedirAvatar, pedirModo, boasVindas, confirmarRecomecar };
})();
