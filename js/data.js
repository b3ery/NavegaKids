/* ============================================================
   NavegaKids — data.js
   Todo o conteúdo do Roteiro_Ilhas.docx:
   3 ilhas · 15 fases · 45 atividades.

   Tipos de atividade (campo "tipo"):
     discover  leitura guiada de uma cena + botão Avançar
     choice    escolha (botões ou cartas) com feedback certo / repensar
     classify  arrastar (ou tocar) itens para os grupos certos
     hunt      achar pistas / sinais / botões em uma cena
     quiz      perguntas rápidas (pode ser cronometrado / Verdade ou Mito)
     sequence  montar a sequência certa
     compose   montar uma frase com blocos
     doors     Porta Secreta (segura ou arriscada?)
     explain   telas explicativas
     match     associar situação → ação
     bau       animação "O Peso do Segredo"
     block     ativar o escudo (bloquear)
   ============================================================ */
(() => {
  'use strict';
  const NK = (window.NavegaKids ??= {});

  const NPC1 = "Capitão_Lesma2120";
  const NPC2 = "Sombra_das_Marés";
  const NPC3 = "Capitã Bússola";

  const ILHAS = [
    {
      id: 1, nome: "Ilha dos Mistérios", img: "ilha1", cor: "#42A6DB",   // cor da bandeira da ilha (Fundo_Ilhas)
      icone: "ilhaPraia", iconeBloqueado: "ilhaPraiaBloqueada",
      carregando: "Navegando até a ilha dos Mistérios",
      selo: "Observador Atento", seloImg: "luneta",
      conclusao: "Parabéns Pirata, você venceu a Ilha dos Mistérios! Você ganhou o selo de Observador Atento.",
      conclusaoBtn: "Descubra a Próxima ilha"
    },
    {
      id: 2, nome: "Ilha das Escolhas", img: "ilha2", cor: "#F47044",
      icone: "ilhaArvores", iconeBloqueado: "ilhaArvoresBloqueada",
      carregando: "Navegando até a ilha das Escolhas",
      selo: "Guardião das Escolhas Seguras", seloImg: "escudo",
      conclusao: "Parabéns, Pirata! Você venceu a Ilha das Escolhas e ganhou o selo de Guardião das Escolhas Seguras!",
      conclusaoBtn: "Descubra a Próxima ilha"
    },
    {
      id: 3, nome: "Ilha dos Guardiões", img: "ilha3", cor: "#22C19F",
      icone: "ilhaMontanhas", iconeBloqueado: "ilhaMontanhasBloqueada",
      carregando: "Navegando até a ilha dos Guardiões",
      selo: "Guardião dos Mares", seloImg: "navio",
      conclusao: "Parabéns, Pirata! Você venceu a Ilha dos Guardiões e concluiu toda a sua jornada pelos mares digitais. Você conquistou o selo de Guardião dos Mares!",
      conclusaoExtra: "E tem mais: você desbloqueou o seu Certificado de Navegador Seguro.",
      conclusaoBtn: "Imprimir meu certificado"
    }
  ];

  const FASES = [

    /* =====================  ILHA 1 · MISTÉRIOS  ===================== */
    {
      id: 1, ilha: 1, titulo: "Perfil Misterioso..?", icone: "luneta", npc: NPC1,
      abertura: {
        texto: "Oi, pequeno navegador! Hoje você vai conhecer alguém que recebeu um pedido de amizade de um perfil misterioso. Será que ele é quem diz ser?",
        btn: "COMEÇAR A AVENTURA"
      },
      missao: "Oi, pequeno navegador! Uma aventura misteriosa espera por você! Complete as 3 atividades para descobrir o segredo desse perfil.",
      aprendizado: "Se você não conhece a pessoa de verdade, não precisa aceitar o pedido. E se ela insistir, ignore ou bloqueie.",
      atividades: [
        {
          titulo: "Quem é esse pirata?", papel: "Descoberta + 1ª escolha", tipo: "choice", tutorial: true,
          cena: { tipo: "jogo" },
          dica: "Um novo amigo apareceu no seu caminho! Mas será que ele é quem diz ser? Pense bem antes de aceitar ou recusar!",
          opcoes: [
            { t: "SIM", ok: false, fb: "Opa! Cuidado, navegador! Você não conhece esse pirata de verdade. Que tal investigar o perfil antes de continuar?" },
            { t: "NÃO", ok: true,  fb: "Boa escolha, pequeno navegador! Você não conhece esse pirata, então é melhor manter distância. Na internet, segurança vem primeiro!" }
          ]
        },
        {
          titulo: "Detetive do Perfil", papel: "Prática", tipo: "hunt", skin: "perfil",
          dica: "Todo bom detetive junta pistas antes de decidir. Compare esse perfil com quem você já conhece de verdade!",
          pergunta: "Use a lupa: toque nas partes do perfil que mostram que ele pode não ser confiável.",
          rounds: [{
            itens: [
              { zona: "foto", img: "usuario", t: "Foto: só um ícone genérico, sem foto de verdade", ok: true,  why: "Pista encontrada! Sem foto de verdade, fica difícil saber quem está do outro lado." },
              { zona: "amigos", img: "apoio", t: "Nenhum amigo em comum com a sua lista", ok: true, why: "Boa! Ninguém da sua lista de amigos conhece esse perfil." },
              { zona: "conta", img: "cronometro", t: "Só 3 amigos · conta criada há 2 dias", ok: true, why: "Isso mesmo! Poucos amigos e conta muito nova merecem atenção." },
              { zona: "bio", img: "pirata", t: "Diz que também gosta de jogos de pirata", ok: false, why: "Gostar do mesmo jogo não prova que a pessoa é quem diz ser." },
              { zona: "mensagem", img: "comunicacao", t: "Escreveu “Olá” de um jeito educado", ok: false, why: "Ser educado não quer dizer que a pessoa é confiável." }
            ]
          }],
          fbOk: "Muito bem, detetive! Foto genérica, nenhum amigo em comum e conta nova: quando aparecem tantas pistas juntas, é melhor não aceitar."
        },
        {
          titulo: "O Caminho Seguro", papel: "Escolha final da fase", tipo: "choice",
          cena: { tipo: "chat", com: NPC1, msgs: [
            { de: "npc", t: "Ei! Por que você não me aceitou? Aceita logo!" },
            { de: "npc", t: "Vou continuar te chamando até você aceitar." }
          ]},
          pergunta: "Mesmo depois do seu “não”, ele insiste. O que você faz?",
          dica: "Quem insiste depois de um “não” não está respeitando você.",
          opcoes: [
            { t: "Ignorar e seguir jogando", img: "nao", ok: true, fb: "Isso aí! Quando alguém insiste demais depois de um “não”, o caminho mais seguro é não responder e, se possível, bloquear." },
            { t: "Bloquear", img: "bloquearUsuario", ok: true, fb: "Isso aí! Quando alguém insiste demais depois de um “não”, o caminho mais seguro é não responder e, se possível, bloquear." },
            { t: "Responder pra ele parar de insistir", img: "editar", ok: false, fb: "Vamos pensar de novo: não é preciso explicar nada pra quem você nem conhece. Bloquear também é uma opção segura!" }
          ]
        }
      ]
    },

    {
      id: 2, ilha: 1, titulo: "Amigo ou Desconhecido?", icone: "interrogacao", npc: NPC1,
      abertura: { texto: "De volta ao mar, navegador! Sua tripulação está crescendo... mas você sabe mesmo quem está a bordo?", btn: "Continuar" },
      aprendizado: "Jogar junto é diferente de conhecer de verdade. Convites para lugares privados merecem uma conversa com um adulto.",
      atividades: [
        {
          titulo: "Quem Está na Tripulação", papel: "Descoberta", tipo: "discover",
          cena: { tipo: "lobby", titulo: "Lobby da equipe", avatares: [
            { nome: "Pirata2020" }, { nome: "Pirata2130" }, { nome: "Sereia0101" }, { nome: "peixinho01" },
            { nome: NPC1, alerta: true, nota: "entrou sem querer na partida em grupo" }
          ]},
          texto: "Olha só quem está na sua partida em grupo! O Capitão_Lesma2120 apareceu de novo — dessa vez já “confirmado” sem querer.",
          dica: "Nem todo mundo que joga com você é alguém que você conhece de verdade. Vamos dar uma olhada em quem está aqui?"
        },
        {
          titulo: "Conheço Mesmo?", papel: "Prática · classificar", tipo: "classify",
          pergunta: "Arraste (ou toque) cada avatar para o grupo certo.",
          dica: "Pense: você já encontrou essa pessoa pessoalmente e ela faz parte da sua vida real?",
          baldes: [
            { id: "real", t: "Conheço de verdade", img: "pedidoAmizade", sub: "colegas, família" },
            { id: "tela", t: "Só conheço pela tela", img: "anonimo", sub: "só jogamos online" }
          ],
          itens: [
            { t: "Pirata2020", sub: "colega da minha turma", b: "real" },
            { t: "Pirata2130", sub: "meu primo", b: "real" },
            { t: "Sereia0101", sub: "conheci na partida de ontem", b: "tela" },
            { t: "peixinho01", sub: "só conversamos no jogo", b: "tela" },
            { t: NPC1, sub: "nunca vi pessoalmente", b: "tela" }
          ],
          fbOk: "Jogar junto é diferente de conhecer de verdade — e tudo bem ter os dois tipos de contato, desde que você saiba diferenciar!"
        },
        {
          titulo: "Embarque Seguro", papel: "Escolha", tipo: "choice", resposta: true,
          cena: { tipo: "chat", com: NPC1, msgs: [
            { de: "npc", t: "Ei, vem pra minha cabine reservada!" },
            { de: "npc", t: "É um chat de voz privado, só nós dois." }
          ]},
          pergunta: "O convite é para um chat de voz privado. Você aceita?",
          dica: "Um espaço privado com alguém que só conhecemos pela tela… vale pensar duas vezes.",
          opcoes: [
            { t: "Sim", ok: false, fb: "Opa! Gostar do mesmo jogo não é a mesma coisa que confiar 100%. Bora repensar esse convite?" },
            { t: "Não", ok: true,  fb: "Boa, navegador! Ir para um espaço privado com alguém que você só conhece pela tela merece uma conversa com um adulto antes." }
          ]
        }
      ]
    },

    {
      id: 3, ilha: 1, titulo: "A Mensagem Estranha", icone: "bubbleChat", npc: NPC1,
      abertura: { texto: "Uma garrafa cheia de mensagens chegou até seu chat. Vamos ler com atenção antes de responder qualquer coisa?", btn: "Continuar" },
      aprendizado: "Você não precisa responder a tudo. Elogio demais, pergunta pessoal e pedido de segredo são sinais de alerta.",
      atividades: [
        {
          titulo: "Mensagens à Deriva", papel: "Descoberta · leitura de chat", tipo: "discover",
          cena: { tipo: "chat", com: NPC1, msgs: [
            { de: "npc", t: "Uau, você joga MUITO bem! Nunca vi ninguém tão incrível!" },
            { de: "npc", t: "Você é super especial, sabia? Bem diferente dos outros." },
            { de: "npc", t: "Quantos anos você tem? E onde você estuda?" }
          ]},
          texto: "Leia as mensagens com calma, uma por uma.",
          dica: "Leia com calma... alguma coisa aqui te deixou com a pulga atrás da orelha?"
        },
        {
          titulo: "Encontre o Sinal de Alerta", papel: "Prática · achar a pista", tipo: "hunt", skin: "chat",
          dica: "Bandeirinha vermelha à vista! Toque nas mensagens estranhas.",
          pergunta: "Toque nas mensagens que merecem atenção.",
          com: NPC1,
          rounds: [{
            itens: [
              { t: "Oi! Vi que você também joga esse jogo.", ok: false, why: "Essa é só uma conversa normal de quem joga junto." },
              { t: "Você é a criança mais incrível do mundo, ninguém joga como você!", ok: true, why: "Elogio exagerado! Quem quer te agradar demais pode estar tentando ganhar sua confiança." },
              { t: "Qual é o seu jogo favorito?", ok: false, why: "Falar de jogo favorito é tranquilo." },
              { t: "Me conta onde você mora e qual é o seu sobrenome?", ok: true, why: "Pergunta pessoal demais! Endereço e sobrenome não são para estranhos." },
              { t: "Não conta pra ninguém que a gente conversa, tá?", ok: true, why: "Pedido de segredo! Isso é um sinal de alerta importante." }
            ]
          }],
          fbOk: "Você achou todos os sinais: elogio exagerado, pergunta pessoal demais e pedido de segredo. Ótimo olho de detetive!"
        },
        {
          titulo: "Respondo ou Saio?", papel: "Escolha", tipo: "choice",
          cena: { tipo: "chat", com: NPC1, msgs: [
            { de: "npc", t: "Me responde logo! Você tem irmãos? Seus pais ficam em casa?" }
          ]},
          pergunta: "O que você faz agora?",
          dica: "Você manda em você: não precisa responder só porque alguém perguntou.",
          opcoes: [
            { t: "Responder", img: "editar", ok: false, fb: "Vamos pensar de novo: perguntas pessoais não precisam de resposta só porque alguém insiste." },
            { t: "Sair da conversa", img: "corre", ok: true, fb: "Isso aí! Você não precisa responder a tudo. Sair da conversa e contar pra um adulto é sempre uma opção válida." }
          ]
        }
      ]
    },

    {
      id: 4, ilha: 1, titulo: "O Segredo Digital", icone: "misterio", npc: NPC1,
      abertura: { texto: "Psiu... alguém te contou um “segredo só entre vocês dois”. Será que todo segredo é para guardar?", btn: "Continuar" },
      aprendizado: "Segredo que pede silêncio dos adultos merece ser contado. Dados pessoais são só seus e da sua família.",
      atividades: [
        {
          titulo: "Segredo de Pirata", papel: "Descoberta", tipo: "discover",
          cena: { tipo: "chat", com: NPC1, msgs: [
            { de: "npc", t: "Isso fica só entre a gente, combinado? Não conta pra ninguém." }
          ]},
          texto: "Repare no que o Capitão_Lesma2120 pediu.",
          dica: "Nem todo baú escondido guarda um tesouro bom."
        },
        {
          titulo: "O Que Posso Compartilhar", papel: "Prática · classificar", tipo: "classify",
          pergunta: "Arraste (ou toque) cada informação para o lugar certo.",
          dica: "Bora separar o que é seguro contar do que é melhor guardar com você e sua família.",
          baldes: [
            { id: "pode", t: "Pode compartilhar", img: "correto" },
            { id: "meu", t: "É só meu / da minha família", img: "escudo" }
          ],
          itens: [
            { t: "Jogo favorito", b: "pode" },
            { t: "Cor preferida", b: "pode" },
            { t: "Endereço", b: "meu" },
            { t: "Escola", b: "meu" },
            { t: "Senha", b: "meu" },
            { t: "Fotos", b: "meu" }
          ],
          fbOk: "Isso! Gostos como jogo e cor podem ser conversados. Endereço, escola, senha e fotos ficam com você e sua família."
        },
        {
          titulo: "Quebre o Segredo", papel: "Escolha", tipo: "choice",
          cena: { tipo: "chat", com: NPC1, msgs: [
            { de: "npc", t: "Isso fica só entre a gente, combinado? Não conta pra ninguém." }
          ]},
          pergunta: "O que você faz com esse segredo?",
          dica: "Segredo bom é festa surpresa. Segredo que pede silêncio… é outra história.",
          opcoes: [
            { t: "Guardar segredo", img: "misterio", ok: false, fb: "Segredo bom é tipo festa surpresa — deixa todo mundo feliz depois. Segredo que pede silêncio merece ser contado, viu?" },
            { t: "Contar pra um adulto", img: "apoio", ok: true, fb: "Você quebrou o segredo certo! Quando alguém pede pra esconder algo dos adultos, é hora de contar pra alguém de confiança." }
          ]
        }
      ]
    },

    {
      id: 5, ilha: 1, titulo: "Missão: Cadê o Perigo?", icone: "conquistas", npc: NPC1, dobro: true,
      abertura: { texto: "Última missão da Ilha dos Mistérios! Um mapa cheio de pistas espera por você. Vamos mostrar tudo que já aprendeu?", btn: "Continuar" },
      aprendizado: "Desconfiar do perfil, não compartilhar dados e contar a um adulto: esse é o mapa dos mistérios.",
      atividades: [
        {
          titulo: "Caça ao Perigo", papel: "Revisão · achar sinais", tipo: "hunt", skin: "scene",
          dica: "Os sinais das fases anteriores estão escondidos no mapa. Toque em cada sinal de alerta!",
          pergunta: "Toque nos 4 sinais de alerta escondidos na cena.",
          rounds: [{
            itens: [
              { img: "anonimo",  t: "Perfil suspeito", ok: true, x: 14, y: 30, why: "Perfil suspeito encontrado!" },
              { img: "pare",     t: "Sinal de STOP", ok: true, x: 72, y: 24, why: "Sinal de STOP! Mensagem estranha à vista." },
              { img: "misterio", t: "Pedido de segredo", ok: true, x: 45, y: 62, why: "Boca fechada: pedido de segredo." },
              { img: "dadosPessoais", t: "Pedido de dados pessoais", ok: true, x: 84, y: 66, why: "Quem pede dados pessoais merece desconfiança." },
              { img: "diamond", t: "Diamante", ok: false, x: 28, y: 72, why: "Só um diamante brilhante." },
              { img: "navio", t: "Navio", ok: false, x: 58, y: 18, why: "Só um navio passando, sem perigo." },
              { img: "bau", t: "Baú do tesouro", ok: false, x: 8, y: 62, why: "Esse baú de tesouro é inofensivo." },
              { img: "luneta", t: "Luneta", ok: false, x: 92, y: 36, why: "Uma luneta de pirata, tranquila." }
            ]
          }],
          fbOk: "Você achou todos os sinais escondidos! Olho de águia, pirata!"
        },
        {
          titulo: "O Que Você Faria", papel: "Prática · mini-quiz", tipo: "quiz", tempoCapitao: 20,
          perguntas: [
            { cena: "Um perfil que você não conhece pede pra ser seu amigo.", q: "O que você faz?",
              ops: [{ t: "Aceito, parece legal", ok: false }, { t: "Não aceito e continuo jogando", ok: true }],
              fb: "Perfis desconhecidos não precisam ser aceitos." },
            { cena: "Alguém pergunta o endereço da sua casa.", q: "O que você faz?",
              ops: [{ t: "Conto, ele parece simpático", ok: false }, { t: "Não conto: endereço é só meu e da minha família", ok: true }],
              fb: "Endereço é dado pessoal e não se conta para quem só conhecemos pela tela." },
            { cena: "Uma mensagem diz: “não conta pra ninguém”.", q: "O que você faz?",
              ops: [{ t: "Guardo o segredo", ok: false }, { t: "Conto para um adulto de confiança", ok: true }],
              fb: "Segredo que pede silêncio dos adultos deve ser contado." },
            { cena: "Alguém insiste depois do seu “não”.", q: "O que você faz?",
              ops: [{ t: "Respondo várias vezes pedindo que pare", ok: false }, { t: "Ignoro e, se puder, bloqueio", ok: true }],
              fb: "Não é preciso explicar nada a quem insiste. Ignorar ou bloquear protege você." }
          ],
          fbOk: "Mandou bem em todas as cenas! Você lembra de tudo que aprendeu nas fases 1 a 4."
        },
        {
          titulo: "O Mapa dos Mistérios", papel: "Escolha final", tipo: "sequence",
          pergunta: "Monte a sequência certa, tocando nos cartões na ordem.",
          dica: "Primeiro a gente desconfia, depois se protege e, por fim, pede ajuda.",
          passos: [
            { t: "Desconfiar do perfil", img: "anonimo" },
            { t: "Não compartilhar dados", img: "dadosPessoais" },
            { t: "Contar pra um adulto", img: "apoio" }
          ],
          fbOk: "Sequência perfeita: desconfiar do perfil, não compartilhar dados e contar pra um adulto!"
        }
      ]
    },

    /* =====================  ILHA 2 · ESCOLHAS  ===================== */
    {
      id: 6, ilha: 2, titulo: "Vamos Conversar em Outro Lugar?", icone: "comunicacao", npc: NPC2,
      abertura: { texto: "Bem-vindo à Ilha das Escolhas, navegador! Aqui você vai treinar como escolher o caminho mais seguro — mesmo quando alguém tenta te levar pra outro lugar.", btn: "COMEÇAR A AVENTURA" },
      missao: "Depois de bloquear aquele perfil misterioso, um novo contato apareceu no seu caminho... será que é o mesmo tipo de conversa de novo? Complete as 3 atividades para descobrir.",
      aprendizado: "Quando alguém quer levar a conversa para um lugar mais privado, é hora de prestar atenção redobrada.",
      atividades: [
        {
          titulo: "A Conversa Mudou", papel: "Descoberta", tipo: "discover",
          cena: { tipo: "chat", com: NPC2, msgs: [
            { de: "npc", t: "Oi! Vi que você joga muito bem!" },
            { de: "eu", t: "Oi! Valeu!" },
            { de: "npc", t: "Vamos conversar por outro aplicativo? Lá é mais tranquilo, só nós dois." }
          ]},
          texto: "A conversa começou simpática... e depois mudou de rumo.",
          dica: "Perceba: ele quer levar a conversa para um lugar mais reservado, longe de outras pessoas. Isso é um sinal para prestar atenção."
        },
        {
          titulo: "Porta Secreta", papel: "Prática", tipo: "doors",
          dica: "Nem toda porta que parece convidativa leva a um lugar seguro. Vamos abrir com cuidado?",
          pergunta: "Toque em cada porta e diga se ela é segura ou arriscada.",
          portas: [
            { img: "assistencia", t: "Grupo da família", seguro: true, why: "Seus familiares estão lá e podem acompanhar a conversa." },
            { img: "escudo", t: "Chat do jogo com moderação", seguro: true, why: "Tem regras, moderadores e um jeito de pedir ajuda." },
            { img: "anonimo", t: "Chat privado sugerido por alguém pouco conhecido", seguro: false, why: "Longe dos olhares de outras pessoas. Isso é um risco!" },
            { img: "comunicacao", t: "Aplicativo desconhecido que um perfil novo pediu pra você baixar", seguro: false, why: "Se alguém que você mal conhece quer te levar para outro app, desconfie." },
            { img: "apoio", t: "Grupo da turma criado pela sua professora", seguro: true, why: "Um adulto de confiança está por perto." }
          ],
          fbOk: "Você abriu todas as portas com cuidado! Espaços com pessoas de confiança são seguros; convites reservados de desconhecidos, não."
        },
        {
          titulo: "Pare por Aqui", papel: "Escolha", tipo: "choice", resposta: true,
          cena: { tipo: "chat", com: NPC2, msgs: [
            { de: "npc", t: "Vamos, vai! Prometo que lá é mais legal." },
            { de: "npc", t: "Só me passa seu contato e a gente conversa lá." }
          ]},
          pergunta: "Ele insiste no convite. O que você responde?",
          opcoes: [
            { t: "Sim, vamos conversar lá", ok: false, fb: "Vamos repensar: quando alguém quer sair do olhar de outras pessoas para conversar só com você, isso merece atenção redobrada." },
            { t: "Não, prefiro continuar aqui", ok: true, fb: "Boa escolha! Continuar a conversa num lugar onde seus responsáveis podem acompanhar é sempre mais seguro." }
          ]
        }
      ]
    },

    {
      id: 7, ilha: 2, titulo: "Escolha a Mensagem Certa", icone: "falando", npc: NPC2,
      abertura: { texto: "Às vezes, a resposta certa muda tudo. Vamos treinar juntos algumas respostas de navegador esperto?", btn: "Continuar" },
      aprendizado: "Dá para ser educado e firme ao mesmo tempo: “Prefiro não falar sobre isso. Vou perguntar pro meu responsável.”",
      atividades: [
        {
          titulo: "Qual Resposta Você Mandaria", papel: "Descoberta · múltipla escolha", tipo: "choice", resposta: true,
          cena: { tipo: "chat", com: NPC2, msgs: [
            { de: "npc", t: "Você pode me mandar uma foto sua? Só pra eu saber como você é!" }
          ]},
          pergunta: "Qual resposta você mandaria?",
          dica: "Não existe só uma forma de responder — mas algumas são bem mais seguras que outras.",
          opcoes: [
            { t: "Claro! Vou te mandar agora.", ok: false, fb: "Vamos pensar de novo: fotos são informações pessoais e não devem ir para quem só conhecemos pela tela." },
            { t: "Prefiro não mandar. Vou perguntar pro meu responsável.", ok: true, fb: "Ótima resposta! Firme, educada e ainda chama um adulto de confiança para a conversa." },
            { t: "Mando se você prometer que não conta pra ninguém.", ok: false, fb: "Vamos pensar de novo: aceitar um segredo é entrar no jogo de quem quer esconder algo dos adultos." }
          ]
        },
        {
          titulo: "Monte a Mensagem", papel: "Prática · montar frase", tipo: "compose",
          pergunta: "Escolha um bloco de cada grupo para montar uma resposta segura e educada.",
          dica: "Uma boa resposta é gentil, mas firme. Escolha um bloco de cada grupo.",
          grupos: [
            { label: "Comece assim…", blocos: [
              { t: "Prefiro não falar sobre isso", ok: true },
              { t: "Tá bom, te conto tudo", ok: false },
              { t: "Só se você guardar segredo", ok: false }
            ]},
            { label: "…e termine assim", blocos: [
              { t: "vou perguntar pro meu responsável.", ok: true },
              { t: "não conta pra ninguém, tá?", ok: false },
              { t: "me manda seu endereço também.", ok: false }
            ]}
          ],
          fbOk: "Boa mensagem! Ser educado e firme ao mesmo tempo é uma combinação poderosa.",
          fbBad: "Quase! Essa mensagem deixa uma brecha. Que tal montar uma resposta educada, firme e que chame um adulto?"
        },
        {
          titulo: "Duelo de Respostas", papel: "Escolha · duelo de cartas", tipo: "choice", skin: "cartas", resposta: true,
          cena: { tipo: "chat", com: NPC2, msgs: [
            { de: "npc", t: "Me fala em qual escola você estuda! Eu passo aí pra te ver." }
          ]},
          pergunta: "Escolha a carta que você jogaria no duelo!",
          dica: "Uma carta protege, a outra deixa uma brecha. Qual vai vencer o duelo?",
          opcoes: [
            { t: "Não vou falar disso. Vou contar pro meu responsável.", tag: "Segura", img: "escudo", ok: true, fb: "Vitória! Uma resposta educada e firme é uma arma e tanto contra pedidos estranhos." },
            { t: "Estudo na Escola Central, no turno da manhã!", tag: "Arriscada", img: "atencao", ok: false, fb: "Essa resposta deixou uma brecha... Bora escolher a carta mais segura dessa vez?" }
          ]
        }
      ]
    },

    {
      id: 8, ilha: 2, titulo: "Hora de Sair", icone: "corre", npc: NPC2,
      abertura: { texto: "Às vezes, a atitude mais corajosa é simplesmente sair da conversa. Vamos descobrir quando é a hora certa?", btn: "Continuar" },
      aprendizado: "Sair de uma conversa que incomoda não é falta de educação — é se cuidar.",
      atividades: [
        {
          titulo: "Isso Está Estranho", papel: "Descoberta", tipo: "discover",
          cena: { tipo: "chat", com: NPC2, msgs: [
            { de: "npc", t: "Por que você demora tanto pra responder?" },
            { de: "npc", t: "Ei! Muda de assunto: você tá sozinho em casa agora?" },
            { de: "npc", t: "Se você sair, eu vou ficar muito bravo." }
          ]},
          texto: "A conversa vai ficando cada vez mais desconfortável.",
          dica: "Seu alarme interno está tocando? Confie nele."
        },
        {
          titulo: "Encontre a Saída", papel: "Prática", tipo: "hunt", skin: "app",
          dica: "Toda plataforma tem um jeito de sair de uma conversa. Vamos encontrar o botão certo?",
          pergunta: "Ache o botão de sair / bloquear escondido entre os outros ícones.",
          rounds: [{
            titulo: "Joguinho · chat", contato: NPC2, msgs: ["Por que você não responde?", "Se você sair, eu vou ficar muito bravo."],
            itens: [
              { img: "config", t: "Configurações", ok: false, why: "Esse é o botão de configurações, não o de sair." },
              { img: "exclamacao3", t: "Notificações", ok: false, why: "Esse mostra avisos, não sai da conversa." },
              { img: "falando", t: "Som", ok: false, why: "Esse liga e desliga o som." },
              { img: "bloquearUsuario", t: "Bloquear / sair da conversa", ok: true, why: "Achou! Esse botão encerra a conversa e bloqueia o contato." },
              { img: "moedas", t: "Loja", ok: false, why: "Esse leva para a loja do jogo." },
              { img: "editar", t: "Tema", ok: false, why: "Esse muda o visual do jogo." }
            ]
          }],
          fbOk: "Você achou o botão! Saber onde ele fica ajuda a agir rápido quando a conversa incomoda."
        },
        {
          titulo: "Eu Posso Parar", papel: "Escolha", tipo: "choice",
          cena: { tipo: "chat", com: NPC2, msgs: [
            { de: "npc", t: "Se você sair eu vou ficar muito bravo!" }
          ]},
          pergunta: "Você está desconfortável. O que faz?",
          opcoes: [
            { t: "Sair da conversa e contar pra um adulto", img: "corre", ok: true, fb: "Isso mesmo! Sair de uma conversa que incomoda não é falta de educação — é se cuidar." },
            { t: "Continuar tentando resolver sozinho", img: "interrogacao", ok: false, fb: "Vamos pensar de novo: você não precisa resolver isso sozinho. Sair e contar pra alguém de confiança também é uma ótima escolha." }
          ]
        }
      ]
    },

    {
      id: 9, ilha: 2, titulo: "Ative o Escudo", icone: "escudo", npc: NPC2,
      abertura: { texto: "Todo bom navegador tem um escudo. Vamos aprender a usá-lo direitinho?", btn: "Continuar" },
      aprendizado: "Bloquear é uma ferramenta de verdade: impede que a pessoa continue mandando mensagem.",
      atividades: [
        {
          titulo: "Conheça o Escudo", papel: "Descoberta · explicativa", tipo: "explain", video: "videos/fase9.mp4",
          slides: [
            { titulo: "O escudo existe nos aplicativos", img: "escudo", txt: "Nos jogos e aplicativos existe um ícone de bloqueio. Geralmente ele fica no perfil da pessoa ou nos três pontinhos." },
            { titulo: "O que ele faz?", img: "bloquearUsuario", txt: "Ao bloquear alguém, essa pessoa não consegue mais te mandar mensagem." },
            { titulo: "Você pode usar sempre", img: "escudo", apoio: true, txt: "O escudo não é feitiço mágico, é uma ferramenta de verdade que existe nos aplicativos — e você pode usar sempre que precisar." }
          ]
        },
        {
          titulo: "Quem Precisa do Escudo?", papel: "Prática · classificar", tipo: "classify",
          pergunta: "Arraste (ou toque) cada situação para o grupo certo.",
          dica: "O escudo é para quem te deixa desconfortável e não para quando é só uma discussão do dia a dia.",
          baldes: [
            { id: "sim", t: "Merece o escudo", img: "escudo" },
            { id: "nao", t: "Não precisa bloquear", img: "apoio" }
          ],
          itens: [
            { t: "Desconhecido que insiste em mandar mensagens", img: "bubbleChat", b: "sim" },
            { t: "Perfil que pede seu endereço e não para de te chamar", img: "anonimo", b: "sim" },
            { t: "Amigo da escola com quem você teve um desentendimento bobo", img: "pedidoAmizade", b: "nao" },
            { t: "Colega que discordou de você durante o jogo", img: "comunicacao", b: "nao" },
            { t: "Alguém que continua te chamando mesmo depois do seu “não”", img: "exclamacao3", b: "sim" }
          ],
          fbOk: "Boa! O escudo é para quem insiste em te deixar desconfortável — não pra qualquer discussão do dia a dia."
        },
        {
          titulo: "Bloqueio Ativado", papel: "Escolha final", tipo: "block",
          cena: { tipo: "chat", com: NPC2, msgs: [
            { de: "npc", t: "Por que você não responde? Volta aqui!" },
            { de: "npc", t: "Vou continuar te mandando mensagem!" }
          ]},
          botao: "Bloquear Sombra_das_Marés",
          fbOk: "Escudo ativado! Agora esse contato não pode mais te mandar mensagem. Você protegeu seu próprio espaço — e isso é coisa de navegador experiente."
        }
      ]
    },

    {
      id: 10, ilha: 2, titulo: "Missão: Escolha Segura", icone: "conquistas", npc: NPC2, dobro: true,
      abertura: { texto: "Última missão da Ilha das Escolhas! Vamos mostrar tudo que você aprendeu sobre fazer escolhas seguras?", btn: "Continuar" },
      aprendizado: "Reconhecer, pensar e agir: identificar o sinal, responder com firmeza, sair e ativar o escudo.",
      atividades: [
        {
          titulo: "Identifique", papel: "Descoberta / revisão", tipo: "hunt", skin: "scene",
          dica: "Estão escondidos aqui os sinais das fases 6 a 9. Consegue achar todos?",
          pergunta: "Toque em cada sinal: convite para sair da plataforma, mensagem estranha, desconforto e o botão de escudo.",
          rounds: [{
            itens: [
              { img: "comunicacao", t: "Convite para conversar em outro aplicativo", ok: true, x: 16, y: 28, why: "Convite para sair da plataforma! Sinal de alerta." },
              { img: "bubbleChat", t: "Mensagem estranha pedindo foto", ok: true, x: 68, y: 22, why: "Mensagem estranha: pedir foto é sinal de alerta." },
              { img: "alerta", t: "Sinal de desconforto", ok: true, x: 40, y: 66, why: "Se você ficou desconfortável, confie nesse alarme interno." },
              { img: "escudo", t: "Botão de escudo (bloquear)", ok: true, x: 84, y: 64, why: "O escudo! A ferramenta para se proteger." },
              { img: "estrela", t: "Estrela", ok: false, x: 10, y: 66, why: "Só uma estrela brilhando." },
              { img: "moedas", t: "Moedas", ok: false, x: 56, y: 40, why: "Só algumas moedas de ouro." },
              { img: "medalha", t: "Medalha", ok: false, x: 90, y: 30, why: "Só uma medalha de pirata." }
            ]
          }],
          fbOk: "Você identificou todos os sinais das fases 6 a 9. Pirata esperto!"
        },
        {
          titulo: "Pense Rápido", papel: "Prática · quiz cronometrado", tipo: "quiz", tempo: 15,
          perguntas: [
            { q: "Alguém que você mal conhece chama para conversar em outro aplicativo, “só nós dois”.",
              ops: [{ t: "Recuso e continuo onde meus responsáveis podem ver", ok: true }, { t: "Aceito, parece legal", ok: false }],
              fb: "Espaços reservados longe dos olhares de outras pessoas merecem atenção." },
            { q: "Um jogador pede uma foto sua. Qual resposta é mais segura?",
              ops: [{ t: "Mando, mas só dessa vez", ok: false }, { t: "Prefiro não falar sobre isso", ok: true }],
              fb: "Uma resposta educada e firme protege você." },
            { q: "A conversa ficou desconfortável. E agora?",
              ops: [{ t: "Saio da conversa e conto pra um adulto", ok: true }, { t: "Continuo tentando resolver sozinho", ok: false }],
              fb: "Você não precisa resolver isso sozinho." },
            { q: "Para que serve o escudo?",
              ops: [{ t: "Deixa o jogo mais rápido", ok: false }, { t: "Impede que a pessoa continue mandando mensagem", ok: true }],
              fb: "O escudo bloqueia quem insiste em te incomodar." },
            { q: "Um desconhecido insiste depois do seu “não”.",
              ops: [{ t: "Bloqueio", ok: true }, { t: "Respondo várias vezes", ok: false }],
              fb: "Bloquear é uma opção segura e você pode usar sempre." }
          ],
          fbOk: "Rápido e certeiro! Você respondeu tudo como um navegador esperto."
        },
        {
          titulo: "Proteja-se", papel: "Escolha final", tipo: "sequence",
          pergunta: "Monte a sequência final de decisões, tocando nos cartões na ordem.",
          dica: "Reconhecer → responder → sair → proteger.",
          passos: [
            { t: "Reconhecer o sinal", img: "exclamacao3" },
            { t: "Escolher a resposta certa", img: "bubbleChat" },
            { t: "Sair da conversa, se precisar", img: "corre" },
            { t: "Ativar o escudo", img: "escudo" }
          ],
          fbOk: "Sequência de mestre: reconhecer o sinal, responder com firmeza, sair e ativar o escudo!"
        }
      ]
    },

    /* =====================  ILHA 3 · GUARDIÕES  ===================== */
    {
      id: 11, ilha: 3, titulo: "Meu Time de Confiança", icone: "apoio", npc: NPC3,
      abertura: { texto: "Bem-vindo à Ilha dos Guardiões, navegador! Aqui você vai descobrir que nenhum bom pirata navega sozinho. Todo capitão tem uma tripulação de confiança para chamar quando o mar fica agitado.", btn: "COMEÇAR A AVENTURA" },
      missao: "Você já aprendeu a reconhecer os perigos e a fazer escolhas seguras. Agora chegou a hora de reunir o seu time de guardiões. Complete as 3 atividades para montar a sua tripulação de confiança.",
      aprendizado: "Um guardião é um adulto que você conhece de verdade e em quem confia. Quanto mais guardiões, mais forte fica o seu navio.",
      atividades: [
        {
          titulo: "Quem São Meus Guardiões", papel: "Descoberta", tipo: "discover",
          cena: { tipo: "guardioes" },
          texto: "Conheça a Capitã Bússola: ela explica quem pode apontar o caminho certo.",
          dica: "Um guardião é um adulto que você conhece de verdade, que cuida de você e em quem você confia. Vamos descobrir quem faz parte do seu time?"
        },
        {
          titulo: "Monte Sua Tripulação", papel: "Prática · selecionar", tipo: "classify",
          pergunta: "Arraste (ou toque) as cartas para o convés do navio: quem entra no Time de Confiança?",
          dica: "O seu time de confiança é feito de gente que você conhece na vida real e que cuida de você. Quanto mais guardiões, mais forte fica o seu navio!",
          baldes: [
            { id: "time", t: "Time de Confiança", img: "navio", sub: "convés do navio" },
            { id: "fora", t: "Fora da tripulação", img: "anonimo", sub: "só conheço pela tela" }
          ],
          itens: [
            { t: "Mãe", img: "usuario", b: "time" },
            { t: "Pai", img: "usuario", b: "time" },
            { t: "Responsável", img: "usuario", b: "time" },
            { t: "Professora", img: "usuario", b: "time" },
            { t: "Avó", img: "usuario", b: "time" },
            { t: NPC1, sub: "só conheço pela tela", img: "anonimo", b: "fora" },
            { t: "Perfil anônimo", sub: "nunca vi pessoalmente", img: "anonimo", b: "fora" }
          ],
          fbOk: "Tripulação formada! Seu time de confiança tem gente que você conhece de verdade e que cuida de você."
        },
        {
          titulo: "Chamar Ajuda é de Corajoso", papel: "Escolha", tipo: "choice",
          cena: { tipo: "chat", com: "Chat do jogo", msgs: [
            { de: "npc", t: "Ei, manda uma foto da sua casa! E me diz seu endereço!", nome: "jogador_estranho" }
          ]},
          pergunta: "Algo estranho aconteceu no chat de um jogo. O que você faz?",
          opcoes: [
            { t: "Tentar resolver sozinho e não contar", img: "misterio", ok: false, fb: "Vamos repensar: nenhum pirata de verdade encara a tempestade sem chamar a tripulação. Contar para um guardião deixa tudo mais seguro." },
            { t: "Chamar um guardião do meu time", img: "falando", ok: true, fb: "Isso aí! Chamar um adulto de confiança é uma das atitudes mais corajosas e espertas de um navegador. Você nunca precisa enfrentar o mar sozinho." }
          ]
        }
      ]
    },

    {
      id: 12, ilha: 3, titulo: "Quebrando o Silêncio", icone: "falando", npc: NPC3,
      abertura: { texto: "Às vezes acontece algo que deixa a gente com medo ou vergonha de contar. Mas todo guardião sabe de um truque: falar o que aconteceu é o primeiro passo para ficar seguro de novo.", btn: "Continuar" },
      aprendizado: "Contar o que aconteceu é sempre a atitude certa, mesmo com medo ou vergonha. A culpa nunca é da criança.",
      atividades: [
        {
          titulo: "O Peso do Segredo", papel: "Descoberta", tipo: "bau",
          texto: "Este navegador carrega sozinho um baú pesadão: é o segredo dele. O que acontece quando ele conta para a Capitã Bússola?",
          dica: "Guardar sozinho uma coisa que te assusta pesa demais. Dividir com um guardião faz esse peso diminuir."
        },
        {
          titulo: "Não é Culpa Sua", papel: "Prática · Verdade ou Mito", tipo: "quiz", vm: true,
          dica: "Quando alguém mais velho tenta enganar ou assustar uma criança, a culpa nunca é da criança. Bora derrubar esses mitos?",
          perguntas: [
            { q: "“Se eu contar, vou arrumar encrenca.”", vm: false, fb: "Mito! Quem conta pede ajuda e não faz nada de errado." },
            { q: "“A culpa é minha por ter respondido.”", vm: false, fb: "Mito! Quando um adulto engana ou assusta uma criança, a culpa nunca é dela." },
            { q: "“Contar para um adulto me protege.”", vm: true, fb: "Verdade! Um guardião sabe o que fazer para te proteger." },
            { q: "“Se alguém pede segredo, eu tenho que guardar.”", vm: false, fb: "Mito! Segredo que pede silêncio dos adultos deve ser contado." },
            { q: "“Sentir vergonha é normal, e mesmo assim posso contar.”", vm: true, fb: "Verdade! Todo mundo sente vergonha às vezes, e contar ajuda a ficar seguro." }
          ],
          fbOk: "Mitos derrubados! Você sabe que a culpa nunca é da criança."
        },
        {
          titulo: "Encontre as Palavras", papel: "Escolha · montar frase", tipo: "compose",
          pergunta: "Monte uma frase para pedir ajuda a um guardião. Escolha um bloco de cada grupo.",
          dica: "Você não precisa saber explicar tudo direitinho. É só começar a falar!",
          grupos: [
            { label: "Comece assim…", blocos: [
              { t: "Preciso te contar uma coisa", ok: true },
              { t: "Não é nada, esquece", ok: false },
              { t: "Você vai ficar bravo comigo", ok: false }
            ]},
            { label: "…e continue assim", blocos: [
              { t: "uma pessoa na internet me deixou desconfortável.", ok: true },
              { t: "eu vou resolver isso sozinho.", ok: false },
              { t: "prefiro que você não saiba.", ok: false }
            ]}
          ],
          fbOk: "Perfeito! Você não precisa saber explicar tudo direitinho. É só começar a falar, e um guardião te ajuda com o resto.",
          fbBad: "Vamos tentar de novo: mesmo quando é difícil achar as palavras, contar sempre ajuda mais do que guardar sozinho."
        }
      ]
    },

    {
      id: 13, ilha: 3, titulo: "Sinal de Socorro", icone: "botaoVermelho", npc: NPC3,
      abertura: { texto: "Todo bom navio tem uma bandeira de socorro para pedir ajuda de longe. Na internet também existe um jeito de sinalizar quando algo está errado. Vamos aprender?", btn: "Continuar" },
      aprendizado: "Denunciar não é dedurar. É usar uma ferramenta de verdade, de preferência ao lado de um adulto de confiança.",
      atividades: [
        {
          titulo: "A Bandeira de Alerta", papel: "Descoberta · explicativa", tipo: "explain", video: "videos/fase13.mp4",
          slides: [
            { titulo: "O botão Denunciar", img: "botaoVermelho", txt: "Nos aplicativos e redes existe o botão Denunciar (ou Reportar). Ele avisa a plataforma sobre alguém que está agindo de forma errada." },
            { titulo: "Denunciar não é dedurar", img: "alerta", apoio: true, txt: "Denunciar é diferente de dedurar. É usar uma ferramenta de verdade para avisar que alguém passou dos limites e proteger você e outras crianças." },
            { titulo: "Canais oficiais", img: "policial", txt: "Além dos aplicativos, existem canais oficiais de ajuda, como o Disque 100, que adultos de confiança também podem acionar." }
          ]
        },
        {
          titulo: "Onde Fica o Sinal", papel: "Prática · achar a ferramenta", tipo: "hunt", skin: "app",
          dica: "Cada aplicativo tem o seu jeito de denunciar, quase sempre escondido nos três pontinhos ou no menu. Vamos caçar esse botão?",
          pergunta: "Em cada aplicativo, toque no lugar onde fica o menu com a opção Denunciar.",
          rounds: [
            { titulo: "Chat de um jogo", contato: "jogador_estranho", msgs: ["Me passa seu endereço agora!"], itens: [
              { img: "exclamacao3", t: "Notificações", ok: false, why: "Esse mostra avisos." },
              { img: "config", t: "Configurações", ok: false, why: "Esse ajusta o app, mas não é onde se denuncia." },
              { e: "⋮", t: "Três pontinhos", ok: true, why: "Achou! Nos três pontinhos aparece a opção Denunciar." },
              { img: "luneta", t: "Busca", ok: false, why: "Esse serve para procurar coisas." }
            ]},
            { titulo: "Perfil de uma rede social", contato: "perfil_desconhecido", msgs: ["Posta uma foto sua pra mim!"], itens: [
              { img: "estrela", t: "Curtir", ok: false, why: "Esse serve para curtir." },
              { img: "comunicacao2", t: "Compartilhar", ok: false, why: "Esse compartilha o perfil." },
              { e: "☰", t: "Menu", ok: true, why: "Achou! No menu você encontra Denunciar ou Reportar." },
              { img: "bubbleChat", t: "Comentários", ok: false, why: "Esse abre os comentários." }
            ]},
            { titulo: "Mensagens diretas", contato: "anonimo_123", msgs: ["Não conta pra ninguém que a gente conversa."], itens: [
              { img: "falando", t: "Ligar", ok: false, why: "Esse liga para a pessoa." },
              { img: "editar", t: "Anexar", ok: false, why: "Esse anexa arquivos." },
              { img: "naoGosto", t: "Emojis", ok: false, why: "Esse abre os emojis." },
              { e: "⋯", t: "Mais opções", ok: true, why: "Achou! Em “mais opções” você pode denunciar ou bloquear." }
            ]}
          ],
          fbOk: "Você caçou o botão nos três aplicativos! Agora você sabe onde procurar."
        },
        {
          titulo: "Denuncio com um Guardião", papel: "Escolha", tipo: "choice",
          cena: { tipo: "chat", com: "Capitã Bússola", msgs: [
            { de: "npc", t: "Você achou o botão de denúncia no perfil que te deixou desconfortável.", nome: "Capitã Bússola" }
          ]},
          pergunta: "O que você faz?",
          opcoes: [
            { t: "Denunciar junto com um adulto de confiança", img: "apoio", ok: true, fb: "Isso mesmo! Denunciar já é ótimo, e fazer isso ao lado de um guardião é ainda mais forte. Adultos de confiança também podem acionar canais oficiais, como o Disque 100." },
            { t: "Denunciar escondido e não contar para ninguém", img: "misterio", ok: false, fb: "Vamos repensar: a denúncia é importante, e você não precisa dar esse passo sozinho. Um guardião pode te acompanhar em cada etapa." }
          ]
        }
      ]
    },

    {
      id: 14, ilha: 3, titulo: "Guardião de um Amigo", icone: "pirata", npc: NPC3,
      abertura: { texto: "Um guardião de verdade também cuida da tripulação. E se fosse um amigo seu vivendo uma situação estranha na internet? Vamos aprender a ajudar?", btn: "Continuar" },
      aprendizado: "Um bom amigo não guarda esse tipo de segredo. Ele fica ao lado e ajuda a procurar um guardião.",
      atividades: [
        {
          titulo: "O Amigo Preocupado", papel: "Descoberta", tipo: "discover",
          cena: { tipo: "chat", com: "Leo (seu amigo)", msgs: [
            { de: "npc", t: "Posso te contar uma coisa? Fico meio sem graça...", nome: "Leo" },
            { de: "npc", t: "Um perfil desconhecido anda mandando mensagens estranhas pra mim.", nome: "Leo" },
            { de: "npc", t: "Eu não sei o que fazer.", nome: "Leo" }
          ]},
          texto: "O seu amigo confiou em você para contar isso.",
          dica: "Quando um amigo confia em você para contar uma coisa dessas, ele já está sendo corajoso. Como será que dá para ajudar?"
        },
        {
          titulo: "O Que Eu Digo pro Meu Amigo", papel: "Prática · múltipla escolha", tipo: "quiz",
          perguntas: [
            { cena: "Seu amigo Leo contou que um perfil desconhecido manda mensagens estranhas.", q: "Qual é a melhor forma de apoiar o Leo?",
              ops: [
                { t: "Você fez certo em me contar, vamos falar com um adulto juntos.", ok: true },
                { t: "Não conta para ninguém, deixa quieto.", ok: false },
                { t: "Responde pra ele parar, resolve sozinho.", ok: false }
              ],
              fb: "Um bom amigo não guarda esse tipo de segredo. Ele fica do lado e ajuda a procurar um guardião." }
          ],
          fbOk: "Ótima escolha! Um bom amigo não guarda esse tipo de segredo. Ele fica do lado e ajuda a procurar um guardião."
        },
        {
          titulo: "Juntos Somos Mais Fortes", papel: "Escolha", tipo: "choice",
          cena: { tipo: "chat", com: "Leo (seu amigo)", msgs: [
            { de: "npc", t: "Será que eu conto pra alguém? Tenho medo...", nome: "Leo" }
          ]},
          pergunta: "O que você faz?",
          opcoes: [
            { t: "Ir com o amigo falar com um adulto de confiança", img: "apoio", ok: true, fb: "Isso aí! Acompanhar um amigo até um adulto de confiança é coisa de guardião de verdade. Ninguém precisa enfrentar isso sozinho." },
            { t: "Dizer para o amigo resolver sozinho", img: "nao", ok: false, fb: "Vamos pensar de novo: o seu amigo vai se sentir bem mais seguro se você estiver ao lado dele nessa hora." }
          ]
        }
      ]
    },

    {
      id: 15, ilha: 3, titulo: "Missão: Guardião dos Mares", icone: "bau", npc: NPC3, dobro: true,
      abertura: { texto: "Última missão da sua grande aventura, navegador! Chegou a hora de mostrar que você virou um verdadeiro Guardião dos Mares.", btn: "Continuar" },
      aprendizado: "Reconhecer o perigo, fazer a escolha segura, contar para um adulto de confiança e denunciar quando for preciso.",
      atividades: [
        {
          titulo: "Chamando a Tripulação", papel: "Revisão · associar", tipo: "match",
          pergunta: "Toque em uma situação e depois na ação correta para ligá-las.",
          dica: "Cada situação tem uma ação de guardião que combina com ela.",
          pares: [
            { a: "Alguém pediu segredo e você está com medo de contar", b: "Quebrar o silêncio e falar com um guardião" },
            { a: "Você precisa saber em quem confiar", b: "Montar o time de confiança" },
            { a: "Alguém passou dos limites no aplicativo", b: "Usar o sinal de socorro (denunciar)" },
            { a: "Um amigo contou que está com problema", b: "Ir junto com ele falar com um adulto" }
          ],
          fbOk: "Tudo ligado! Cada situação tem uma ação certa de guardião."
        },
        {
          titulo: "Guardião em Ação", papel: "Prática · mini-quiz final", tipo: "quiz", tempoCapitao: 20,
          perguntas: [
            { q: "Um perfil novo, sem foto, pede para ser seu amigo.", ops: [{ t: "Desconfio e não aceito", ok: true }, { t: "Aceito, deve ser legal", ok: false }], fb: "Perfis sem foto e sem amigos em comum merecem desconfiança." },
            { q: "Qual informação é só sua e da sua família?", ops: [{ t: "A cor preferida", ok: false }, { t: "A senha", ok: true }], fb: "Senha, endereço, escola e fotos são informações protegidas." },
            { q: "Alguém pede segredo e diz para não contar aos adultos.", ops: [{ t: "Conto para um adulto de confiança", ok: true }, { t: "Guardo o segredo", ok: false }], fb: "Segredo que pede silêncio dos adultos deve ser contado." },
            { q: "A conversa está te incomodando.", ops: [{ t: "Saio da conversa e conto", ok: true }, { t: "Continuo tentando resolver sozinho", ok: false }], fb: "Sair de uma conversa que incomoda é se cuidar." },
            { q: "Uma pessoa insiste depois do seu “não”.", ops: [{ t: "Bloqueio", ok: true }, { t: "Respondo mais e mais", ok: false }], fb: "O escudo bloqueia quem insiste em te incomodar." },
            { q: "Você viu algo muito errado num aplicativo.", ops: [{ t: "Finjo que não vi", ok: false }, { t: "Denuncio junto com um adulto de confiança", ok: true }], fb: "Denunciar protege você e outras crianças. Adultos também podem acionar o Disque 100." }
          ],
          fbOk: "Guardião em ação! Você lembra de tudo das três ilhas."
        },
        {
          titulo: "A Rota do Guardião", papel: "Escolha final", tipo: "sequence",
          pergunta: "Monte a rota completa de um guardião, tocando nos cartões na ordem.",
          dica: "Primeiro reconhecemos, depois escolhemos com segurança, contamos e, se preciso, denunciamos.",
          passos: [
            { t: "Reconhecer o perigo", img: "exclamacao3" },
            { t: "Fazer a escolha segura", img: "escudo" },
            { t: "Contar para um adulto de confiança", img: "apoio" },
            { t: "Denunciar quando for preciso", img: "botaoVermelho" }
          ],
          fbOk: "Rota completa de guardião: reconhecer, escolher com segurança, contar e denunciar!"
        }
      ]
    }
  ];

  Object.assign(NK, { NPC1, NPC2, NPC3, ILHAS, FASES });
})();
