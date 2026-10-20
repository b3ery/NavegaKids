/* ============================================================
   NavegaKids · telas/conclusao.js
   Conclusão de cada ilha: selo conquistado, confetes e o caminho para a próxima ilha ou o certificado.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, $, esc, go, I, montar } = NK;
  const { ilhaById } = NK.progresso;

  /* confetes coloridos caindo (posição, cor, atraso e duração variados) */
  function confetes(n) {
    const cores = ['#FFC83B', '#2EC4B6', '#ff7a59', '#4EA8DE', '#ffffff'];
    return Array.from({ length: n }, (_, i) => {
      const esq = (i * 37) % 100,
        cor = cores[i % cores.length];
      const dur = 3 + (i % 5) * 0.6,
        atraso = -((i * 0.73) % dur),
        dx = ((i % 7) - 3) * 18;
      return `<i style="left:${esq}%;background:${cor};animation-duration:${dur}s;animation-delay:${atraso.toFixed(2)}s;--dx:${dx}px"></i>`;
    }).join('');
  }

  function telaConclusao(iid) {
    const il = ilhaById(+iid);
    const ultimaIlha = il.id === ILHAS.at(-1).id;
    montar(
      `
    <div class="scene conclusao" data-bg="fundo">
      <div class="confetes" aria-hidden="true">${confetes(28)}</div>
      <div class="cx">
        <span class="selo">${I('conquistas', { size: 70 })}</span>
        <p>${esc(il.conclusao)}</p>
        ${il.conclusaoExtra ? `<p class="extra">${esc(il.conclusaoExtra)}</p>` : ''}
        <span class="selo-tag">${esc(il.selo)}</span>
        <div class="btns">
          <button class="btn btn-t" id="btProx">${esc(il.conclusaoBtn)}</button>
          ${ultimaIlha ? '<button class="btn btn-ghost" id="btDiario2">Ver o Diário do Capitão</button>' : ''}
        </div>
      </div>
    </div>`,
      'ilhas'
    );
    // última ilha: o botão principal leva ao certificado (roteiro: "Imprimir meu certificado")
    $('#btProx').onclick = () => go(ultimaIlha ? '#/capitao/final' : '#/ilhas');
    const bd = $('#btDiario2');
    if (bd) bd.onclick = () => go('#/diario'); // roteiro: só na conclusão da jornada
  }

  NK.telas = Object.assign(NK.telas || {}, { conclusao: telaConclusao });
})();
