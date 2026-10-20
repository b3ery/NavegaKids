/* ============================================================
   NavegaKids · telas/capitao.js
   Cenas do Capitão Gancho: introdução antes da Fase 1 e as cenas de fim de fase, de ilha e da jornada.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});
  const { ILHAS, progresso, $, $$, esc, go, later, I, montar } = NK;
  const { faseById, ilhaById, fasesDaIlha, faseCompleta, ilhaCompleta, jornadaCompleta } = progresso;
  const { nomeNav, ilhasHtml, estrelasHtml } = NK.comum;

  function cenaCapitao({
    falas,
    titulo,
    subtitulo,
    adereços = {},
    destino,
    btnFim = 'Continuar',
    aoTerminar
  }) {
    let passo = 0,
      digitando = null;
    montar(
      `
    <div class="scene prologo" id="prologo" data-cena="${falas[0].cena || ''}">
      <div class="pr-ceu" aria-hidden="true"><i class="pr-sol"></i><i class="pr-nuvem n1"></i><i class="pr-nuvem n2"></i><i class="pr-nuvem n3"></i></div>
      <div class="pr-titulo" aria-hidden="true"><b>${esc(titulo)}</b>${subtitulo ? `<small>${esc(subtitulo)}</small>` : ''}</div>
      <span class="pr-navio" aria-hidden="true">${I('navioPirata', { alt: '' })}</span>
      <div class="pr-mar" aria-hidden="true"><i class="pr-onda"></i><i class="pr-onda o2"></i><i class="pr-onda o3"></i></div>
      ${Object.entries(adereços)
        .map(([k, html]) => `<div class="pr-props pr-${k}" data-p="${k}" aria-hidden="true">${html}</div>`)
        .join('')}
      <div class="pr-palco">
        <span class="pr-capitao" id="prCapitao">${I('capitao', { alt: 'Capitão Gancho' })}</span>
        <div class="pr-balao" id="prBalao">
          <small>Capitão Gancho</small>
          <p class="pr-texto" id="prTexto" aria-hidden="true"></p>
          <p class="sr" id="prFala" aria-live="polite"></p>
          <div class="pr-base">
            <span class="pr-bolinhas" aria-hidden="true">${falas.map((_, i) => `<i data-p="${i}"></i>`).join('')}</span>
            <button class="btn btn-t pr-seguir" id="prSeguir">Continuar</button>
          </div>
        </div>
      </div>
      <div class="pr-topo">
        ${NK.botaoOuvir('#prFala', { cls: 'pr-ouvir' })}
        <button class="btn btn-sm btn-ghost pr-pular" id="prPular">Pular</button>
      </div>
    </div>`,
      'ilhas'
    );
    document.body.classList.add('tela-prologo');
    NK.onLeave(() => document.body.classList.remove('tela-prologo'));

    const fim = () => {
      aoTerminar?.();
      go(destino);
    };
    const marujo = progresso.modo() === 'marujo';
    falas = falas.map(x => ({ ...x, t: (marujo && x.curta) || x.t }));
    const mostrar = (i, primeira) => {
      const f = falas[i];
      $('#prologo').dataset.cena = f.cena || '';
      $$('.pr-props').forEach(p => p.classList.toggle('on', p.dataset.p === f.cena));
      $$('.pr-bolinhas i').forEach((b, bi) => (b.className = bi < i ? 'ok' : bi === i ? 'agora' : ''));
      $('#prSeguir').textContent = i === falas.length - 1 ? btnFim : 'Continuar';
      $('#prFala').textContent = f.t;
      const balao = $('#prBalao');
      balao.classList.remove('entra');
      void balao.offsetWidth;
      balao.classList.add('entra');
      $('#prCapitao').classList.remove('fala');
      void balao.offsetWidth;
      $('#prCapitao').classList.add('fala');
      // texto aparecendo letra por letra
      const alvo = $('#prTexto');
      alvo.textContent = '';
      let n = 0;
      if (digitando) clearInterval(digitando);
      digitando = NK.every(() => {
        n += 1;
        alvo.textContent = f.t.slice(0, n);
        if (n >= f.t.length) {
          clearInterval(digitando);
          digitando = null;
        }
      }, 32);
      // a primeira fala é lida pela leitura automática da tela; as outras, aqui
      if (!primeira && progresso.vozAuto()) NK.voz.falar(f.t, $('.bt-ouvir-principal'));
    };
    const seguir = () => {
      if (digitando) {
        // primeiro toque completa o texto; o segundo avança
        clearInterval(digitando);
        digitando = null;
        $('#prTexto').textContent = falas[passo].t;
        return;
      }
      NK.pararVoz?.();
      if (passo >= falas.length - 1) return fim();
      passo += 1;
      mostrar(passo);
    };

    $('#prSeguir').onclick = e => {
      e.stopPropagation();
      seguir();
    };
    $('#prPular').onclick = e => {
      e.stopPropagation();
      NK.pararVoz?.();
      fim();
    };
    $('.pr-palco').onclick = e => {
      if (!e.target.closest('button')) seguir();
    };
    // o título aparece primeiro; o Capitão chega voando e começa a falar
    $('#prFala').textContent = falas[0].t;
    later(() => mostrar(0, true), 2700);
    later(() => $('#prSeguir')?.focus({ preventScroll: true }), 2800);
  }

  /** Introdução (antes da Fase 1). */
  function telaPrologo() {
    cenaCapitao({
      titulo: 'NavegaKids',
      subtitulo: 'uma aventura nos mares da internet',
      falas: NK.PROLOGO.map(p => ({
        ...p,
        t: p.t.replace('{nome}', nomeNav()),
        curta: p.curta?.replace('{nome}', nomeNav())
      })),
      adereços: {
        ilhas: ilhasHtml(),
        premios: `<span style="--i:0">${I('estrela', { alt: '' })}</span><span style="--i:1">${I('medalha', { alt: '' })}</span><span style="--i:2">${I('dica', { alt: '' })}</span>`
      },
      destino: '#/abertura/1',
      btnFim: 'Vamos navegar!',
      aoTerminar: () => progresso.marcarPrologoVisto()
    });
  }

  /** Capitão no fim de uma fase (#/capitao/fase/ID), de uma ilha (#/capitao/ilha/ID) e da jornada (#/capitao/final). */
  function telaCapitao(p) {
    const [tipo, id] = p.split('/');
    if (tipo === 'fase') {
      const f = faseById(+id);
      if (!f || !faseCompleta(f.id)) return go('#/missoes');
      const r = progresso.resultadoDaFase(f.id) || { estrelas: 0, maxEstrelas: 3 };
      const ultimaDaIlha = fasesDaIlha(f.ilha).slice(-1)[0].id === f.id;
      return cenaCapitao({
        titulo: 'Fase concluída!',
        subtitulo: f.titulo,
        falas: [
          {
            cena: 'estrelas',
            t: `Muito bem, ${nomeNav()}! Você terminou a fase "${f.titulo}" e ganhou ${r.estrelas} ${r.estrelas === 1 ? 'estrela' : 'estrelas'}!`,
            curta: `Muito bem, ${nomeNav()}! Fase completa!`
          },
          { cena: 'licao', t: f.aprendizado },
          {
            cena: 'estrelas',
            t: ultimaDaIlha
              ? 'Essa era a última fase da ilha. Vamos ver o que você conquistou?'
              : 'Bora para a próxima fase? A aventura continua!',
            curta: ultimaDaIlha ? 'Vamos ver o seu prêmio?' : 'Vamos para a próxima fase!'
          }
        ],
        adereços: {
          estrelas: estrelasHtml(Math.min(r.estrelas, 3)),
          licao: `<span style="--i:0">${I(f.icone, { alt: '' })}</span>`
        },
        destino: '#/missoes',
        btnFim: ultimaDaIlha ? 'Ver a conquista' : 'Continuar'
      });
    }
    if (tipo === 'ilha') {
      const il = ilhaById(+id);
      if (!il || !ilhaCompleta(il.id)) return go('#/ilhas');
      const ultima = il.id === ILHAS.at(-1).id;
      return cenaCapitao({
        titulo: `${il.nome} conquistada!`,
        subtitulo: `selo ${il.selo}`,
        falas: [
          {
            cena: 'ilha',
            t: `Ahoy, ${nomeNav()}! Você completou as cinco fases da ${il.nome}!`,
            curta: `Ahoy, ${nomeNav()}! Você venceu a ${il.nome}!`
          },
          {
            cena: 'selo',
            t: `Por isso ganhou o selo ${il.selo}. Ele já está guardado no Diário do Capitão!`,
            curta: `Você ganhou um selo novo!`
          },
          ultima
            ? {
                cena: 'ilha',
                t: 'Essa era a última ilha. Que viagem, hein? Tenho uma surpresa para você...',
                curta: 'Tenho uma surpresa para você!'
              }
            : {
                cena: 'ilha',
                t: 'Agora prepare o navio: uma nova ilha está esperando por você!',
                curta: 'Uma nova ilha espera por você!'
              }
        ],
        adereços: {
          ilha: `<figure style="--i:0;--cor:${il.cor}">${I(il.icone, { alt: '' })}<figcaption>${esc(il.nome)}</figcaption></figure>`,
          selo: `<span style="--i:0">${I(il.seloImg, { alt: '' })}</span><span style="--i:1">${I('medalha', { alt: '' })}</span>`
        },
        destino: `#/conclusao/${il.id}`,
        btnFim: 'Ver meu selo'
      });
    }
    if (tipo === 'final') {
      if (!jornadaCompleta()) return go('#/ilhas');
      return cenaCapitao({
        titulo: 'Jornada completa!',
        subtitulo: 'Guardião dos Mares Digitais',
        falas: [
          {
            cena: 'ilhas',
            t: `${nomeNav()}, você navegou pelas três ilhas e venceu todas as fases. Estou muito orgulhoso!`,
            curta: `${nomeNav()}, você venceu as três ilhas!`
          },
          {
            cena: 'premios',
            t: 'Agora você sabe desconfiar de perfis estranhos, proteger seus dados, sair de conversas ruins, bloquear e denunciar.',
            curta: 'Agora você sabe se proteger na internet.'
          },
          {
            cena: 'premios',
            t: 'E o mais importante: nenhum pirata navega sozinho. Sempre que precisar, conte para um adulto de confiança.',
            curta: 'Se algo te assustar, conte para um adulto.'
          },
          {
            cena: 'ilhas',
            t: 'Por isso, você ganhou o seu certificado de Guardião dos Mares Digitais. Vamos ver?',
            curta: 'Você ganhou um certificado! Vamos ver?'
          }
        ],
        adereços: {
          ilhas: ilhasHtml(),
          premios: `<span style="--i:0">${I('estrela', { alt: '' })}</span><span style="--i:1">${I('medalha', { alt: '' })}</span><span style="--i:2">${I('escudo', { alt: '' })}</span>`
        },
        destino: '#/certificado',
        btnFim: 'Ver meu certificado'
      });
    }
    go('#/ilhas');
  }

  NK.telas = Object.assign(NK.telas || {}, { prologo: telaPrologo, capitao: telaCapitao });
})();
