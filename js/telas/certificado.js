/* ============================================================
   NavegaKids · telas/certificado.js
   Certificado de Guardião da Internet: frente e verso que viram com um clique, pronto para imprimir.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { $, go, I, montar } = NK;
  const { jornadaCompleta } = NK.progresso;

  function telaCertificado() {
    /* Um único cartão: começa pela frente; clique em qualquer ponto → flip (0.6s)
       para o verso; novo clique → volta para a frente. Artes originais intactas. */
    if (!jornadaCompleta()) {
      go('#/diario');
      return;
    }
    montar(
      `
    <div class="scene certificado">
      <div class="certificado-card" id="certCard" role="button" tabindex="0" aria-label="Certificado: clique para virar" aria-pressed="false">
        <span class="certificado-inner">
          <span class="certificado-frente">${I('cert1', { alt: 'Certificado Guardião da Internet, frente' })}</span>
          <span class="certificado-verso">${I('cert2', { alt: 'Certificado, verso: Guardião dos Mares Digitais' })}</span>
        </span>
      </div>
      <p class="dica-flip">Clique no certificado para virar</p>
      <div class="acoes">
        <button class="btn btn-t" id="btImprimir">Imprimir / Salvar PDF</button>
        <button class="btn btn-ghost" id="btVoltarDiario">← Voltar ao Diário</button>
      </div>
    </div>`,
      'diario'
    );

    const card = $('#certCard');
    // div (não <button>): dentro de um botão o navegador não quebra página na impressão
    card.onclick = () => {
      const v = card.classList.toggle('virado');
      card.setAttribute('aria-pressed', v);
    };
    card.onkeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    };
    $('#btImprimir').onclick = () => window.print();
    $('#btVoltarDiario').onclick = () => go('#/diario');
  }

  NK.telas = Object.assign(NK.telas || {}, { certificado: telaCertificado });
})();
