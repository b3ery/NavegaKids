/* ============================================================
   NavegaKids · router.js
   Liga cada endereço (#/home, #/ilhas, #/atividade/3/1...) à sua tela.
   As telas ficam em js/telas/ (uma por arquivo); a tela de atividade fica em activities.js.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { clearTimers, fecharPopups } = NK;

  /* rota → tela; "p" é o resto do endereço (ex.: "3/1" em #/atividade/3/1) */
  const ROTAS = {
    home: () => NK.telas.home(),
    ilhas: () => NK.telas.ilhas(),
    carregando: p => NK.telas.carregando(p),
    fase: p => NK.telas.fase(p),
    missoes: () => NK.telas.missoes(),
    abertura: p => NK.telas.abertura(p),
    prologo: () => NK.telas.prologo(),
    capitao: p => NK.telas.capitao(p),
    atividade: p => NK.telaAtividade(p),
    conclusao: p => NK.telas.conclusao(p),
    diario: () => NK.telas.diario(),
    certificado: () => NK.telas.certificado()
  };

  function renderRota() {
    clearTimers();
    fecharPopups();
    const [rota, ...resto] = (location.hash.replace('#/', '') || 'home').split('/');
    try {
      (ROTAS[rota] || ROTAS.home)(resto.join('/'));
    } catch (e) {
      console.error(e);
      NK.telas.home();
    }
  }

  function iniciar() {
    // simulação sem progresso salvo: ao recarregar, o estado volta ao zero e as rotas que
    // dependem de progresso voltam para o Início
    const rota = location.hash.replace('#/', '').split('/')[0];
    if (!['home', 'ilhas', 'diario'].includes(rota)) history.replaceState(null, '', '#/home');
    renderRota();
  }

  window.addEventListener('hashchange', renderRota);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  Object.assign(NK, { renderRota });
})();
