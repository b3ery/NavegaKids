/* ============================================================
   NavegaKids — pontuacao.js
   Regras de pontos e estrelas. Funções "puras": só fazem contas,
   não guardam estado nem mexem na tela.
   Para mudar as regras do jogo, altere só o objeto REGRAS.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});

  const REGRAS = Object.freeze({
    PONTOS_POR_ATIVIDADE: 10,
    PENALIDADE_POR_ERRO: 3,
    PONTOS_MINIMOS_POR_ATIVIDADE: 4,

    /** Estrelas da fase pelo total de erros. Quem passar da última faixa ganha ESTRELAS_MINIMAS. */
    FAIXAS_DE_ESTRELAS: Object.freeze([
      Object.freeze({ ateErros: 0, estrelas: 3 }),
      Object.freeze({ ateErros: 2, estrelas: 2 })
    ]),
    ESTRELAS_MINIMAS: 1,

    /** Fases com `dobro: true` (5, 10 e 15) multiplicam estrelas e pontos. */
    MULTIPLICADOR_DOBRO: 2
  });

  const ESTRELAS_MAXIMAS = REGRAS.FAIXAS_DE_ESTRELAS[0].estrelas;

  const multiplicador = (fase) => (fase.dobro ? REGRAS.MULTIPLICADOR_DOBRO : 1);

  const somar = (numeros) => numeros.reduce((soma, n) => soma + n, 0);

  const estrelasPorErros = (totalErros) =>
    REGRAS.FAIXAS_DE_ESTRELAS.find((faixa) => totalErros <= faixa.ateErros)?.estrelas ?? REGRAS.ESTRELAS_MINIMAS;

  /** Pontos de UMA atividade concluída com `erros` erros (já com o dobro, se houver). */
  const pontosDaAtividade = (fase, erros) =>
    Math.max(REGRAS.PONTOS_MINIMOS_POR_ATIVIDADE, REGRAS.PONTOS_POR_ATIVIDADE - erros * REGRAS.PENALIDADE_POR_ERRO)
    * multiplicador(fase);

  const maxEstrelasDaFase = (fase) => ESTRELAS_MAXIMAS * multiplicador(fase);

  /**
   * Resultado de uma fase completa.
   * @param {object} fase                 fase de data.js
   * @param {number[]} errosPorAtividade  ex.: [0, 2, 1]
   * @returns {{ pontos: number, estrelas: number, maxEstrelas: number, erros: number }}
   */
  const calcular = (fase, errosPorAtividade) => {
    const erros = somar(errosPorAtividade);
    return {
      pontos: somar(errosPorAtividade.map((e) => pontosDaAtividade(fase, e))),
      estrelas: estrelasPorErros(erros) * multiplicador(fase),
      maxEstrelas: maxEstrelasDaFase(fase),
      erros
    };
  };

  NK.pontuacao = { REGRAS, calcular, pontosDaAtividade, maxEstrelasDaFase };
})();
