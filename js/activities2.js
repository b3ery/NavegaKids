/* ============================================================
   NavegaKids — activities2.js
   Tipos: classify · hunt · sequence · compose · quiz · match · bau
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { NPC1, progresso, $, $$, esc, later, every, shuffle, I, icone, comIcone, concluirAtividade } = NK;

  /* ============================================================
     CLASSIFY — arrastar (ou tocar) para o balde certo
     ============================================================ */
  function rClassify(palco, a) {
    const itens = a.itens.map((it, i) => ({ ...it, id: i, colocado: null }));
    let selecionado = null;

    const itemHtml = it => `<button class="item" draggable="true" data-id="${it.id}">
      ${it.img ? `<span class="e">${icone(it)}</span>` : ''}
      <span>${esc(it.t)}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span>
    </button>`;

    const draw = () => {
      const soltos = itens.filter(i => i.colocado === null);
      palco.innerHTML = `
        <p class="enunciado">${esc(a.pergunta)}</p>
        ${NK.dicaHtml(a.dica)}
        <div class="baldes">
          ${a.baldes.map(b => `
            <div class="balde alvo" data-b="${b.id}">
              <h4>${b.img ? `<span>${icone(b)}</span>` : ''}${esc(b.t)}</h4>
              ${b.sub ? `<small>${esc(b.sub)}</small>` : ''}
              <div class="dentro">${itens.filter(i => i.colocado === b.id).map(i => `<span class="item no-balde">${esc(i.t)} ${I('correto', { cls: 'ico-txt' })}</span>`).join('')}</div>
            </div>`).join('')}
        </div>
        <div class="itens" id="itensWrap">${soltos.length ? soltos.map(itemHtml).join('') : '<span style="font-weight:800;color:#1c9f8d">Tudo classificado!</span>'}</div>
        <div class="dica-flutua" id="fbClass"></div>`;

      // clique: seleciona um item e depois toca no balde (acessível em touch)
      $$('.item[draggable]', palco).forEach(el => {
        el.onclick = () => {
          $$('.item[draggable]', palco).forEach(x => x.classList.remove('sel'));
          if (selecionado === +el.dataset.id) { selecionado = null; return; }
          selecionado = +el.dataset.id;
          el.classList.add('sel');
        };
        el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', el.dataset.id); el.classList.add('drag'); });
        el.addEventListener('dragend', () => el.classList.remove('drag'));
      });

      $$('.balde', palco).forEach(b => {
        b.onclick = () => tentar(b.dataset.b);
        b.addEventListener('dragover', e => { e.preventDefault(); b.classList.add('over'); });
        b.addEventListener('dragleave', () => b.classList.remove('over'));
        b.addEventListener('drop', e => {
          e.preventDefault(); b.classList.remove('over');
          const id = +e.dataTransfer.getData('text/plain');
          tentar(b.dataset.b, id);
        });
      });

      function tentar(baldeId, itemId) {
        const id = itemId !== undefined ? itemId : selecionado;
        if (id === null || id === undefined) return;
        const it = itens.find(i => i.id === id);
        const fb = $('#fbClass');
        if (it.b === baldeId) {
          it.colocado = baldeId;
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', 'Isso mesmo!'); NK.feedback.acerto();
          selecionado = null;
          draw();
          if (itens.every(i => i.colocado !== null)) later(() => concluirAtividade(a.fbOk), 500);
        } else {
          progresso.registrarErro(); NK.feedback.erro();
          fb.className = 'dica-flutua ruim'; fb.innerHTML = comIcone('falha', 'Ainda não... tente outro grupo!');
          const card = $(`.item[data-id="${id}"]`, palco);
          if (card) card.classList.add('shake');
        }
      }
    };
    draw();
  }

  /* ============================================================
     HUNT — achar pistas/sinais numa cena, chat, app ou perfil
     ============================================================ */
  /* Fases 8 e 13 · achar o botão: um aplicativo de mensagens dentro de um celular. Os botões
     ficam onde os apps costumam pôr: metade no cabeçalho, metade na barra de baixo. */
  function celularHtml(round) {
    const bts = round.itens.map((it, i) => `<button class="bt-app" data-i="${i}" title="${esc(it.t)}" aria-label="${esc(it.t)}">${icone(it)}</button>`);
    const meio = Math.ceil(bts.length / 2);
    return `<div class="celular">
      <div class="cel-status"><span>9:41</span><i class="cel-notch"></i><span>${esc(round.titulo || 'Aplicativo')}</span></div>
      <div class="cel-topo">
        <span class="cel-voltar" aria-hidden="true">‹</span>
        <span class="cel-av">${I('anonimo', { size: 28 })}</span>
        <span class="cel-nome"><b>${esc(round.contato || 'Contato')}</b><small>online</small></span>
        <span class="cel-acoes">${bts.slice(0, meio).join('')}</span>
      </div>
      <div class="cel-conversa">
        ${(round.msgs || []).map(m => `<span class="cel-msg">${esc(m)}</span>`).join('')}
      </div>
      <div class="cel-base"><span class="cel-acoes">${bts.slice(meio).join('')}</span><span class="cel-campo">Mensagem…</span></div>
    </div>`;
  }

  /* Fase 1: os 3 amigos do perfil suspeito (nenhum é amigo da criança: "nenhum amigo em comum") */
  const AMIGOS_DO_SUSPEITO = ['Lobo_Sombrio', 'Kraken_77', 'Anonimo_99'];

  /* Fase 1 · Detetive do Perfil: perfil de jogo de verdade (banner, avatar, nível, números,
     bio e mensagem do pedido). Cada parte é uma zona clicável ligada a uma pista de data.js
     pelo campo "zona"; a criança investiga com o cursor de lupa. */
  function perfilJogoHtml(itens) {
    const zona = (nome, html, cls = '') => {
      const i = itens.findIndex(it => it.zona === nome);
      return i < 0 ? html : `<button class="linha-pista zona-perfil zona-${nome} ${cls}" data-i="${i}" aria-label="Investigar: ${esc(itens[i].t)}">
        ${html}<span class="zona-tag" aria-hidden="true">${esc(itens[i].t)}</span></button>`;
    };
    return `<div class="perfil-jogo">
      <div class="pj-banner"><span class="pj-pendente">Pedido de amizade pendente</span></div>
      <div class="pj-topo">
        ${zona('foto', `<span class="pj-avatar">${I('anonimo')}</span><small>sem foto</small>`)}
        <div class="pj-nome"><b>${esc(NPC1)}</b>
          <span class="pj-linha"><span class="pj-nivel">Nv. 2</span><span class="pj-online"><i></i>online</span></span></div>
      </div>
      ${zona('conta', `<span class="pj-stats">
          <span><b>3</b><small>amigos</small></span>
          <span><b>2 dias</b><small>conta criada</small></span>
          <span><b>1</b><small>partida</small></span></span>`)}
      ${zona('amigos', `<span class="pj-sec"><small>Amigos em comum</small><b class="pj-zero">0</b></span>
          <span class="amigos-dele">${AMIGOS_DO_SUSPEITO.map(n => `<span>${I('anonimo', { size: 18 })}${esc(n)}</span>`).join('')}</span>`)}
      ${zona('bio', `<span class="pj-sec"><small>Bio</small></span><span class="pj-bio">Amo jogos de pirata! Bora jogar juntos?</span>`)}
      ${zona('mensagem', `<span class="pj-sec"><small>Mensagem do pedido</small></span><span class="pj-msg">Olá, Pirata, poderia me adicionar? Quero ser seu amigo!</span>`)}
    </div>`;
  }

  function rHunt(palco, a) {
    let rIdx = 0;

    const drawRound = () => {
      const round = a.rounds[rIdx];
      const achadas = new Set();
      const alvo = round.itens.filter(i => i.ok).length;

      const cabecalhoRound = round.titulo ? `<p class="texto-cena" style="margin-bottom:8px"><b>${esc(round.titulo)}</b></p>` : '';

      if (a.skin === 'perfil') {
        palco.innerHTML = `
          <p class="enunciado">${esc(a.pergunta)}</p>
          ${NK.dicaHtml(a.dica)}
          <p class="prog-hunt">Pistas encontradas: <b id="cntHunt">0</b>/${alvo}</p>
          ${NK.jogoDetetiveHtml(perfilJogoHtml(round.itens))}
          <div class="dica-flutua" id="fbHunt"></div>`;
      } else if (a.skin === 'chat') {
        palco.innerHTML = `
          <p class="enunciado">${esc(a.pergunta)}</p>
          ${NK.dicaHtml(a.dica)}
          <p class="prog-hunt">Sinais encontrados: <b id="cntHunt">0</b>/${alvo}</p>
          <div class="chat">
            <div class="chat-head">${I('anonimo', { size: 34 })}<span>${esc(a.com)}</span><small>online</small></div>
            <div class="chat-body">${round.itens.map((it, i) => `<button class="bolha" data-i="${i}"><span class="av">${I('anonimo')}</span><span class="msg">${esc(it.t)}</span></button>`).join('')}</div>
          </div>
          <div class="dica-flutua" id="fbHunt"></div>`;
      } else if (a.skin === 'app') {
        palco.innerHTML = `
          <p class="enunciado">${esc(a.pergunta)}</p>
          ${NK.dicaHtml(a.dica)}
          <p class="prog-hunt">Rodada ${rIdx + 1}/${a.rounds.length} — encontrados: <b id="cntHunt">0</b>/${alvo}</p>
          ${celularHtml(round)}
          <div class="dica-flutua" id="fbHunt"></div>`;
      } else {
        // skin "scene": cena livre com pontos posicionados
        palco.innerHTML = `
          <p class="enunciado">${esc(a.pergunta)}</p>
          ${NK.dicaHtml(a.dica)}
          <p class="prog-hunt">Encontrados: <b id="cntHunt">0</b>/${alvo}</p>
          <div class="cena-hunt mapa-perg">
            <svg class="mapa-deco" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 50 C 18 40, 22 18, 38 22 S 60 48, 72 34 S 88 10, 96 14" />
            </svg>
            <span class="mapa-rosa" aria-hidden="true">N</span>
            <span class="mapa-x" aria-hidden="true">✕</span>
            ${round.itens.map((it, i) => `<button class="pista-btn" data-i="${i}" style="left:${it.x}%;top:${it.y}%" aria-label="${esc(it.t)}">${icone(it)}</button>`).join('')}
          </div>
          <div class="dica-flutua" id="fbHunt"></div>`;
      }

      const seletor = a.skin === 'perfil' ? '.linha-pista' : a.skin === 'chat' ? '.bolha' : a.skin === 'app' ? '.bt-app' : '.pista-btn';

      $$(seletor, palco).forEach(el => el.onclick = () => {
        if (el.classList.contains('achada') || el.classList.contains('errada')) return;
        const i = +el.dataset.i, it = round.itens[i];
        const fb = $('#fbHunt');
        if (it.ok) {
          el.classList.add('achada');
          if (a.skin === 'chat') el.insertAdjacentHTML('beforeend', `<span class="stop">${I('pare')}</span>`);   // roteiro: aparece o STOP ao acertar
          achadas.add(i);
          $('#cntHunt').textContent = achadas.size;
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', it.why); NK.feedback.acerto();
          if (achadas.size === alvo) {
            later(() => {
              if (rIdx + 1 < a.rounds.length) { rIdx++; drawRound(); }
              else concluirAtividade(a.fbOk);
            }, 700);
          }
        } else {
          if (a.skin !== 'app') progresso.registrarErro();   // no "app" a criança está explorando a tela
          NK.feedback.erro();
          el.classList.add('errada'); el.classList.add('shake');
          fb.className = 'dica-flutua ruim'; fb.innerHTML = comIcone('nao', it.why);
          later(() => el.classList.remove('errada', 'shake'), 700);
        }
      });
    };
    drawRound();
  }

  /* ============================================================
     SEQUENCE — montar a sequência certa
     ============================================================ */
  function rSequence(palco, a) {
    const passos = a.passos.map((p, i) => ({ ...p, id: i }));
    const ordem = shuffle(passos);
    const slots = new Array(passos.length).fill(null);

    const draw = () => {
      palco.innerHTML = `
        <p class="enunciado">${esc(a.pergunta)}</p>
        ${NK.dicaHtml(a.dica)}
        <div class="seq-slots">
          ${slots.map((s, i) => `<div class="slot ${s !== null ? 'cheio' : ''}" data-s="${i}" ${s !== null ? 'role="button" tabindex="0" aria-label="Tirar este cartão"' : ''}>
            <span class="n">${i + 1}</span>
            ${s !== null ? `<span class="e">${icone(passos[s])}</span><span>${esc(passos[s].t)}</span><span class="tirar" aria-hidden="true">×</span>` : '<span style="color:#999">toque para preencher</span>'}
          </div>`).join('')}
        </div>
        <div class="cartoes">
          ${ordem.map(p => `<button class="cartao ${slots.includes(p.id) ? 'usado' : ''}" data-c="${p.id}">
            <span class="e">${icone(p)}</span><span>${esc(p.t)}</span>
          </button>`).join('')}
        </div>
        <div class="dica-flutua" id="fbSeq"></div>
        <div class="rodape"><button class="btn btn-ghost" id="btLimparSeq">Limpar</button></div>`;

      $$('.cartao', palco).forEach(c => c.onclick = () => {
        if (c.classList.contains('usado')) return;
        const livre = slots.findIndex(s => s === null);
        if (livre === -1) return;
        slots[livre] = +c.dataset.c;
        checar();
      });
      $$('.slot', palco).forEach(s => s.onclick = () => {
        const i = +s.dataset.s;
        if (slots[i] !== null) { slots[i] = null; draw(); }
      });
      $$('.slot.cheio', palco).forEach(s => s.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.click(); } });
      $('#btLimparSeq').onclick = () => { slots.fill(null); draw(); };

      function checar() {
        if (slots.includes(null)) { draw(); return; }
        const certo = slots.every((id, i) => id === i);
        const fb = $('#fbSeq');
        if (certo) {
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', 'Sequência perfeita!'); NK.feedback.acerto();
          draw();
          later(() => concluirAtividade(a.fbOk), 700);
        } else {
          progresso.registrarErro(); NK.feedback.erro();
          fb.className = 'dica-flutua ruim'; fb.innerHTML = comIcone('falha', 'Ainda não é essa ordem... tente de novo!');
          draw();
          later(() => { slots.fill(null); draw(); }, 900);
        }
      }
    };
    draw();
  }

  /* ============================================================
     COMPOSE — montar frase com blocos (um de cada grupo)
     ============================================================ */
  function rCompose(palco, a) {
    const escolha = new Array(a.grupos.length).fill(null);

    const draw = () => {
      palco.innerHTML = `
        <p class="enunciado">${esc(a.pergunta)}</p>
        ${NK.dicaHtml(a.dica)}
        ${a.grupos.map((g, gi) => `
          <div class="grupo">
            <h4>${esc(g.label)}</h4>
            <div class="blocos">
              ${g.blocos.map((b, bi) => `<button class="bloco ${escolha[gi] === bi ? 'on' : ''}" data-g="${gi}" data-b="${bi}">${esc(b.t)}</button>`).join('')}
            </div>
          </div>`).join('')}
        <div class="preview-msg">
          <div class="chat">
            <div class="chat-head">${I('usuario', { size: 30 })}<span>Sua mensagem</span></div>
            <div class="chat-body">
              <div class="bolha eu"><span class="av">${I('usuario')}</span><span class="msg">${
                escolha.some(e => e === null) ? '<i style="color:#999">escolha um bloco de cada grupo…</i>'
                : esc(a.grupos.map((g, gi) => g.blocos[escolha[gi]].t).join(' '))
              }</span></div>
            </div>
          </div>
        </div>
        <div class="dica-flutua" id="fbComp"></div>
        <div class="rodape">
          <button class="btn btn-t" id="btEnviarFrase" ${escolha.some(e => e === null) ? 'disabled' : ''}>Enviar mensagem</button>
        </div>`;

      // tocar de novo no bloco escolhido desmarca (relato de teste: não dava para desmarcar)
      $$('.bloco', palco).forEach(b => b.onclick = () => {
        const g = +b.dataset.g, bi = +b.dataset.b;
        escolha[g] = escolha[g] === bi ? null : bi;
        draw();
      });

      const btEnv = $('#btEnviarFrase');
      if (btEnv) btEnv.onclick = () => {
        const okTudo = a.grupos.every((g, gi) => g.blocos[escolha[gi]].ok);
        const fb = $('#fbComp');
        // roteiro: feedback com [Avançar] no acerto e [Voltar] para tentar de novo
        $$('.bloco', palco).forEach(b => b.disabled = true);
        const rod = $('.rodape', palco);
        if (okTudo) {
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', a.fbOk || 'Ótima mensagem!'); NK.feedback.acerto();
          rod.innerHTML = `<button class="btn btn-t" id="btAvancarFrase">Avançar</button>`;
          $('#btAvancarFrase').onclick = () => concluirAtividade();
        } else {
          progresso.registrarErro(); NK.feedback.erro();
          fb.className = 'dica-flutua ruim'; fb.innerHTML = comIcone('falha', a.fbBad || 'Vamos tentar outra combinação.');
          rod.innerHTML = `<button class="btn btn-c" id="btVoltarFrase">Voltar</button>`;
          $('#btVoltarFrase').onclick = () => { escolha.fill(null); draw(); };
        }
      };
    };
    draw();
  }

  /* ============================================================
     QUIZ — perguntas rápidas (com cena, Verdade/Mito, cronometrado)
     ============================================================ */
  function rQuiz(palco, a) {
    let qi = 0;
    const total = a.perguntas.length;

    const drawQ = () => {
      const q = a.perguntas[qi];
      const tempo = progresso.tempoDaAtividade(a);   // Capitão: 15 s (Fase 10) e 20 s (missões); Marujo: sem relógio
      const ehVM = !!a.vm;
      const ops = ehVM ? [{ t: 'Verdade', ok: q.vm === true }, { t: 'Mito', ok: q.vm === false }] : q.ops;

      palco.innerHTML = `
        <div class="quiz-top">
          <span>Pergunta ${qi + 1}/${total}</span>
          ${tempo ? `<span class="tempo">${I('cronometro', { size: 24 })}<b id="tempoTxt">${tempo}s</b></span>` : ''}
        </div>
        ${tempo ? `<div class="barra-tempo"><i id="barraTempo"></i></div>` : ''}
        ${q.cena ? `<div class="quiz-cena">${esc(q.cena)}</div>` : ''}
        <p class="enunciado">${esc(q.q)}</p>
        ${NK.dicaHtml(a.dica)}
        <div class="opcoes" id="opsQuiz">
          ${ops.map((o, i) => `<button class="opcao" data-i="${i}"><span>${esc(o.t)}</span></button>`).join('')}
        </div>
        <div class="quiz-fb" id="fbQuiz" style="display:none"></div>
        <div class="rodape" id="rodQuiz"></div>`;

      let travado = false, timerId = null;
      if (tempo) {
        const t0 = Date.now(), limite = tempo * 1000;
        timerId = every(() => {
          const rest = Math.max(0, limite - (Date.now() - t0));
          $('#tempoTxt') && ($('#tempoTxt').textContent = Math.ceil(rest / 1000) + 's');
          $('#barraTempo') && ($('#barraTempo').style.width = (rest / limite * 100) + '%');
          if (rest <= 0 && !travado) { responder(-1); }
        }, 100);
      }

      function responder(i) {
        if (travado) return;
        travado = true;
        if (timerId) clearInterval(timerId);
        const o = i >= 0 ? ops[i] : null;
        $$('.opcao', palco).forEach((b, bi) => {
          b.disabled = true;
          if (ops[bi].ok) b.classList.add('certa');
          else if (bi === i) b.classList.add('errada');
        });
        const ok = o ? o.ok : false;
        if (!ok) progresso.registrarErro();
        NK.feedback[ok ? 'acerto' : 'erro']();
        const fb = $('#fbQuiz');
        fb.style.display = 'block';
        fb.className = 'quiz-fb ' + (ok ? 'ok' : 'ruim');
        fb.innerHTML = i < 0 ? comIcone('cronometro', 'O tempo acabou! ' + (q.fb || '')) : comIcone(ok ? 'correto' : 'falha', q.fb || '');
        $('#rodQuiz').innerHTML = `<button class="btn btn-t" id="btProxQ">${qi + 1 < total ? 'Próxima pergunta' : 'Ver resultado'}</button>`;
        $('#btProxQ').onclick = () => { qi++; if (qi < total) drawQ(); else fimQuiz(); };
      }
      $$('.opcao', palco).forEach(b => b.onclick = () => responder(+b.dataset.i));
    };

    const fimQuiz = () => concluirAtividade(a.fbOk);
    drawQ();
  }

  /* ============================================================
     MATCH — associar situação → ação
     ============================================================ */
  const COR_PAR = ['#4EA8DE', '#FF7A59', '#2EC4B6', '#FFC83B'];   // cada par ligado ganha a cor da sua situação

  function rMatch(palco, a) {
    const as = a.pares.map((p, i) => ({ t: p.a, id: i }));
    const bs = shuffle(a.pares.map((p, i) => ({ t: p.b, id: i })));
    let selA = null, pares = new Set();

    const draw = () => {
      palco.innerHTML = `
        <p class="enunciado">${esc(a.pergunta)}</p>
        ${NK.dicaHtml(a.dica)}
        <p class="prog-hunt">Ligados: <b>${pares.size}/${a.pares.length}</b></p>
        <div class="match">
          <div class="col"><h4>Situação</h4>${as.map(x => `<button data-a="${x.id}" style="--cor:${COR_PAR[x.id % COR_PAR.length]}" class="${pares.has(x.id) ? 'par' : (selA === x.id ? 'sel' : '')}" ${pares.has(x.id) ? 'disabled' : ''}><span class="m-num">${x.id + 1}</span><span>${esc(x.t)}</span></button>`).join('')}</div>
          <div class="col"><h4>Ação de guardião</h4>${bs.map(x => `<button data-b="${x.id}" style="--cor:${COR_PAR[x.id % COR_PAR.length]}" class="${pares.has(x.id) ? 'par' : ''}" ${pares.has(x.id) ? 'disabled' : ''}>${pares.has(x.id) ? `<span class="m-num">${x.id + 1}</span>` : ''}<span>${esc(x.t)}</span></button>`).join('')}</div>
        </div>
        <div class="dica-flutua" id="fbMatch"></div>`;

      $$('[data-a]', palco).forEach(b => b.onclick = () => { selA = selA === +b.dataset.a ? null : +b.dataset.a; draw(); });   // tocar de novo desmarca
      $$('[data-b]', palco).forEach(b => b.onclick = () => {
        if (selA === null) return;
        const id = +b.dataset.b;
        const fb = $('#fbMatch');
        if (id === selA) {
          pares.add(id); selA = null;
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', 'Combinação certa!'); NK.feedback.acerto();
          draw();
          if (pares.size === a.pares.length) later(() => concluirAtividade(a.fbOk), 600);
        } else {
          progresso.registrarErro(); NK.feedback.erro();
          fb.className = 'dica-flutua ruim'; fb.innerHTML = comIcone('falha', 'Essa combinação não é bem essa... tente outra!');
          selA = null; draw();
        }
      });
    };
    draw();
  }

  /* ============================================================
     BAU — animação "O Peso do Segredo"
     ============================================================ */
  function rBau(palco, a) {
    /* Cena montada uma vez; ao contar o segredo só troca a classe "contou",
       e o CSS anima: a Capitã chega, o baú encolhe e o peso cai. */
    palco.innerHTML = `
      <p class="enunciado">${esc(a.titulo)}</p>
      <div class="bau-cena">
        <div class="bau-palco">
          <figure class="bau-perso bau-nav">
            <span class="bau-balao bau-pensa">Ninguém pode saber disso...</span>
            ${I('usuario', { cls: 'bau-img' })}
            <figcaption>Navegador</figcaption>
          </figure>
          <span class="bau-bau">${I('bau', { cls: 'bau-img' })}</span>
          <figure class="bau-perso bau-cap" aria-hidden="true">
            <span class="bau-balao bau-fala">Obrigada por me contar! Agora a gente cuida disso juntos.</span>
            ${I('pirata', { cls: 'bau-img' })}
            <figcaption>Capitã Bússola</figcaption>
          </figure>
          <i class="bau-mar" aria-hidden="true"></i>
        </div>
        <div class="peso">
          <div class="peso-topo">${I('bau', { cls: 'ico-txt' })}<b>Peso do segredo</b><span class="peso-tag" id="pesoTag">Pesado demais</span></div>
          <div class="trilho" role="progressbar" aria-label="Peso do segredo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="95"><i></i></div>
        </div>
      </div>
      <p class="texto-cena" id="bauTexto">${esc(a.texto)}</p>
      ${NK.dicaHtml(a.dica)}
      <div class="rodape"><button class="btn btn-t" id="btBau">Ele conta o segredo pra Capitã Bússola</button></div>`;

    const bt = $('#btBau', palco);
    bt.onclick = () => {
      if (palco.querySelector('.bau-cena.contou')) { concluirAtividade(); return; }
      $('.bau-cena', palco).classList.add('contou');
      $('.bau-cap', palco).removeAttribute('aria-hidden');
      $('.trilho', palco).setAttribute('aria-valuenow', '25');
      $('#pesoTag', palco).textContent = 'Bem mais leve!';
      $('#bauTexto', palco).textContent = 'Ele contou! Dividir o segredo com uma guardiã de confiança deixou o baú bem mais leve.';
      bt.textContent = 'Continuar';
    };
  }

  Object.assign(NK.atividades, {
    classify: rClassify, hunt: rHunt, sequence: rSequence, compose: rCompose,
    quiz: rQuiz, match: rMatch, bau: rBau
  });
})();
