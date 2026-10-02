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
        ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
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
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', 'Isso mesmo!');
          selecionado = null;
          draw();
          if (itens.every(i => i.colocado !== null)) later(() => concluirAtividade(a.fbOk), 500);
        } else {
          progresso.registrarErro();
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
          ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
          <p class="prog-hunt">Pistas encontradas: <b id="cntHunt">0</b>/${alvo}</p>
          <div class="hunt-perfil">
            <div class="card-perfil">
              <div class="cabec">${I('anonimo', { size: 44 })}<span>${esc(NPC1)}</span></div>
              ${round.itens.map((it, i) => `<button class="linha-pista" data-i="${i}"><span class="e">${icone(it)}</span><span>${esc(it.t)}</span></button>`).join('')}
            </div>
            <div class="lado-amigos"><h4>Amigos em comum</h4><ul><li>${I('usuario', { size: 22 })}Nenhum amigo em comum</li></ul></div>
          </div>
          <div class="dica-flutua" id="fbHunt"></div>`;
      } else if (a.skin === 'chat') {
        palco.innerHTML = `
          <p class="enunciado">${esc(a.pergunta)}</p>
          ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
          <p class="prog-hunt">Sinais encontrados: <b id="cntHunt">0</b>/${alvo}</p>
          <div class="chat">
            <div class="chat-head">${I('anonimo', { size: 34 })}<span>${esc(a.com)}</span><small>online</small></div>
            <div class="chat-body">${round.itens.map((it, i) => `<button class="bolha" data-i="${i}"><span class="av">${I('anonimo')}</span><span class="msg">${esc(it.t)}</span></button>`).join('')}</div>
          </div>
          <div class="dica-flutua" id="fbHunt"></div>`;
      } else if (a.skin === 'app') {
        palco.innerHTML = `
          <p class="enunciado">${esc(a.pergunta)}</p>
          ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
          <p class="prog-hunt">Rodada ${rIdx + 1}/${a.rounds.length} — encontrados: <b id="cntHunt">0</b>/${alvo}</p>
          <div class="mock-app">
            <div class="barra">${I('bubbleChat', { cls: 'ico-txt' })}<span>${esc(round.titulo || 'Aplicativo')}</span></div>
            <div class="corpo">${round.itens.map((it, i) => `<button class="bt-app" data-i="${i}" title="${esc(it.t)}">${icone(it)}</button>`).join('')}</div>
          </div>
          <div class="dica-flutua" id="fbHunt"></div>`;
      } else {
        // skin "scene": cena livre com pontos posicionados
        palco.innerHTML = `
          <p class="enunciado">${esc(a.pergunta)}</p>
          ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
          <p class="prog-hunt">Encontrados: <b id="cntHunt">0</b>/${alvo}</p>
          <div class="cena-hunt mapa-perg">
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
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', it.why);
          if (achadas.size === alvo) {
            later(() => {
              if (rIdx + 1 < a.rounds.length) { rIdx++; drawRound(); }
              else concluirAtividade(a.fbOk);
            }, 700);
          }
        } else {
          if (a.skin !== 'app') progresso.registrarErro();   // no "app" a criança está explorando a tela
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
        ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
        <div class="seq-slots">
          ${slots.map((s, i) => `<div class="slot ${s !== null ? 'cheio' : ''}" data-s="${i}">
            <span class="n">${i + 1}</span>
            ${s !== null ? `<span class="e">${icone(passos[s])}</span><span>${esc(passos[s].t)}</span>` : '<span style="color:#999">toque para preencher</span>'}
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
      $('#btLimparSeq').onclick = () => { slots.fill(null); draw(); };

      function checar() {
        if (slots.includes(null)) { draw(); return; }
        const certo = slots.every((id, i) => id === i);
        const fb = $('#fbSeq');
        if (certo) {
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', 'Sequência perfeita!');
          draw();
          later(() => concluirAtividade(a.fbOk), 700);
        } else {
          progresso.registrarErro();
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
        ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
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

      $$('.bloco', palco).forEach(b => b.onclick = () => { escolha[+b.dataset.g] = +b.dataset.b; draw(); });

      const btEnv = $('#btEnviarFrase');
      if (btEnv) btEnv.onclick = () => {
        const okTudo = a.grupos.every((g, gi) => g.blocos[escolha[gi]].ok);
        const fb = $('#fbComp');
        if (okTudo) {
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', a.fbOk || 'Ótima mensagem!');
          later(() => concluirAtividade(a.fbOk), 700);
        } else {
          progresso.registrarErro();
          fb.className = 'dica-flutua ruim'; fb.innerHTML = comIcone('falha', a.fbBad || 'Vamos tentar outra combinação.');
          escolha.fill(null);
          later(draw, 1100);
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
      const ehVM = !!a.vm;
      const ops = ehVM ? [{ t: 'Verdade', ok: q.vm === true }, { t: 'Mito', ok: q.vm === false }] : q.ops;

      palco.innerHTML = `
        <div class="quiz-top">
          <span>Pergunta ${qi + 1}/${total}</span>
          ${a.tempo ? `<span class="tempo">${I('cronometro', { size: 24 })}<b id="tempoTxt">${a.tempo}s</b></span>` : ''}
        </div>
        ${a.tempo ? `<div class="barra-tempo"><i id="barraTempo"></i></div>` : ''}
        ${q.cena ? `<div class="quiz-cena">${esc(q.cena)}</div>` : ''}
        <p class="enunciado">${esc(q.q)}</p>
        <div class="opcoes" id="opsQuiz">
          ${ops.map((o, i) => `<button class="opcao" data-i="${i}"><span>${esc(o.t)}</span></button>`).join('')}
        </div>
        <div class="quiz-fb" id="fbQuiz" style="display:none"></div>
        <div class="rodape" id="rodQuiz"></div>`;

      let travado = false, timerId = null;
      if (a.tempo) {
        const t0 = Date.now(), limite = a.tempo * 1000;
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
  function rMatch(palco, a) {
    const as = a.pares.map((p, i) => ({ t: p.a, id: i }));
    const bs = shuffle(a.pares.map((p, i) => ({ t: p.b, id: i })));
    let selA = null, pares = new Set();

    const draw = () => {
      palco.innerHTML = `
        <p class="enunciado">${esc(a.pergunta)}</p>
        ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
        <p class="prog-hunt">Ligados: <b>${pares.size}/${a.pares.length}</b></p>
        <div class="match">
          <div class="col">${as.map(x => `<button data-a="${x.id}" class="${pares.has(x.id) ? 'par' : (selA === x.id ? 'sel' : '')}" ${pares.has(x.id) ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>
          <div class="col">${bs.map(x => `<button data-b="${x.id}" class="${pares.has(x.id) ? 'par' : ''}" ${pares.has(x.id) ? 'disabled' : ''}>${esc(x.t)}</button>`).join('')}</div>
        </div>
        <div class="dica-flutua" id="fbMatch"></div>`;

      $$('[data-a]', palco).forEach(b => b.onclick = () => { selA = +b.dataset.a; draw(); });
      $$('[data-b]', palco).forEach(b => b.onclick = () => {
        if (selA === null) return;
        const id = +b.dataset.b;
        const fb = $('#fbMatch');
        if (id === selA) {
          pares.add(id); selA = null;
          fb.className = 'dica-flutua boa'; fb.innerHTML = comIcone('correto', 'Combinação certa!');
          draw();
          if (pares.size === a.pares.length) later(() => concluirAtividade(a.fbOk), 600);
        } else {
          progresso.registrarErro();
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
    let fase = 0; // 0 = carregando sozinho, 1 = contou pra Capitã Bússola
    const draw = () => {
      palco.innerHTML = `
        <p class="enunciado">${esc(a.titulo)}</p>
        <div class="bau-cena">
          <div class="bau-linha">
            <span class="nav-c" style="transform:${fase === 0 ? 'translateY(6px)' : 'translateY(-4px)'}">${I('usuario', { size: 90 })}</span>
            <span class="caixa">${I('bau', { size: fase === 0 ? 110 : 56 })}</span>
            ${fase === 1 ? `<div class="cap">${I('pirata')}Capitã Bússola</div>` : ''}
          </div>
          <div class="peso">
            <span>${fase === 0 ? 'Peso do segredo: pesado demais' : 'Peso do segredo: mais leve!'}</span>
            <div class="trilho"><i style="width:${fase === 0 ? '95%' : '25%'}; background:${fase === 0 ? '#ff7b5a' : '#2ec4b0'}"></i></div>
          </div>
        </div>
        <p class="texto-cena">${esc(a.texto)}</p>
        ${a.dica ? `<p class="dica-flutua">${comIcone('luneta', a.dica)}</p>` : ''}
        <div class="rodape">
          ${fase === 0
            ? `<button class="btn btn-t" id="btContar">Ele conta o segredo pra Capitã Bússola</button>`
            : `<button class="btn btn-t" id="btOkBau">Continuar</button>`}
        </div>`;
      const bc = $('#btContar'); if (bc) bc.onclick = () => { fase = 1; draw(); };
      const bo = $('#btOkBau'); if (bo) bo.onclick = () => concluirAtividade();
    };
    draw();
  }

  Object.assign(NK.atividades, {
    classify: rClassify, hunt: rHunt, sequence: rSequence, compose: rCompose,
    quiz: rQuiz, match: rMatch, bau: rBau
  });
})();
