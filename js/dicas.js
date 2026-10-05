/* ============================================================
   NavegaKids — dicas.js
   Dicas por nível nas atividades que têm resposta certa ou errada. O botão
   "Dica" fica na barra de cima: no Marujo está sempre lá; no Capitão
   aparece depois de 30 s pensando ou de 2 erros:
     marujo  (8 anos)       dica óbvia, quase mostra a resposta
     capitao (9 e 10 anos)  dica sutil, faz pensar sem entregar
   Chave: "fase-atividade" (a atividade começa em 0).
   Nas atividades sem resposta (descoberta, explicação, baú, portas,
   escudo), a dica do roteiro aparece como texto na própria cena.
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});

  NK.DICAS = {
    /* ---------- Ilha 1 ---------- */
    '1-1': { marujo: 'Procure 3 coisas: a foto, os números do perfil e os amigos em comum.',
             capitao: 'Repare no que falta nesse perfil, não no que ele diz.' },
    '1-2': { marujo: 'Não responda! Ignore ou bloqueie.',
             capitao: 'Você deve alguma explicação a quem não respeita um “não”?' },
    '2-1': { marujo: 'Colega da turma e primo você conhece de verdade. Quem você só viu no jogo vai para “Só conheço pela tela”.',
             capitao: 'Pense em onde você conheceu cada um.' },
    '2-2': { marujo: 'Chat privado com quem você só conhece pela tela? Responda NÃO.',
             capitao: 'Quem poderia ver essa conversa?' },
    '3-1': { marujo: 'Toque no elogio exagerado, na pergunta sobre onde você mora e no pedido de segredo.',
             capitao: 'Três mensagens querem mais do que só jogar.' },
    '3-2': { marujo: 'Você não precisa responder. Escolha sair da conversa.',
             capitao: 'Toda pergunta precisa de resposta?' },
    '4-1': { marujo: 'Jogo favorito e cor preferida pode contar. Endereço, escola, senha e fotos são só seus.',
             capitao: 'O que alguém poderia usar para te encontrar?' },
    '4-2': { marujo: 'Segredo que esconde algo dos adultos deve ser contado. Escolha contar pra um adulto.',
             capitao: 'Esse segredo deixa todo mundo feliz depois, como uma festa surpresa?' },
    '5-0': { marujo: 'Procure o perfil escondido, a mão de “pare”, a lupa do segredo e o cartão de dados pessoais.',
             capitao: 'Lembre-se dos sinais que você viu nas fases 1 a 4.' },
    '5-1': { marujo: 'Em todas as cenas, a escolha segura é se proteger e contar pra um adulto.',
             capitao: 'Lembre o que você fez em cada fase desta ilha.' },
    '5-2': { marujo: 'Primeiro desconfiar, depois não compartilhar dados e, por último, contar pra um adulto.',
             capitao: 'O que vem primeiro: perceber o perigo ou pedir ajuda?' },

    /* ---------- Ilha 2 ---------- */
    '6-2': { marujo: 'Fique onde seus responsáveis podem ver. Responda “Não, prefiro continuar aqui”.',
             capitao: 'Por que alguém quer mudar de lugar para conversar só com você?' },
    '7-0': { marujo: 'Escolha a resposta que não manda a foto e chama um adulto.',
             capitao: 'Qual resposta te protege sem ser grosseira?' },
    '7-1': { marujo: 'Comece com “Prefiro não falar sobre isso” e termine com “vou perguntar pro meu responsável”.',
             capitao: 'Uma boa resposta é educada, firme e chama alguém de confiança.' },
    '7-2': { marujo: 'A carta Segura não conta qual é a sua escola.',
             capitao: 'Qual carta não deixa nenhuma brecha?' },
    '8-1': { marujo: 'Procure o ícone de uma pessoa com um sinal de bloqueio.',
             capitao: 'Qual botão faz a conversa parar de vez?' },
    '8-2': { marujo: 'Saia da conversa e conte pra um adulto.',
             capitao: 'Você precisa resolver isso sozinho?' },
    '9-1': { marujo: 'Quem insiste, incomoda ou pede seu endereço merece o escudo. Briga boba com amigo, não.',
             capitao: 'O escudo é para um desentendimento ou para quem não para de te incomodar?' },
    '10-0': { marujo: 'Procure o convite para outro aplicativo, a mensagem pedindo foto, o sinal de alerta e o escudo.',
              capitao: 'Junte o que você aprendeu nas fases 6 a 9.' },
    '10-1': { marujo: 'A escolha segura é sempre recusar, sair, contar ou bloquear.',
              capitao: 'Pense rápido, mas pense: qual opção te protege?' },
    '10-2': { marujo: 'Reconhecer o sinal, escolher a resposta, sair e, por último, ativar o escudo.',
              capitao: 'Bloquear é o primeiro passo ou o último?' },

    /* ---------- Ilha 3 ---------- */
    '11-1': { marujo: 'Mãe, pai, responsável, professora e avó vão para o navio. Quem você só conhece pela tela fica de fora.',
              capitao: 'Quem você conhece na vida real e cuida de você?' },
    '11-2': { marujo: 'Chame um guardião do seu time.',
              capitao: 'Um bom pirata enfrenta a tempestade sozinho?' },
    '12-1': { marujo: 'Lembre: a culpa nunca é da criança e contar sempre ajuda.',
              capitao: 'De quem é a culpa quando um adulto engana uma criança?' },
    '12-2': { marujo: 'Comece com “Preciso te contar uma coisa” e continue com “uma pessoa na internet me deixou desconfortável”.',
              capitao: 'Para pedir ajuda, basta começar a falar.' },
    '13-1': { marujo: 'Procure os três pontinhos ou o menu de três risquinhos.',
              capitao: 'Onde os aplicativos costumam esconder as opções extras?' },
    '13-2': { marujo: 'Denuncie junto com um adulto de confiança.',
              capitao: 'Você precisa dar esse passo sozinho?' },
    '14-1': { marujo: 'Escolha a frase que leva o seu amigo até um adulto.',
              capitao: 'Um bom amigo guarda esse segredo ou ajuda?' },
    '14-2': { marujo: 'Vá junto com o seu amigo falar com um adulto.',
              capitao: 'Como o seu amigo se sentiria indo sozinho?' },
    '15-0': { marujo: 'Medo de contar: falar com um guardião. Em quem confiar: o time. Passou dos limites: denunciar. Amigo com problema: ir junto.',
              capitao: 'Cada situação combina com uma fase da Ilha dos Guardiões.' },
    '15-1': { marujo: 'Desconfie, proteja seus dados, saia, bloqueie, conte e denuncie.',
              capitao: 'Use tudo o que aprendeu nas três ilhas.' },
    '15-2': { marujo: 'Reconhecer, fazer a escolha segura, contar e, por último, denunciar.',
              capitao: 'O que vem antes de denunciar?' }
  };
})();
