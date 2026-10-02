/* ============================================================
   NavegaKids — activities.js
   Tela de atividade + renderização de cada tipo de exercício.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { NPC1, progresso, $, $$, esc, go, later, I, icone, comIcone, popup, montar, destacarContadores } = NK;
  const { faseById, faseLiberada, feita, DEV } = progresso;

  let AC = null; // contexto da atividade atual: {f, idx, a}

  function telaAtividade(path) {
    const [fid, idx] = path.split('/').map(Number);
    const f = faseById(fid);
    if (!f || !f.atividades[idx]) return go('#/missoes');
    if (!faseLiberada(fid)) { go('#/ilhas'); return; }
    if (!progresso.introVista(fid) && !DEV) { go(`#/abertura/${fid}`); return; }   // toda fase começa pela introdução
    if (idx > 0 && !feita(fid, idx - 1) && !DEV) { go('#/missoes'); return; }
    progresso.definirFaseVista(fid);
    const a = f.atividades[idx];
    AC = { f, idx, a };
    progresso.iniciarAtividade(fid, idx);

    montar(`
    <div class="scene atv" data-bg="fundo">
      <div class="topo">
        <div class="tt">
          <small>Fase ${f.id} · ${esc(f.titulo)} — Atividade ${idx + 1}/${f.atividades.length}</small>
          <h2>${esc(a.titulo)}</h2>
        </div>
        <div class="acoes">
          ${f.dobro ? NK.seloDobro('') : ''}
          <span class="chip-papel">${esc(a.papel)}</span>
          <button class="btn btn-sm btn-ghost" id="btSairAtv">Sair</button>
        </div>
      </div>
      <div class="palco" id="palco"></div>
    </div>`, 'missoes');

    $('#btSairAtv').onclick = () => go('#/missoes');
    renderAtividade();
  }

  function renderAtividade() {
    const { a } = AC;
    const palco = $('#palco');
    // animação de entrada em cascata só na abertura (os redesenhos depois de um clique não piscam)
    palco.classList.add('entrando');
    later(() => palco.classList.remove('entrando'), 1200);
    // os tipos se registram em NavegaKids.atividades (aqui e em activities2.js)
    (NK.atividades[a.tipo] || NK.atividades.discover)(palco, a);
  }

  /* Estrelas da fase (cheias + apagadas), mostradas quando a fase acaba de ser completada */
  function estrelasDaFaseHtml({ estrelas, maxEstrelas }, fase) {
    const mult = NK.pontuacao.multiplicador(fase);
    const base = estrelas / mult, maxBase = maxEstrelas / mult;   // estrelas antes do dobro
    const icones = Array.from({ length: maxBase }, (_, i) =>
      I('estrela', { size: 34, cls: i < base ? '' : 'apagada' })).join('');
    return `<div class="fase-estrelas ${mult > 1 ? 'dobro' : ''}" role="img" aria-label="Fase concluída com ${estrelas} de ${maxEstrelas} estrelas${mult > 1 ? ' (estrelas em dobro)' : ''}">
      <span>Fase concluída!</span><span class="icones">${icones}</span>
      ${mult > 1 ? `<span class="conta-dobro">${base} × ${mult} = <b>${estrelas} estrelas!</b></span>` : ''}
    </div>`;
  }

  /* chamado quando o jogador concluiu a atividade com sucesso */
  function concluirAtividade(mensagemExtra) {
    const { f, idx } = AC;
    const r = progresso.concluirAtividade();
    NK.som?.vitoria(r.completouFase);
    destacarContadores();
    const total = f.atividades.length;
    const faseAgoraCompleta = progresso.faseCompleta(f.id);

    popup({
      cor: 't', dim: true,
      titulo: r.jaFeita ? 'Muito bem de novo!' : 'Parabéns, Pirata!',
      texto: (mensagemExtra ? mensagemExtra + ' ' : '') + (r.jaFeita
        ? 'Você já tinha concluído esta atividade.'
        : 'Você desbloqueou mais uma atividade, continue navegando pirata!'),
      extra: `<div class="estrela-mais">${I('moedas', { size: 26 })} +${r.pontos} PONTOS${f.dobro ? ' <span class="x2-pontos">x2</span>' : ''}</div>`
        + (r.completouFase ? estrelasDaFaseHtml(r.resultadoFase, f) : '')
        + (r.ilhaDoSelo ? `<p class="selo-ganho">${I(r.ilhaDoSelo.seloImg, { size: 34 })} Selo conquistado: ${esc(r.ilhaDoSelo.selo)}!</p>` : ''),
      btns: [{
        t: faseAgoraCompleta ? 'Ver conquista da fase' : (idx + 1 < total ? 'Próxima atividade' : 'Voltar às missões'),
        cls: 'btn-t',
        fn: () => {
          if (faseAgoraCompleta) { go('#/missoes'); }
          else if (idx + 1 < total) { go(`#/atividade/${f.id}/${idx + 1}`); }
          else { go('#/missoes'); }
        }
      }]
    });
  }

  /* ============================================================
     BLOCO REUTILIZÁVEL: chat de cena
     ============================================================ */
  function chatHtml(cena) {
    if (!cena || cena.tipo !== 'chat') return '';
    // bolha da criança leva o nome dela (ou "Você"); nunca o nick do contato
    const quem = m => m.nome || (m.de === 'eu' ? progresso.nome() || 'Você' : cena.com);
    const msgs = cena.msgs.map(m => `
      <div class="bolha ${m.de === 'eu' ? 'eu' : ''}">
        <span class="av">${m.de === 'eu' ? I('usuario') : I('anonimo')}</span>
        <span class="msg">${quem(m) ? `<small>${esc(quem(m))}</small>` : ''}${esc(m.t)}</span>
      </div>`).join('');
    return `<div class="chat">
      <div class="chat-head">${I('anonimo', { size: 34, cls: 'ico' })}<span>${esc(cena.com)}</span><small>online</small></div>
      <div class="chat-body">${msgs}</div>
    </div>`;
  }

  function lobbyHtml(cena) {
    if (!cena || cena.tipo !== 'lobby') return '';
    const av = cena.avatares.map(a => `<div class="av-card ${a.alerta ? 'alerta' : ''}">
      ${I('anonimo', { size: 44 })}<div>${esc(a.nome)}</div>${a.nota ? `<small>${esc(a.nota)}</small>` : ''}
    </div>`).join('');
    return `<div class="lobby"><h4>${esc(cena.titulo)}</h4><div class="av-lista">${av}</div></div>`;
  }

  function guardioesHtml() {
    return `<div class="guardioes">
      <div class="cap"><div class="pirata">${I('pirata')}</div>Capitã Bússola</div>
      <div class="cham">
        Um guardião é um adulto que você conhece de verdade, cuida de você e em quem você confia.
        <ul><li>${I('usuario', { cls: 'ico-txt' })} Mãe / Pai / Responsável</li><li>${I('usuario', { cls: 'ico-txt' })} Professora</li><li>${I('usuario', { cls: 'ico-txt' })} Avó / Avô</li><li>${I('usuario', { cls: 'ico-txt' })} Tio / Tia</li><li>${I('pedidoAmizade', { cls: 'ico-txt' })} Outro adulto de confiança</li></ul>
      </div>
    </div>`;
  }

  function cenaSuporte(a) {
    const c = a.cena;
    if (!c) return '';
    if (c.tipo === 'chat') return chatHtml(c);
    if (c.tipo === 'lobby') return lobbyHtml(c);
    if (c.tipo === 'guardioes') return guardioesHtml();
    if (c.tipo === 'jogo') return jogoHtml();
    return '';
  }

  function jogoHtml(pendente) {
    const AMIGOS = [
      { nome: 'Pirata2020', online: true },
      { nome: 'Pirata2130', online: true },
      { nome: 'Sereia0101', online: false },
      { nome: 'Peixinho01', online: false },
    ];
    return `<div class="jg">
      <div class="jg-top">
        <button class="jg-chip" data-info="usuario">${I('utilizador', { size: 26 })}<span>Pirata0101</span></button>
        <button class="jg-chip" data-info="level">${I('levelup', { size: 22 })}<span>LEVEL 58</span></button>
        <button class="jg-chip" data-info="moedas">${I('moedas', { size: 22 })}<span>520</span></button>
        <div class="dir">
          <button class="jg-notif" id="jgNotif" ${pendente ? 'style="display:none"' : ''}>${I('pedidoAmizade', { size: 26 })}<span class="badge">1</span></button>
          ${I('config', { size: 26 })}
        </div>
      </div>
      <div class="jg-body">
        <div class="jg-left">
          <small>Jogo Online</small>
          <div class="jg-grid">${'<i></i>'.repeat(4)}</div>
          <div class="pirata">${I('usuario')}</div>
          <button class="btn btn-sm ${pendente ? 'btn-t' : 'btn-off'}" id="btInvestigar" ${pendente ? '' : 'disabled'}>Começar a investigar</button>
        </div>
        <div class="jg-side" id="jgSide">
          ${pendente ? `
          <h4>Pendentes</h4>
          <div class="pedido">
            <div class="l">${I('utilizador', { size: 26 })}<span>${esc(NPC1)}</span></div>
            <div>Olá, Pirata, poderia me adicionar? Quero ser seu amigo!</div>
            <div class="bt"><button class="s" data-op="0">SIM</button><button class="n" data-op="1">NÃO</button></div>
          </div>` : `<h4>Amigos</h4><ul class="lista-amigos">${AMIGOS.map(a => `
            <li>${I('utilizador', { size: 26 })}${a.online ? '<i class="online-dot"></i>' : ''}<span>${esc(a.nome)}</span></li>
          `).join('')}</ul>`}
        </div>
      </div>
    </div>`;
  }

  /* ============================================================
     DISCOVER — leitura guiada de uma cena
     ============================================================ */
  function rDiscover(palco, a) {
    palco.innerHTML = `
      <p class="enunciado">${esc(a.titulo)}</p>
      ${cenaSuporte(a)}
      ${a.texto ? `<p class="texto-cena">${esc(a.texto)}</p>` : ''}
      ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
      <div class="rodape"><button class="btn btn-t" id="btAvancarDisc">Avançar</button></div>`;
    $('#btAvancarDisc').onclick = () => concluirAtividade();
  }

  /* ============================================================
     EXPLAIN — vídeo explicativo (campo "video" em data.js)
     ============================================================ */
  function rExplain(palco, a) {
    palco.innerHTML = `
      ${a.video
        ? `<video class="video-fase" src="${esc(a.video)}" controls playsinline preload="metadata"></video>`
        : `<div class="video-placeholder">
        <div class="play-ic">▶</div>
        <b>Vídeo no futuro</b>
      </div>`}
      <p class="video-legenda">${esc(a.slides?.[0]?.txt || '')}</p>
      <div class="rodape">
        <button class="btn btn-t" id="btProxSl">Concluir</button>
      </div>`;
    $('#btProxSl').onclick = () => concluirAtividade();
  }

  /* ============================================================
     CHOICE (tutorial) — exploração guiada da Fase 1 / Atividade 1:
     toca nos ícones pra entender a tela, acha a notificação, decide.
     ============================================================ */
  function rTutorialChoice(palco, a) {
    const INFO = {
      usuario: ['Este é o seu usuário', 'Aqui aparece seu nome de navegador dentro do jogo.'],
      level: ['Aqui é seu level', 'Mostra o quanto você já avançou nas aventuras.'],
      moedas: ['Aqui são suas moedas', 'Você troca moedas por itens especiais no jogo.']
    };

    function desenharExploracao() {
      palco.innerHTML = `
        <p class="enunciado">Explore a tela até encontrar algo importante.</p>
        ${jogoHtml(false)}`;
      $$('.jg-chip', palco).forEach(chip => chip.onclick = () => {
        const [titulo, texto] = INFO[chip.dataset.info];
        popup({ cor: 'y', titulo, texto, btns: [{ t: 'Entendi', cls: 'btn-t', fn() {} }] });
      });
      $('#jgNotif').onclick = () => {
        popup({
          cor: 'y', titulo: I('luneta', { cls: 'ico-txt' }) + ' ' + esc(AC.f?.titulo || 'Perfil Misterioso..?'),
          texto: a.dica,
          btns: [{ t: 'Avançar', cls: 'btn-t', fn: desenharPendentes }]
        });
      };
    }

    function desenharPendentes() {
      palco.innerHTML = `
        <p class="enunciado">${esc(a.titulo)}</p>
        ${jogoHtml(true)}
        <div class="quiz-fb" id="fbChoice" style="display:none"></div>
        <div class="rodape" id="rodapeChoice"></div>`;
      $('#btInvestigar').onclick = () => popup({
        cor: 'y', titulo: I('luneta', { cls: 'ico-txt' }) + ' Perfil Misterioso..?', texto: a.dica,
        btns: [{ t: 'Entendi', cls: 'btn-t', fn() {} }]
      });
      $$('.pedido button', palco).forEach(b => b.onclick = () => {
        const o = a.opcoes[+b.dataset.op];
        $$('.pedido button', palco).forEach(x => x.disabled = true);
        const fb = $('#fbChoice');
        fb.style.display = 'block';
        fb.className = 'quiz-fb ' + (o.ok ? 'ok' : 'ruim');
        NK.som?.[o.ok ? 'acerto' : 'erro']();
        fb.textContent = o.fb;
        if (o.ok) {
          $('#rodapeChoice').innerHTML = `<button class="btn btn-t" id="btOkChoice">Continuar</button>`;
          $('#btOkChoice').onclick = () => concluirAtividade();
        } else {
          progresso.registrarErro();
          $('#rodapeChoice').innerHTML = `<button class="btn btn-c" id="btDeNovo">Tentar de novo</button>`;
          $('#btDeNovo').onclick = () => desenharPendentes();
        }
      });
    }

    desenharExploracao();
  }

  /* ============================================================
     CHOICE — escolha simples (com ou sem cena)
     ============================================================ */
  function rChoice(palco, a) {
    if (a.tutorial) return rTutorialChoice(palco, a);
    const cartas = a.skin === 'cartas';
    palco.innerHTML = `
      ${cenaSuporte(a)}
      <p class="enunciado" style="margin-top:14px">${esc(a.pergunta || '')}</p>
      ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
      <div class="opcoes ${cartas ? 'cartas' : ''}" id="opcoesWrap">
        ${a.opcoes.map((o, i) => `<button class="opcao" data-i="${i}">
          ${o.tag ? `<span class="tag">${esc(o.tag)}</span>` : ''}
          ${o.img ? `<span class="e-big">${icone(o)}</span>` : ''}
          <span>${esc(o.t)}</span>
        </button>`).join('')}
      </div>
      <div class="quiz-fb" id="fbChoice" style="display:none"></div>
      <div class="rodape" id="rodapeChoice"></div>`;

    $$('.opcao', palco).forEach(b => b.onclick = () => {
      if (b.disabled) return;
      const o = a.opcoes[+b.dataset.i];
      $$('.opcao', palco).forEach(x => x.disabled = true);
      const fb = $('#fbChoice');
      fb.style.display = 'block';
      fb.className = 'quiz-fb ' + (o.ok ? 'ok' : 'ruim');
        NK.som?.[o.ok ? 'acerto' : 'erro']();
      fb.textContent = o.fb;
      if (o.ok) {
        b.classList.add('certa');
        $('#rodapeChoice').innerHTML = `<button class="btn btn-t" id="btOkChoice">Continuar</button>`;
        $('#btOkChoice').onclick = () => concluirAtividade();
      } else {
        progresso.registrarErro();
        b.classList.add('errada'); b.classList.add('shake');
        $('#rodapeChoice').innerHTML = `<button class="btn btn-c" id="btDeNovo">Tentar de novo</button>`;
        $('#btDeNovo').onclick = () => rChoice(palco, a);
      }
    });
  }

  /* ============================================================
     DOORS — Porta Secreta (segura ou arriscada)
     ============================================================ */
  function rDoors(palco, a) {
    let acertos = new Set();
    const draw = () => {
      palco.innerHTML = `
        <p class="enunciado">${esc(a.pergunta)}</p>
        ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
        <p class="prog-hunt">Portas abertas: <b>${acertos.size}/${a.portas.length}</b></p>
        <div class="opcoes" id="portasWrap">
          ${a.portas.map((p, i) => `<button class="opcao" data-i="${i}" ${acertos.has(i) ? 'disabled' : ''}>
            <span class="e">${icone(p)}</span><span>${esc(p.t)}</span>
          </button>`).join('')}
        </div>
        <div class="dica-flutua" id="fbPorta"></div>`;
      $$('.opcao', palco).forEach(b => b.onclick = () => {
        const i = +b.dataset.i, p = a.portas[i];
        const fb = $('#fbPorta');
        fb.innerHTML = p.seguro ? comIcone('correto', 'Segura! ' + p.why) : comIcone('atencao', 'Arriscada! ' + p.why);
        NK.som?.acerto();   // abrir a porta é descoberta, não erro
        fb.className = 'dica-flutua ' + (p.seguro ? 'boa' : 'ruim');
        acertos.add(i);
        if (acertos.size === a.portas.length) {
          later(() => concluirAtividade(a.fbOk), 700);
        }
        draw();
        $('#fbPorta').innerHTML = p.seguro ? comIcone('correto', 'Segura! ' + p.why) : comIcone('atencao', 'Arriscada! ' + p.why);
        $('#fbPorta').className = 'dica-flutua ' + (p.seguro ? 'boa' : 'ruim');
      });
    };
    draw();
  }

  /* ============================================================
     BLOCK — ativar o escudo (bloquear)
     ============================================================ */
  function rBlock(palco, a) {
    palco.innerHTML = `
      ${cenaSuporte(a)}
      <div class="rodape" style="margin-top:16px">
        <button class="btn btn-c escudo-btn" id="btBloquear">${I('escudo', { size: 26 })} ${esc(a.botao)}</button>
      </div>`;
    $('#btBloquear').onclick = () => {
      NK.som?.acerto();
      $('#palco').innerHTML = `<div class="bloqueado-selo">${I('escudo', { size: 80 })}<p>Escudo ativado!</p></div>`;
      later(() => concluirAtividade(a.fbOk), 900);
    };
  }

  NK.atividades = { discover: rDiscover, explain: rExplain, choice: rChoice, doors: rDoors, block: rBlock };
  Object.assign(NK, { telaAtividade, concluirAtividade });
})();
