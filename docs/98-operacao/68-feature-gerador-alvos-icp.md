# Scorecard ABE por conta: ICP, Nota de Fit e Saude do Dado

> Revisado em 23/11/2026. Esta versao substitui a anterior, escrita antes de
> ler a proposta (`Canopi Base.docx`) e a regua real do Scorecard ABX. A
> versao antiga tratava isto como feature nova e greenfield, e dizia que setor
> nao pontua e que completude fica fora: estava errada para o Knopi/ABE.

## 1. O conflito que este modelo resolve

Existem dois instrumentos de score no mundo da UX Agency:

- **A regua da planilha Scorecard ABX** (calibrada no Pipedrive): nota = 5
  pilares ponderados. Acesso a Decisao 30, Capital em Risco 25, Evidencia de
  Friccao 20, Gatilho 15, Relacionamento 10. Duas decisoes de proposito: setor
  nao pontua ("nenhum dado nosso prova que um setor vale mais") e cadastro
  completo fica fora da nota ("era o defeito do modelo antigo, onde preencher
  campo subia a pontuacao").
- **O motor atual do app** (`src/lib/scoringRepository.ts`): nota = potencial
  25, risco 25, prontidao 20, cobertura 15, **confianca 15**, onde confianca e
  completude de cadastro. Ou seja, o app **reintroduziu o defeito**: hoje
  preencher campo sobe a nota de prioridade.

As regras novas do Fabio (23/11/2026): setor **tem** que pontuar (a empresa
foca em setores e pode ter mais de um ICP) e saude de dado **tem** que
penalizar e ser pontuada (o que foi, o que nao foi, o que deve ser preenchido,
inclusive para o writeback no CRM). Isso parece conflitar com a planilha. O
modelo abaixo honra as duas coisas sem trazer de volta o defeito.

## 2. O ICP como entidade de primeira classe

Setor nao e uma regra chumbada no codigo. Ele vive dentro do **ICP**, que e um
objeto de setup com duas formas de nascer:

1. **ICP sugerido (aprendido do historico).** No espirito do lead scoring do
   RD Station. A plataforma olha a coorte vencedora (contas com oportunidade e
   saudaveis, ou negocio de alta probabilidade) e destila o perfil: em que
   setores, portes e comite os ganhos se agrupam. Os pesos de setor saem da
   frequencia real dos ganhos. Isso **derruba a objecao da planilha**: agora ha
   dado que prova o peso do setor. E o mesmo motor que alimenta o lookalike de
   ABM (contas parecidas com as que ja ganhamos).
2. **ICP configurado (pesos na mao).** O usuario cria ou ajusta: setores-alvo
   com peso, portes, cargos do comite, sinais obrigatorios, nota minima de
   corte.

Multi-ICP: cada conta e avaliada contra cada ICP e etiquetada pelo de melhor
fit de setor. Persiste como linha de `system_settings` (key `icp_profiles`),
herdando o fluxo draft/pending/published que ja existe.

**Trash data.** O motor de sugestao ignora valores genericos que nao sao setor
nem porte de verdade ("Negocio", "N/A", "(rever)", vazio). Sem esse filtro, o
ICP sugerido nasce poluido. Ver `ehTrashData` em `icp.ts`. Esses mesmos campos
entram na lista de lacunas da Saude do Dado para enriquecimento e writeback.

Codigo: `src/lib/icp.ts` (`ICPProfile`, `computeSectorFit`, `passaGateICP`,
`melhorICP`, `suggestICPFromHistory`).

## 3. Duas camadas, separadas de proposito

### Camada 1 · Nota de Fit (prioridade)

Quem perseguir. Herda a regua validada da planilha, pesos intactos. Completude
NAO entra aqui. Setor entra como ICP (gate de setor + aderencia), nunca como
peso abstrato. Mapeamento dos 5 pilares aos campos reais do schema `Conta`:

| Pilar | Peso | De onde sai (campos reais) |
|---|---|---|
| Acesso a Decisao | 30 | `contatos[]`: peso por `senioridade` x `forcaRelacional`, bonus para `classificacao` Decisor/Sponsor/Champion, vs meta de 5 cadeiras |
| Capital em Risco | 25 | `budgetBrl` + soma de `oportunidades[].valor`, por faixa; fallback `potencial` |
| Evidencia de Friccao | 20 | `sinais[]` por `impacto` (Alto/Medio) + `statusGeral` |
| Gatilho | 15 | `sinais[]` tipo Mudanca/Alerta + `atividadeRecente` |
| Relacionamento | 10 | media de `forcaRelacional` + `possuiOportunidade` + `historico` |

A **rota de abordagem** cruza a nota com o acesso ao comite, como na planilha:
1-to-1, abrir porta, programatico, topo de funil.

### Camada 2 · Saude do Dado (confianca + enriquecimento)

Nao infla a nota de fit. Faz tres coisas:

- **Mede completude campo a campo.** Campos-base sempre avaliados; campos
  exigidos pelo ICP ativo viram `obrigatorio_faltando` quando vazios.
- **Rebaixa a confianca da nota exibida.** `notaExibida = notaFit x
  fatorConfianca`, com `fatorConfianca` de 0.4 a 1.0 conforme a completude. Fit
  alto em dado ralo aparece como baixa confianca. Essa e a penalizacao que o
  Fabio pediu, sem completude inflar a nota (o defeito).
- **Gera a lista de lacunas** (`LacunaDado[]`) para o fluxo de enriquecimento e
  o writeback no CRM: o que esta preenchido, o que falta, o que e obrigatorio.

Codigo: `src/lib/fitScore.ts` (`computeNotaFit`, `computeSaudeDado`,
`computeScorecard`, `Scorecard`, `BandaFarol`).

## 4. Heatmaps e farol

- **Heatmap de Comite (por conta).** Grade `area` x `senioridade`; celula =
  forca do vinculo (`forcaRelacional`) das cadeiras mapeadas; vazio = lacuna.
  Mais cobertura de Decisor/Influenciador/Champion/Sponsor (`classificacao`).
  Corresponde a secao C "Coverage Heatmap" da proposta.
- **Heatmap de Cargos (global).** Ranking de personas por `potencialSucesso`
  do `ContatoConta`, agregado por cargo entre as contas.
- **Farol/Ranking.** Cinco bandas por luminosidade sobre a nota exibida:
  grafite `#18191D` no critico, ciano `#00C6F4` no pronto (da planilha).

## 5. Onde isto vive no app

- **Conta 360** (`/contas/[slug]`, ja ligada ao dado real): o visual do
  scorecard por conta (pilares, farol, heatmap de comite, lista de lacunas,
  rota).
- **Estrategia ABM** (`/estrategia-abm`): ranking por ICP, saida de alvos.
- **Inteligencia Cruzada** (`/inteligencia-cruzada`): ICP sugerido do historico
  e lookalike de ABX para ABM.
- **Configuracoes** (`/configuracoes`): setup e pesos do ICP, regras de corte.

## 6. Estado

- Feito (23/11/2026): `src/lib/icp.ts` e `src/lib/fitScore.ts`, com tipos e
  motor das duas camadas, tsc limpo. Ainda nao ligados a nenhuma tela, sem
  commit ate aprovacao.
- O `scoringRepository` antigo continua servindo as telas atuais ate o visual
  da Conta 360 migrar para `fitScore`. Depois da migracao, ele sai (carrega o
  defeito de completude na nota).

## 7. Decisao em aberto

Pesos e forma de entrada do setor confirmados como ICP (gate + aderencia). Os
pesos dos 5 pilares seguem a regua validada da planilha. Qualquer recalibracao
e decisao do Fabio, nao minha.
