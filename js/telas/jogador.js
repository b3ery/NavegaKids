/* ============================================================
   NavegaKids · telas/jogador.js
   Popups do jogador: nome, personagem e nível (Marujo ou Capitão).
   Ficam só na memória da sessão, como o resto do progresso.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { progresso, $, esc, I, popup } = NK;

  /* PopUP-Usuario do Figma: pede o nome (ou apelido) do navegador e o modo por idade
     (Marujo, 8 anos · Capitão, 9 e 10 anos — relato de testes).
     Fica só na memória da sessão, como o resto do progresso. */
  const cartaoModo = (m, atual) => `<label class="modo-op">
      <input type="radio" name="modo" value="${m.id}" ${m.id === atual ? 'checked' : ''}>
      <span class="modo-card modo-${m.id}">
        ${I(m.id === 'marujo' ? 'usuario' : 'pirata', { cls: 'modo-ico' })}
        <b>${m.nome}</b><small>${m.idade}</small>
        <em>${m.id === 'marujo' ? 'Voz que lê tudo sozinha e sem tempo para responder' : 'Desafio com tempo de 15 segundos e voz só se quiser'}</em>
      </span>
    </label>`;
  const escolhaModoHtml = legenda => `<fieldset class="campo-modo"><legend>${legenda}</legend>
      <div class="modo-ops">${Object.values(progresso.MODOS).map(m => cartaoModo(m, progresso.modo())).join('')}</div>
    </fieldset>`;

  const escolhaAvatarHtml = () => `<fieldset class="campo-avatar"><legend>Escolha seu personagem</legend>
      <div class="avatar-ops">${progresso.AVATARES.map((a, i) => `<label class="avatar-op">
        <input type="radio" name="avatar" value="${a}" ${a === progresso.avatar() ? "checked" : ""}>
        ${NK.fotoPerfil(a, { alt: `Personagem ${i + 1}` })}</label>`).join("")}</div>
    </fieldset>`;

  /** Na primeira vez (Navegar!) pede nome, personagem e nível; o lápis do nome no Diário pede só o nome. */
  function pedirNome(depois, { comModo = true } = {}) {
    const w = popup({
      cor: 'b', titulo: 'Qual é o seu nome de navegador?',
      extra: `<label class="campo-nome"><span>Pode ser um apelido!</span>
        <input id="inNome" type="text" maxlength="20" autocomplete="off"
          value="${esc(progresso.nome())}" placeholder="Ex.: Pirata Corajoso"></label>
        ${comModo ? escolhaAvatarHtml() : ''}
        ${comModo ? escolhaModoHtml('Como você quer navegar?') : ''}`,
      btns: [
        { t: 'Agora não', cls: 'btn-ghost', fn: () => depois?.() },
        { t: 'Confirmar', cls: 'btn-t', fn: janela => {
          progresso.definirNome($('#inNome', janela).value);
          if (comModo) progresso.definirAvatar($('input[name="avatar"]:checked', janela)?.value);
          if (comModo) progresso.definirModo($('input[name="modo"]:checked', janela)?.value);
          depois?.();
        } }
      ]
    });
    const campo = $('#inNome', w);
    campo.focus();
    campo.onkeydown = e => { if (e.key === 'Enter') $('[data-b="1"]', w).click(); };
  }

  /** Diário: o lápis ao lado do retrato troca o personagem. */
  function pedirAvatar(depois) {
    popup({
      cor: 'b', titulo: 'Trocar o personagem', extra: escolhaAvatarHtml(),
      btns: [
        { t: 'Cancelar', cls: 'btn-ghost' },
        { t: 'Confirmar', cls: 'btn-t', fn: janela => { progresso.definirAvatar($('input[name="avatar"]:checked', janela)?.value); depois?.(); } }
      ]
    });
  }

  /** Diário: troca só o nível (8 anos ou 9 e 10 anos). */
  function pedirModo(depois) {
    popup({
      cor: 'b', titulo: 'Trocar o nível',
      extra: escolhaModoHtml('Escolha a idade de quem está jogando'),
      btns: [
        { t: 'Cancelar', cls: 'btn-ghost' },
        { t: 'Confirmar', cls: 'btn-t', fn: janela => { progresso.definirModo($('input[name="modo"]:checked', janela)?.value); depois?.(); } }
      ]
    });
  }

  NK.jogador = { pedirNome, pedirAvatar, pedirModo };
})();
