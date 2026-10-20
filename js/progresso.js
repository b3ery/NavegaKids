/* ============================================================
   NavegaKids — progresso.js
   Progresso: atividades feitas, erros, pontos, estrelas, selos,
   nome, personagem, nível e tempo jogado.

   O progresso fica salvo só neste navegador (localStorage): nada é
   enviado para fora do aparelho. Ao voltar, o Capitão Gancho pergunta
   se a criança quer continuar ou recomeçar (telas/jogador.js).
   Para testar a jornada inteira do zero, abra o jogo com ?novo=1:
   o que estava salvo é apagado e tudo começa como na primeira vez.

   Regras:
   - Uma fase libera a próxima quando todas as suas atividades são feitas.
   - Estrelas e pontos seguem js/pontuacao.js. Refazer uma atividade
     guarda sempre a MELHOR tentativa (a com menos erros).
   - Completar todas as fases de uma ilha dá o selo da ilha.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { FASES, ILHAS, pontuacao } = NK;

  const DEV = /[?&]dev=1/.test(location.search);   // ?dev=1 libera tudo (teste)
  const NOVO = /[?&]novo=1/.test(location.search); // ?novo=1 começa do zero (teste)
  const CHAVE_SALVO = 'navegakids-progresso';
  const TAMANHO_MAX_NOME = 20;

  /* Modos por idade (relato de testes): o Marujo (8 anos) responde sem tempo (o quiz
     cronometrado fica sem relógio) e tem textos curtos (js/textos-curtos.js); o
     Capitão (9 e 10 anos) mantém o desafio de 15 segundos. */
  const MODOS = Object.freeze({
    marujo:  Object.freeze({ id: 'marujo',  nome: 'Marujo',  idade: '8 anos',       semTempo: true,  vozAuto: true }),
    capitao: Object.freeze({ id: 'capitao', nome: 'Capitão', idade: '9 e 10 anos',  semTempo: false, vozAuto: false })
  });

  const estadoInicial = () => ({
    nome: '',
    avatar: 'usuario',   // personagem escolhido (usuario, usuario2, usuario3, usuario4)
    modo: 'capitao',     // 'marujo' | 'capitao' (ver MODOS)
    modoEscolhido: false,
    vozAuto: null,       // leitura automática: null = padrão do modo (Marujo liga, Capitão não)
    inicio: Date.now(),
    atividades: {},      // 'fase-indice' → { erros } da melhor tentativa
    selos: [],           // ids das ilhas com selo conquistado
    introVista: {},      // fases cuja introdução já foi vista
    prologoVisto: false, // introdução do Capitão Gancho (antes da Fase 1)
    faseVista: null      // fase aberta por último (usada na tela Missões)
  });

  const estado = estadoInicial();

  /* ---------- salvar e carregar (só neste navegador) ---------- */
  const salvar = () => {
    try {
      const { inicio, ...resto } = estado;
      localStorage.setItem(CHAVE_SALVO, JSON.stringify({ ...resto, tempoMs: Date.now() - inicio }));
    } catch (e) { /* navegador sem armazenamento (aba anônima, bloqueado): o jogo segue sem salvar */ }
  };
  const apagarSalvo = () => { try { localStorage.removeItem(CHAVE_SALVO); } catch (e) {} };
  /** true quando o jogo abriu com um progresso salvo de outra visita */
  let voltou = false;
  if (NOVO) apagarSalvo();
  else {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_SALVO) || 'null');
      if (salvo && typeof salvo === 'object') {
        const { tempoMs, ...resto } = salvo;
        Object.keys(estadoInicial()).forEach(k => { if (k in resto) estado[k] = resto[k]; });
        estado.inicio = Date.now() - (Number(tempoMs) || 0);   // o tempo jogado continua de onde parou
        voltou = Boolean(estado.nome || Object.keys(estado.atividades).length);
      }
    } catch (e) { apagarSalvo(); }
  }
  // o tempo jogado também é guardado quando a aba é fechada ou escondida
  addEventListener('pagehide', salvar);
  document.addEventListener('visibilitychange', () => { if (document.hidden) salvar(); });

  /** Atividade em andamento: { fid, idx, erros } ou null. */
  let tentativa = null;

  const chave = (fid, idx) => `${fid}-${idx}`;

  /* ---------- consultas: fases e ilhas ---------- */

  const faseById = (id) => FASES.find((f) => f.id === id);
  const ilhaById = (id) => ILHAS.find((i) => i.id === id);
  const fasesDaIlha = (iid) => FASES.filter((f) => f.ilha === iid);

  const feita = (fid, idx) => chave(fid, idx) in estado.atividades;
  const nFeitas = (fid) => faseById(fid).atividades.filter((_, idx) => feita(fid, idx)).length;
  const faseCompleta = (fid) => nFeitas(fid) === faseById(fid).atividades.length;
  const faseLiberada = (fid) => DEV || fid === 1 || faseCompleta(fid - 1);
  const ilhaCompleta = (iid) => fasesDaIlha(iid).every((f) => faseCompleta(f.id));
  const ilhaLiberada = (iid) => DEV || iid === 1 || ilhaCompleta(iid - 1);
  const faseAtual = () => FASES.find((f) => faseLiberada(f.id) && !faseCompleta(f.id)) ?? FASES.at(-1);
  const jornadaCompleta = () => FASES.every((f) => faseCompleta(f.id));
  const fasesConcluidas = () => FASES.filter((f) => faseCompleta(f.id)).length;

  /* ---------- consultas: pontos, estrelas, selos ---------- */

  const errosDaAtividade = (fid, idx) => estado.atividades[chave(fid, idx)]?.erros;

  /** { pontos, estrelas, maxEstrelas, erros } da fase — ou null se ainda não foi completada. */
  const resultadoDaFase = (fid) => {
    if (!faseCompleta(fid)) return null;
    const fase = faseById(fid);
    return pontuacao.calcular(fase, fase.atividades.map((_, idx) => errosDaAtividade(fid, idx)));
  };

  const estrelasTotal = () => FASES.reduce((soma, f) => soma + (resultadoDaFase(f.id)?.estrelas ?? 0), 0);
  const estrelasMax = () => FASES.reduce((soma, f) => soma + pontuacao.maxEstrelasDaFase(f), 0);

  /** Pontos contam a cada atividade feita (não só no fim da fase). */
  const pontosTotal = () => FASES.reduce((soma, f) =>
    soma + f.atividades.reduce((s, _, idx) =>
      s + (feita(f.id, idx) ? pontuacao.pontosDaAtividade(f, errosDaAtividade(f.id, idx)) : 0), 0), 0);

  const selos = () => ILHAS.filter((ilha) => estado.selos.includes(ilha.id));

  /** Level = fase em que o navegador está (1 a 15). */
  const level = () => Math.min(fasesConcluidas() + 1, FASES.length);

  const tempoJogadoMs = () => Date.now() - estado.inicio;

  /* ---------- sessão: nome e navegação ---------- */

  const nome = () => estado.nome;
  const AVATARES = Object.freeze(['usuario', 'usuario2', 'usuario3', 'usuario4']);
  const avatar = () => estado.avatar;
  const definirAvatar = (a) => { if (AVATARES.includes(a)) estado.avatar = a; };
  const definirNome = (novoNome) => { estado.nome = String(novoNome ?? '').trim().slice(0, TAMANHO_MAX_NOME); };

  const modo = () => estado.modo;
  const modoInfo = () => MODOS[estado.modo];
  const modoEscolhido = () => estado.modoEscolhido;
  const definirModo = (m) => {
    if (!MODOS[m]) return;
    if (m !== estado.modo) estado.vozAuto = null;   // trocou de nível: volta ao padrão de voz do nível
    estado.modo = m; estado.modoEscolhido = true;
  };
  /** Leitura automática ligada? Marujo (8 anos): sim, por padrão. Capitão: só se a criança ligar. */
  const vozAuto = () => estado.vozAuto ?? MODOS[estado.modo].vozAuto;
  const definirVozAuto = (ligada) => { estado.vozAuto = !!ligada; };
  /** Segundos do quiz cronometrado: os do roteiro (15 s) no Capitão; 0 (sem relógio) no Marujo. */
  const tempoDoQuiz = (base) => (modoInfo().semTempo ? 0 : base);
  /** Segundos do quiz da atividade: o cronometrado do roteiro (`tempo`) ou, só no Capitão,
      o desafio extra das missões (`tempoCapitao`) — relato: Marie achou fácil e amou o tempo. 0 = sem tempo. */
  const tempoDaAtividade = (a) => a.tempo ? tempoDoQuiz(a.tempo) : (estado.modo === 'capitao' && a.tempoCapitao) || 0;

  const introVista = (fid) => Boolean(estado.introVista[fid]);
  const marcarIntroVista = (fid) => { estado.introVista[fid] = true; };
  const prologoVisto = () => estado.prologoVisto;
  const marcarPrologoVisto = () => { estado.prologoVisto = true; };

  const faseVista = () => estado.faseVista;
  const definirFaseVista = (fid) => { estado.faseVista = fid; };

  /* ---------- atividade em andamento ---------- */

  /** Chamado ao abrir uma atividade: zera os erros da tentativa. */
  const iniciarAtividade = (fid, idx) => { tentativa = { fid, idx, erros: 0 }; };

  /** Chamado pelas atividades a cada resposta errada. */
  const registrarErro = () => { if (tentativa) tentativa.erros++; };

  const concederSeloSeCompletou = (iid) => {
    if (!ilhaCompleta(iid) || estado.selos.includes(iid)) return null;
    estado.selos.push(iid);
    return ilhaById(iid);
  };

  /**
   * Registra a atividade em andamento como feita.
   * @returns {{ jaFeita, erros, pontos, completouFase, resultadoFase, ilhaDoSelo }}
   */
  const concluirAtividade = () => {
    if (!tentativa) throw new Error('[NavegaKids] concluirAtividade() sem atividade em andamento.');
    const { fid, idx, erros } = tentativa;
    tentativa = null;

    const fase = faseById(fid);
    const anterior = estado.atividades[chave(fid, idx)];
    const faseJaEstavaCompleta = faseCompleta(fid);

    estado.atividades[chave(fid, idx)] = { erros: Math.min(anterior?.erros ?? Infinity, erros) };

    const completouFase = !faseJaEstavaCompleta && faseCompleta(fid);
    return {
      jaFeita: Boolean(anterior),
      erros,
      pontos: pontuacao.pontosDaAtividade(fase, erros),
      completouFase,
      resultadoFase: resultadoDaFase(fid),
      ilhaDoSelo: completouFase ? concederSeloSeCompletou(fase.ilha) : null
    };
  };

  const resetar = () => {
    Object.assign(estado, estadoInicial());
    tentativa = null;
    voltou = false;
  };

  /* toda função que muda o progresso salva logo em seguida */
  const salvando = fn => (...args) => { const r = fn(...args); salvar(); return r; };

  NK.progresso = {
    DEV,
    // fases e ilhas
    faseById, ilhaById, fasesDaIlha,
    feita, nFeitas, faseCompleta, faseLiberada, ilhaCompleta, ilhaLiberada,
    faseAtual, jornadaCompleta, fasesConcluidas,
    // pontos, estrelas, selos
    resultadoDaFase, estrelasTotal, estrelasMax, pontosTotal, selos, level, tempoJogadoMs,
    // sessão
    nome, definirNome: salvando(definirNome), AVATARES, avatar, definirAvatar: salvando(definirAvatar),
    MODOS, modo, modoInfo, modoEscolhido, definirModo: salvando(definirModo), vozAuto, definirVozAuto: salvando(definirVozAuto),
    tempoDoQuiz, tempoDaAtividade, introVista, marcarIntroVista: salvando(marcarIntroVista),
    prologoVisto, marcarPrologoVisto: salvando(marcarPrologoVisto), faseVista, definirFaseVista: salvando(definirFaseVista),
    // atividade em andamento
    iniciarAtividade, registrarErro, concluirAtividade: salvando(concluirAtividade),
    // salvo neste navegador
    voltou: () => voltou,
    resetar: salvando(resetar)
  };
})();
