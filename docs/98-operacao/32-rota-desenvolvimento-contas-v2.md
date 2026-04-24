# Rota de Desenvolvimento — Contas V2

Status: rota operacional criada antes de novos patches.
Escopo: Configurações → Objetos → Contas V2.

## 1. Decisão de produto

Contas V2 não deve ser tratada como cadastro manual de uma conta individual. A frente deve configurar como o Canopi lê, normaliza, deduplica, classifica, governa e publica uma base de contas em lote.

Campos como website, name, owner e status só podem aparecer como campos da fonte, campos de matching, campos de dedupe ou campos de schema.

## 2. Princípio obrigatório

Cada seção é uma etapa do setup. Cada etapa deve produzir um artefato de saída claro. Esse artefato destrava apenas as próximas etapas que dependem dele.

Nenhuma etapa pode ficar configurada apenas por preset, clique visual, card selecionado, mock, hardcode ou botão sem consequência real.

## 3. Artefatos por etapa

| Ordem | Etapa | Artefato | Destrava |
|---|---|---|---|
| 1 | Conectar fonte de contas | sourceContract | Identidade e Dedupe |
| 2 | Identidade e Dedupe | identityRules | Camada Canônica |
| 3 | Camada Canônica | canonicalMapping | Classificação ABM/ABX e LGPD, se aplicável |
| 4 | Classificação ABM/ABX | classificationRules | Writeback e Governança |
| 5 | Upload e LGPD | lgpdEvidence | Validação/Publicação, quando obrigatório |
| 6 | Writeback | writebackPolicy | Governança |
| 7 | Governança | governanceApproval | Validação/Publicação |
| 8 | Validação/Publicação | publishableConfig | Publicação |

## 4. Diagnóstico atual

A auditoria indicou que só existe um artefato real parcial: sourceContract, formado por selectedConnector, customConfig e connectorLocalValidated.

As demais etapas ainda estão parcialmente decorativas, hardcoded ou destravadas por preset. Isso precisa ser corrigido antes de fechar a frente.

Problemas principais:

- customConfig acumula responsabilidades demais;
- Fontes e Conectores está carregando responsabilidades de Camada Canônica e Identidade/Dedupe;
- hasIdentity não deve depender apenas de primaryKeys vindas de preset;
- hasCanonicalMinimum não deve depender apenas de fieldMappings vindos de preset;
- botões sem consequência real devem ser removidos ou conectados a estado real;
- a tabela grande de mapeamento não deve continuar em AccountSources.

## 5. O que fica em Fontes

Fontes deve virar, conceitualmente, Conectar fonte de contas.

Deve conter:

- seleção da origem;
- tipo da origem;
- objeto ou entidade de origem;
- chave primária nativa;
- campo de domínio corporativo detectado, quando existir;
- método de ingestão;
- status de conexão real como pendente;
- validação local do contrato de leitura;
- aviso explícito de que não há OAuth/backend real ainda.

Não deve conter:

- tabela completa de mapeamento canônico;
- edição de campo Canopi;
- política detalhada de dedupe;
- chaves secundárias de dedupe;
- writeback policy;
- campos que pareçam cadastro individual de conta.

## 6. Para onde vão as responsabilidades

Identidade e Dedupe recebe chaves secundárias, estratégia strict/fuzzy, política de conflito e confirmação explícita das regras de identidade.

Camada Canônica recebe a tabela de mapeamento completo, campo da fonte, campo Canopi, obrigatoriedade, uso no pipeline, uso em matching, uso em score e status de revisão.

Writeback recebe campos permitidos para retorno ao CRM, política por campo, owner de aprovação e risco aceito.

Upload e LGPD recebe base legal, responsável pela carga, consentimento, rastreabilidade e evidência de origem.

## 7. Rota de patches

### Fase 0 — Congelamento operacional

Não commitar o estado atual de Contas V2. Preservar a working tree até decidir o Patch A. Não mexer em Cockpit, Supabase, deploy ou tags.

Saída: rota documentada e próximo patch definido.

### Fase A — Separar responsabilidades de Fontes

Transformar Fontes em Conectar fonte de contas. Remover a tabela completa de mapeamento. Manter origem, objeto, PK nativa, método de ingestão e validação local.

Saída: tela não parece cadastro individual; build, typecheck e screenshots aprovados.

### Fase B — Camada Canônica real

Mover a tabela de mapeamento para Camada Canônica. Criar ou consolidar canonicalMapping e revisão local do mapeamento.

Saída: mapeamento revisável e persistido na sessão.

### Fase C — Identidade e Dedupe real

Criar identityRules. Conectar strict/fuzzy, política de conflito e confirmação explícita da etapa.

Saída: Identidade só fica configurada após confirmação real.

### Fase D — Gates por artefato

Corrigir stepStatus e blockers para dependerem de artefatos confirmados, não de preset.

Saída: etapas destravam na sequência correta.

### Fase E — Classificação ABM/ABX funcional

Criar classificationRules e remover escrita morta.

Saída: seleção persiste e é consumida por etapas posteriores.

### Fase F — Writeback e LGPD funcionais

Criar writebackPolicy e lgpdEvidence com campos controlados e persistidos.

Saída: políticas e evidências passam a alterar blockers.

### Fase G — Governança real e publicação

Remover hardcodes críticos de Governança e fechar publicação por blockers reais.

Saída: publicação só habilita sem blocker crítico.

### Fase H — Fechamento formal

Aplicar protocolo de fechamento: Git controlado, build, typecheck, runtime, evidência visual externa, documentação operacional e registro do que ainda é local state.

Saída: frente Contas V2 formalmente fechada.

## 8. Protocolo de execução por patch

Todo patch deve:

1. declarar escopo e arquivos permitidos;
2. executar apenas o patch autorizado;
3. rodar git diff --stat;
4. rodar npm run build;
5. rodar npx tsc --noEmit;
6. gerar screenshots quando houver UI;
7. explicar botões e consequências reais;
8. listar blockers antes/depois;
9. confirmar que não houve commit, tag ou deploy;
10. aguardar aprovação explícita antes de commit.

## 9. Riscos

| Risco | Severidade | Mitigação |
|---|---|---|
| Remendar AccountSources indefinidamente | Alta | Separar responsabilidades na Fase A |
| Corrigir gates cedo demais | Alta | Só alterar gates na Fase D |
| Estado duplicado em customConfig | Alta | Centralizar artefatos por etapa |
| UI parecer cadastro individual | Alta | Remover labels ambíguos e mover mapping |
| Botão sem consequência | Alta | Conectar a estado real ou remover |
| Uso indevido de logos oficiais | Média | Usar placeholder honesto até asset autorizado |
| Handoff depender de chat | Alta | Manter esta rota e logs atualizados |

## 10. Marca e conectores

Não usar logo oficial de terceiro sem asset local autorizado. Até existir autorização, usar fallback textual premium e não chamar fallback de logo oficial.

## 11. Próximo passo recomendado

Executar Fase A: separar responsabilidades de Fontes e Conectores.

Não iniciar Cockpit completo enquanto Contas V2 estiver nesse estado intermediário.

## 12. Regra de handoff

Se houver divergência entre memória de chat e este documento, usar este documento como ponto de partida e conferir o estado real do repositório antes de agir.
