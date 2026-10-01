# NavegaKids

Jogo educativo sobre segurança na internet (grooming digital): 3 ilhas, 15 fases e 45 atividades.

## Como abrir

- Abra o `index.html` no navegador (dois cliques).
- Com `?dev=1` no fim do endereço, todas as fases ficam liberadas (modo de teste).
- Se uma mudança não aparecer, aperte **Ctrl+F5** para o navegador recarregar os arquivos.

## Arquivos

A **ordem dos scripts** no `index.html` importa: cada arquivo usa o que os anteriores carregaram.

| Arquivo | O que faz |
|---|---|
| `js/config.js` | liga cada imagem da pasta `img/` a um nome (e ao emoji usado se a imagem faltar) |
| `js/data.js` | todo o conteúdo: ilhas, fases e atividades |
| `js/pontuacao.js` | regras de pontos e estrelas (objeto `REGRAS`) |
| `js/progresso.js` | progresso da sessão: atividades feitas, erros, pontos, estrelas, selos, nome e tempo |
| `js/core.js` | utilitários, imagens, popups e cabeçalho |
| `js/activities.js`, `js/activities2.js` | os 12 tipos de atividade |
| `js/router.js` | as telas: Início, Ilhas, mapa da ilha, Abertura, Missões, Atividade, Conclusão, Diário e Certificado |
| `css/style.css` | todos os estilos |
| `img/` | artes do jogo |
| `testes/index.html` | testes automáticos (veja abaixo) |

Todo o código fica dentro de **uma única variável global**, `NavegaKids`, para não conflitar
com as landing pages dos outros times.

## Regras de progressão

- Cada atividade vale até **10 pontos**. Cada erro tira 3 (mínimo de 4).
- Estrelas por fase: **0 erros = 3★**, **1 a 2 erros = 2★**, **3 ou mais = 1★**.
- As fases 5, 10 e 15 valem **em dobro**.
- Refazer uma atividade guarda a **melhor** tentativa.
- Completar as 5 fases de uma ilha dá o **selo** da ilha.
- O progresso **não é salvo**: por decisão do grupo, ele volta ao zero ao recarregar a página.

Erros que **não** contam: abrir as portas, os "Avançar" das telas de leitura e tocar no botão
errado nas atividades de achar o botão no aplicativo (a criança está explorando a tela).

Para contar um erro numa atividade nova, chame `progresso.registrarErro()` quando a criança errar.

## O que aparece para a criança

- **Cabeçalho:** pontos (moedas) e estrelas.
- **Tela de nome:** ao clicar em "Navegar!", o jogo pergunta o nome ou apelido. Dá para pular
  e editar depois pelo lápis no Diário.
- **Fim de cada atividade:** popup com os pontos ganhos. No fim da fase, mostra as estrelas
  (cheias e apagadas) e o selo, se a ilha foi concluída.
- **Diário do Capitão:** nome, tempo jogado, level (fase atual), selos conquistados e as ilhas
  (liberadas ou bloqueadas).
- **Conclusão da última ilha:** botões "Ver meu certificado" e "Ver Diário do Capitão".

## Artes

Para trocar uma arte, coloque o PNG em `img/` e ajuste o nome em `js/config.js`.
Use nomes sem espaço e sem acento (ex.: `ilha-praia.png`).

| Arte | Onde aparece | Onde se configura |
|---|---|---|
| `estrela.png` | cabeçalho, mapa da ilha, popups e Diário | `js/config.js` (`estrela`) |
| `medalha.png` | ícone de "Principais Conquistas" no Diário e quadro "FASE ATUAL" da tela Missões | `js/config.js` (`medalha`) |
| `navio-pirata.png` | quadro "FASE ATUAL" do mapa de cada ilha | `js/config.js` (`navioPirata`) |
| `ilha-praia.png`, `ilha-arvores.png`, `ilha-montanhas.png` e as versões `-bloqueada` | seção "Ilhas" do Diário (1 praia, 2 árvores, 3 montanhas) | `js/data.js`, campos `icone` e `iconeBloqueado` de cada ilha |
| `luneta.png`, `escudo.png`, `navio-mayflower.png` | selo conquistado de cada ilha (Diário e popup) | `js/data.js`, campo `seloImg` de cada ilha |

**Artes recebidas que ainda não foram usadas** (falta definir o lugar):
as trilhas das ilhas (praia, montanhas, árvores) e o pergaminho "mapa para ilhas".

## Testes

Abra `testes/index.html` no navegador. Um robô joga as **45 atividades** pelas telas de verdade
e confere pontos, estrelas, selos, level, o Diário e o cabeçalho. Leva cerca de 1 minuto.
O resultado aparece no painel à esquerda (hoje: **42 testes passando**).

Rode os testes sempre que mudar o `data.js`, as atividades ou as regras de pontuação.
