# NavegaKids

Jogo educativo sobre segurança na internet (grooming digital): 3 ilhas, 15 fases e 45 atividades.

Abra `index.html` no navegador. Com `?dev=1` no endereço, todas as fases ficam liberadas (modo de teste).

## Arquivos (a ordem dos scripts no `index.html` importa)

| Arquivo | O que faz |
|---|---|
| `js/config.js` | liga cada imagem da pasta `img/` a um nome |
| `js/data.js` | todo o conteúdo: ilhas, fases e atividades |
| `js/pontuacao.js` | regras de pontos e estrelas (objeto `REGRAS`) |
| `js/progresso.js` | progresso da sessão: atividades feitas, erros, pontos, estrelas, selos, nome, tempo |
| `js/core.js` | utilitários, imagens, popups e cabeçalho |
| `js/activities.js`, `js/activities2.js` | os 12 tipos de atividade |
| `js/router.js` | as telas (Home, Ilhas, Missões, Diário, Certificado...) |
| `testes/index.html` | testes automáticos: um robô joga as 45 atividades e confere as regras |

Todo o código fica dentro de **uma única variável global**, `NavegaKids`, para não conflitar
com as landing pages dos outros times.

## Regras de progressão

- Cada atividade vale até **10 pontos**. Cada erro tira 3 (mínimo de 4).
- Estrelas por fase: **0 erros = 3★**, **1 a 2 erros = 2★**, **3 ou mais = 1★**.
- As fases 5, 10 e 15 valem **em dobro**.
- Refazer uma atividade guarda a **melhor** tentativa.
- Completar as 5 fases de uma ilha dá o **selo** da ilha (aparece no Diário do Capitão).
- O progresso **não é salvo**: por decisão do grupo, ele volta ao zero ao recarregar a página.

Para contar um erro numa atividade nova, chame `progresso.registrarErro()` quando a criança errar.
