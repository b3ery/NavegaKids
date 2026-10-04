/* ============================================================
   NavegaKids — ferramentas/extrair_frases.mjs
   Lista TODAS as frases que o botão "Ouvir" pode ler (textos de js/data.js +
   rótulos fixos da interface) e grava audios/frases.json no formato
   { "<chave>": "<frase>" }. Usa as MESMAS funções do jogo (js/apoio.js),
   então as chaves batem com as que o jogo procura.

   Uso (na pasta do projeto):   node ferramentas/extrair_frases.mjs
   Depois:                      node ferramentas/gerar_audios.mjs
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ler = f => fs.readFileSync(path.join(raiz, f), 'utf8');

// ambiente mínimo para rodar os scripts do jogo fora do navegador
const ctx = { console, location: { search: '', hash: '' }, fetch: () => Promise.reject(new Error('sem rede')), localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} } };
ctx.window = ctx;
ctx.document = { addEventListener() {}, querySelector() { return null; } };
ctx.addEventListener = () => {};
vm.createContext(ctx);
for (const f of ['js/config.js', 'js/data.js', 'js/pontuacao.js', 'js/progresso.js', 'js/apoio.js']) vm.runInContext(ler(f), ctx, { filename: f });
const NK = ctx.NavegaKids;
const { frasesDe, chaveFrase } = NK.voz;

// campos que não são falados (nomes de imagem, ids, tipos…)
const NAO_FALA = new Set(['img', 'icone', 'iconeBloqueado', 'seloImg', 'tipo', 'skin', 'video', 'b', 'id', 'cor', 'e', 'npc']);
const textos = [];
(function coletar(v, chave) {
  // "b" é o grupo no classificar (id curto, não falado), mas é a ação nos pares do associar
  if (typeof v === 'string') { if (!NAO_FALA.has(chave) || (chave === 'b' && /\s/.test(v))) textos.push(v); }
  else if (Array.isArray(v)) v.forEach(x => coletar(x, chave));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => coletar(x, k));
})({ ilhas: NK.ILHAS, fases: NK.FASES });
[NK.NPC1, NK.NPC2, NK.NPC3].forEach(n => textos.push(n));

// rótulos fixos da interface que aparecem dentro das atividades
textos.push(
  'Dica.', '1', '2', '3', '4', '5', '6', '520', 'Você', 'Verdade', 'Mito', 'Sim', 'Não', 'SIM', 'NÃO', 'Amigos', 'Seus amigos', 'Amigos dele (3):', 'Lobo_Sombrio', 'Kraken_77', 'Anonimo_99', 'Compare: algum amigo dele está na sua lista?', 'Pedido de amizade pendente', 'sem foto', 'Nv. 2', 'amigos', '2 dias', 'conta criada', 'partida', 'Amigos em comum', '0', 'Bio', 'Amo jogos de pirata! Bora jogar juntos?', 'Mensagem do pedido', 'Pendentes', 'Lupa ativa', 'Pirata0101', 'LEVEL 58',
  'Pirata2020', 'Pirata2130', 'Sereia0101', 'Peixinho01', 'Jogo Online', 'Começar a investigar', 'Explore a tela até encontrar algo importante.',
  'Olá, Pirata, poderia me adicionar? Quero ser seu amigo!', 'pedido pendente', 'Sua mensagem', 'escolha um bloco de cada grupo…',
  'Navegador', 'Capitã Bússola', 'Ninguém pode saber disso...', 'Obrigada por me contar! Agora a gente cuida disso juntos.',
  'Peso do segredo', 'Pesado demais', 'Bem mais leve!', 'Ele contou! Dividir o segredo com uma guardiã de confiança deixou o baú bem mais leve.',
  'Tudo classificado!', 'Isso mesmo!', 'Ainda não... tente outro grupo!', 'Sequência perfeita!', 'Ainda não é essa ordem... tente de novo!',
  'Combinação certa!', 'Essa combinação não é bem essa... tente outra!', 'Ótima mensagem!', 'Vamos tentar outra combinação.', 'O tempo acabou!',
  'Segura!', 'Arriscada!', 'toque para preencher', 'Escudo ativado!',
  'Um guardião é um adulto que você conhece de verdade, cuida de você e em quem você confia.',
  'Mãe / Pai / Responsável', 'Professora', 'Avó / Avô', 'Tio / Tia', 'Outro adulto de confiança',
  'Lobby da equipe', 'Chat do jogo', 'Leo (seu amigo)', 'jogador estranho',
  // popups (core.js, activities.js, router.js)
  'Parabéns, Pirata!', 'Muito bem de novo!', 'Você desbloqueou mais uma atividade, continue navegando pirata!',
  'Você já tinha concluído esta atividade.', 'Fase concluída!', 'Fase perfeita: nenhum erro!',
  'Errar faz parte de aprender! Cada erro te ensinou algo novo. Se quiser, refaça a fase para conquistar todas as estrelas: vale sempre a sua melhor tentativa.',
  'Este é o seu usuário', 'Aqui aparece seu nome de navegador dentro do jogo.', 'Aqui é seu level', 'Mostra o quanto você já avançou nas aventuras.',
  'Aqui são suas moedas', 'Você troca moedas por itens especiais no jogo.',
  'Qual é o seu nome de navegador?', 'Pode ser um apelido!', 'Como você quer navegar?', 'Trocar o nível', 'Escolha a idade de quem está jogando',
  'Marujo', 'Capitão', '8 anos', '9 e 10 anos', 'Voz que lê tudo sozinha, mais tempo para responder e dicas no botão', 'Desafio com tempo de 15 segundos e voz só se quiser',
  'Suas estrelas', 'Minhas Conquistas', 'Três acertos seguidos! Você está pegando o jeito!', 'Cinco seguidos! Navegador de olho vivo!',
  'Oito seguidos! Ninguém engana você!', 'Doze seguidos! Você é uma lenda dos mares!',
  ...NK.ILHAS.flatMap(il => [`Selo conquistado: ${il.selo}!`]),
  ...Array.from({ length: 13 }, (_, i) => `+${4 + i} PONTOS`), ...[20, 24, 28, 32, 36, 40].map(n => `+${n} PONTOS`)
);

const frases = {};
textos.forEach(t => frasesDe(t).forEach(f => { frases[chaveFrase(f)] ??= f; }));

const saida = path.join(raiz, 'audios', 'frases.json');
fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, JSON.stringify(frases, null, 1) + '\n');
const chars = Object.values(frases).reduce((s, f) => s + f.length, 0);
console.log(`${Object.keys(frases).length} frases (${chars} caracteres) → audios/frases.json`);
