# Rota de Desenvolvimento — Contas V2

Status: Fase A concluída e sincronizada em `origin/main` (commit `219afa2`). Fase B.1 concluída e sincronizada em `origin/main` (commit `73ff047`). Próxima fase: Fase B.2 — Integração da Camada Canônica com validação/blockers locais.
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
| 9 | Conexões reais OAuth/Token | realConnectionContract | Sincronização real futura |

## 4. Diagnóstico atual

A auditoria indicou que só existe um artefato real parcial: sourceContract, formado por selectedConnector, customConfig e connectorLocalValidated.

As demais etapas ainda estão parcialmente decorativas, hardcoded ou destravadas por preset. Isso precisa ser corrigido antes de fechar a frente.

Problemas principais:

- customConfig acumula responsabilidades demais;
- Fontes e Conectores está carregando responsabilidades de Camada Canônica e Identidade/Dedupe;
- hasIdentity não deve depender apenas de primaryKeys vindas do preset;
- hasCanonicalMinimum não deve depender apenas de fieldMappings vindos do preset;
- botões sem consequência real devem ser removidos ou conectados a estado real;
- a tabela grande de mapeamento não deve continuar em AccountSources;
- conexão real via OAuth, token ou API não deve ser prometida como pronta enquanto não houver backend, callback, armazenamento seguro de tokens e política de refresh/revogação.

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
- campos que pareçam cadastro individual de conta;
- promessa de OAuth simples sem backend real.

### 5.1 Verdade operacional (estado atual)

- Fontes e Conectores hoje é setup local/simulado;
- não há OAuth, token, chamada de API ou sincronização real nesta etapa;
- a fase atual valida apenas o contrato local de leitura da fonte;
- conexão real deve ser tratada em recorte futuro específico (Fase I / conexão real);
- Camada Canônica não significa CRM conectado;
- ABM/ABX estão fora do escopo deste recorte.

## 6. Para onde vão as responsabilidades

Identidade e Dedupe recebe chaves secundárias, estratégia strict/fuzzy, política de conflito e confirmação explícita das regras de identidade.

Camada Canônica recebe a tabela de mapeamento completo, campo da fonte, campo Canopi, obrigatoriedade, uso no pipeline, uso em matching, uso em score e status de revisão.

Writeback recebe campos permitidos para retorno ao CRM, política por campo, owner de aprovação e risco aceito.

Upload e LGPD recebe base legal, responsável pela carga, consentimento, rastreabilidade e evidência de origem.

Conexões reais recebem OAuth, token/API, refresh token, callback, status de sync, escopos, revogação, segurança e armazenamento de credenciais. Essa responsabilidade não pertence ao Patch A.

## 6.1 Protocolo operacional local

Para validar Contas V2 sem corromper o runtime local do Next:

- a porta oficial de validação manual é `127.0.0.1:3053`;
- antes de abrir a UI, rodar `npm run dev:check`;
- para iniciar a interface limpa, rodar `npm run dev:clean`;
- `next start` não deve ser usado para validação manual;
- `npm run build` nunca deve rodar enquanto `next dev` estiver ativo;
- se surgir `Cannot find module`, `_document.js`, `clientReferenceManifest` ou `routes-manifest`, reiniciar pelo fluxo limpo;
- a validação local deve sempre partir de um runtime único e previsível.

## 7. Rota de patches

### Fase 0 — Congelamento operacional

Não commitar o estado atual de Contas V2. Preservar a working tree até decidir o Patch A. Não mexer em Cockpit, Supabase, deploy ou tags.

Saída: rota documentada e próximo patch definido.

### Fase A — Separar responsabilidades de Fontes

Transformar Fontes em Conectar fonte de contas. Remover a tabela completa de mapeamento. Manter origem, objeto, PK nativa, método de ingestão e validação local.

Status: concluída.

Commit final: `219afa2` — `refactor(settings): separate account source setup responsibilities`.

Resultado: Fontes passou a operar como contrato de leitura (Conectar fonte de contas), sem assumir responsabilidades de Camada Canônica/Identidade.

Evidências: build aprovado, typecheck aprovado e validação visual aprovada (prints finais + DOM proof).

Observação: Contas V2 ainda não está fechada; apenas o recorte da Fase A foi concluído.

### Fase B — Camada Canônica real

Mover a tabela de mapeamento para Camada Canônica. Criar ou consolidar canonicalMapping e revisão local do mapeamento.

Saída: mapeamento revisável e persistido na sessão.

### Fase B.1 — Revisão local do mapeamento canônico

Status: concluída.

Commit final: `73ff047` — `feat(settings): add canonical account mapping review`

Resultado:

- canonicalMapping criado/consolidado como artefato local da sessão;
- canonicalMappingReviewed criado;
- Camada Canônica passou a operar como etapa real de revisão local do schema;
- ações reais adicionadas:
- revisar campo;
- reabrir revisão;
- marcar revisão da sessão;
- restaurar padrão da fonte;
- status traduzidos para português;
- UI deixou claro que a revisão é local/simulada e não representa backend real;
- publicação/readiness/gates globais não foram alterados.

Evidências:

- build aprovado;
- typecheck aprovado;
- validação visual aprovada com prints finais:
- `01-canonica-inicial-ajuste.png`
- `02-canonica-revisada-ajuste.png`

Observação:

Contas V2 ainda não está fechada; apenas o recorte B.1 foi concluído.

### Fase B.2 — Integração da Camada Canônica com validação/blockers locais

Objetivo:

Conectar o artefato canonicalMapping/canonicalMappingReviewed à validação local da frente Contas V2, sem antecipar a Fase D de gates globais.

Escopo futuro:

- exibir no AccountValidation se canonicalMapping foi revisado;
- adicionar blocker local ou aviso específico para Camada Canônica quando não revisada;
- manter publicação bloqueada quando ainda houver blocker crítico;
- não alterar o fluxo global de etapas além do necessário para refletir o artefato;
- não mexer em OAuth/Token;
- não mexer em Supabase;
- não mexer em Cockpit.

Critério de saída futuro:

- AccountValidation reconhece o estado da Camada Canônica;
- o usuário entende se o schema foi revisado ou não;
- build e typecheck aprovados;
- evidência visual aprovada.

### Recorte C1 — Modelo estrutural de conexão real (sem conexão real ativa)

Objetivo:

Preparar a arquitetura da conexão real para Contas V2 sem implementar OAuth/token/API/sync reais neste recorte.

Status esperado deste recorte:

- tipos centrais de conexão real definidos em contrato dedicado;
- adapters declarativos por provedor (Salesforce, HubSpot, RD Station, CSV e Outro CRM);
- separação explícita de responsabilidades (adapter, auth, metadata, mapping, sync, status e confidence);
- exposição do modelo na UI apenas como referência de arquitetura futura;
- nenhuma credencial real solicitada/armazenada;
- nenhuma chamada externa real executada.

Artefatos estruturais do C1:

- `accountConnectionModel` para status, credenciais, metadados, sync e escopos;
- `accountConnectorAdapters/*` com capacidades, limitações, escopos e próximos passos por CRM;
- bloco informativo em Fontes e Conectores com método previsto, escopos, objetos esperados e status local;
- aviso informativo em Validação Local reforçando que conexão real ainda não foi implementada.

Limites do recorte:

- sem OAuth real;
- sem token real;
- sem chamada real de API externa;
- sem sincronização real;
- sem backend funcional de conexão externa.

Próximo passo após C1:

Executar C2 para escolher o primeiro conector real prioritário e implementar fluxo seguro end-to-end (auth + teste + status), mantendo princípio de menor privilégio.

### Recorte C1.1 — Configuração local editável do contrato da fonte

Objetivo:

Transformar Fontes e Conectores em uma etapa prática de configuração local editável, sem conexão real com CRM.

Entregas esperadas:

- painel “Configuração local da fonte selecionada” com campos editáveis de contrato;
- carregamento de defaults por preset/adapter ao selecionar a fonte;
- persistência da configuração em estado local/sessionStorage (via `customConfig`);
- botões de salvar configuração local e restaurar preset da fonte;
- contrato local volta para pendente quando houver edição após validação;
- bloco de conexão futura permanece informativo, não transacional.

Limites do recorte:

- sem OAuth real;
- sem token real;
- sem API externa real;
- sem sincronização real;
- sem coleta/armazenamento de credenciais.

Próximo passo após C1.1:

seguir para C2 e escolher o primeiro conector real prioritário para fluxo seguro de conexão.

### Recorte C1.2 — Refinamento visual de Fontes e Conectores

Objetivo:

reduzir densidade visual da tela, melhorar hierarquia e tornar o fluxo de uso mais claro sem alterar o escopo funcional do setup local.

Resultados esperados:

- cards de fonte mais compactos, mantendo informações essenciais;
- resumo operacional da fonte selecionada em bloco compacto;
- reorganização do painel editável em blocos (essenciais, opcionais, observações e específicos por fonte);
- destaque da ação principal (configurar, salvar e validar contrato local);
- bloco de conexão futura mantido como seção técnica secundária.

Limites:

- nenhuma funcionalidade real de conexão adicionada;
- sem OAuth/token/API/sync real;
- sem coleta de credenciais;
- persistência local/sessionStorage preservada.

Próximo passo:

C2 permanece como recorte para primeiro conector real end-to-end.

### Recorte C1.3 — Lapidação visual final de Fontes e Conectores

Objetivo:

reduzir densidade visual residual, deixar a hierarquia de uso mais clara e eliminar ambiguidade entre campos obrigatórios, complementares e detalhes técnicos futuros.

Resultados esperados:

- bloco de campos opcionais mais leve e claramente complementar;
- detalhes técnicos da conexão futura mais compactos e secundários;
- fatos da fonte e próximas etapas em formato mais enxuto;
- microcopy do salvamento local sem ambiguidade com salvar geral do topo;
- setup local editável, persistência por provider e validação local preservados.

Limites:

- sem OAuth/token/API/sync real;
- sem backend funcional de conexão externa;
- sem alteração de persistência, validação local ou localSourceConfigByProvider;
- sem mudança no recorte de conexão real futura.

Próximo passo:

C2 continua sendo o primeiro recorte de conector real prioritário.

### Recorte C2.1 — Upload CSV real no front (parsing local)

Objetivo:

tornar o conector CSV operacional no front-end com upload real de arquivo, parsing local no browser, preview e validação local mínima, sem backend, sem Supabase, sem OAuth, sem sync.

Artefatos criados:

- `src/lib/parseCsvLocal.ts`: funções puras `parseCsvText` e `validateCsvData` — RFC 4180 mínimo, sem dependência externa.
- `CsvUploadMeta`: interface com `fileName`, `fileSizeBytes`, `headers`, `rowCount`, `previewRows` (máx. 5), `uploadedAt`, `validationResult`.

Comportamento:

- upload via `<input type="file" accept=".csv">`;
- parsing com `FileReader.readAsText()` usando encoding configurado;
- `customConfig.csvUploadMeta` persistido em sessionStorage (apenas meta + preview, nunca o CSV inteiro);
- `canValidateLocally` para `csv_upload` exige `csvUploadMeta.validationResult.isValid === true` além dos campos de configuração;
- alterar `csvDedupeKey`, `csvRequiredMinimumField`, `csvDelimiter`, `csvEncoding` ou `csvHeaderInFirstLine` invalida o CSV e requer novo upload;
- `connectorLocalValidated` volta para `false` a qualquer nova mudança.

Validações implementadas:

- erros (bloqueiam validação): `INVALID_EXTENSION`, `EMPTY_FILE`, `NO_HEADERS`, `MISSING_REQUIRED_FIELD`, `MISSING_DEDUPE_KEY`;
- avisos (não bloqueiam): `LARGE_FILE`, `ROWS_WITHOUT_DEDUPE_KEY`, `DUPLICATE_DEDUPE_KEYS`, `EMPTY_ROWS`.

### Recorte C2.1.1 — Fluxo funcional real da etapa CSV

Objetivo:

transformar a tela Fontes e Conectores em uma página funcional com estados explícitos, evitando aparência de mockup.

Fluxo operacional:

- estado 1: fonte selecionada;
- estado 2: contrato local editado;
- estado 3: configuração local salva;
- estado 4: CSV processado localmente;
- estado 5: contrato local pronto para validação;
- estado 6: contrato local validado;
- estado 7: etapa local concluída.

Diretriz de UI:

- o painel "Próxima ação" concentra a ação principal da etapa;
- salvar, validar e concluir exibem feedback persistente com timestamp local;
- edição posterior volta o contrato para pendente;
- a seção de revisão continua como espelho da ação principal, não como badge decorativo;
- o fluxo continua sem OAuth/token/API/sync real e sem backend.

Limites do recorte:

- sem envio de dados ao backend;
- sem Supabase;
- sem OAuth/token/API/sync real;
- arquivo CSV completo não é armazenado em sessionStorage.

Próximo recorte após C2.1:

C2.2 — ingestão real do CSV para Supabase (fora do escopo desta frente de setup local).

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

Saída: frente Contas V2 formalmente fechada no nível de configuração local/simulada.

### Fase I — Lapidação técnica: Conexões reais OAuth/Token

Objetivo: transformar a conexão pendente em conexão real, sem confundir MVP local com integração produtiva.

Esta fase só deve começar depois da estabilização do setup local e dos gates por artefato.

Escopo conceitual:

- HubSpot: conexão OAuth 2.0 Authorization Code para app instalável multi-conta;
- Salesforce: OAuth 2.0 Web Server Flow, preferencialmente com PKCE quando aplicável;
- RD Station CRM: tratar inicialmente como Token/API, não como OAuth genérico;
- RD Station Marketing: avaliar OAuth2 separadamente, se entrar no escopo;
- Upload CSV: manter como caminho simples de ingestão para MVP e fallback operacional;
- Outro CRM: tratar como setup semiassistido, com método variável: OAuth, token, API key, banco, CSV ou middleware.

Artefato esperado:

- realConnectionContract;
- integrationStatus;
- tokenStoragePolicy;
- syncStatus;
- scopeMap;
- revokePolicy;
- errorStateMap;
- lastSyncAt;
- nextSyncAt, quando houver sincronização recorrente.

Regras:

- não implementar OAuth no frontend puro;
- não armazenar client_secret em client-side;
- não armazenar token sensível em localStorage;
- exigir backend/API route segura para callback e troca de código por token;
- separar claramente conexão simulada, contrato local validado e conexão real ativa;
- não chamar botão de “Conectar” se a ação não iniciar fluxo real;
- usar “Preparar conexão”, “Validar contrato local” ou “Conexão real pendente” enquanto não houver backend.

Critério de saída futuro:

- pelo menos uma conexão real end-to-end validada em ambiente seguro;
- tokens protegidos;
- refresh/revogação tratados;
- sync mínimo comprovado;
- UI diferencia conectado, parcial, erro, expirado e pendente;
- documentação operacional atualizada.

## 8. Gestão e delegação entre agentes

A frente Contas V2 deve operar com um único executor ativo por vez. Não executar Claude Code, Antigravity e Codex simultaneamente sobre a mesma working tree.

### Papéis

| Ator | Papel | Pode fazer | Não pode fazer |
|---|---|---|---|
| Fábio | Product owner e aprovador final | Validar conceito, prints, decisão de produto e autorização de commit/deploy | Aprovar no escuro sem evidência técnica/visual |
| ChatGPT | Orquestrador e revisor crítico | Definir escopo, escrever prompts, revisar outputs, decidir próximo agente, manter documentação e protocolo | Inventar contexto, aprovar sem evidência, prometer execução futura |
| Claude Code | Executor principal de patches locais | Ler código, editar arquivos autorizados, rodar build/typecheck, gerar evidências e prints | Mudar escopo, commitar, taguear, fazer deploy ou dar pull sem ordem explícita |
| Antigravity | Apoio visual/UI quando estável | Navegar, revisar UX, validar prints, apoiar ajustes visuais controlados | Entrar em loop, rodar comandos longos sem necessidade, virar executor principal sem autorização |
| Codex | Auditor técnico/reserva | Fazer diagnóstico terminal, comparar diffs, validar runtime e propor patches cirúrgicos | Consumir contexto em tarefas visuais longas ou concorrer com Claude Code |

### Regra de handoff entre agentes

Todo handoff deve conter:

1. fase atual;
2. objetivo do patch;
3. arquivos permitidos;
4. arquivos proibidos;
5. estado Git antes da ação;
6. comandos que podem ser rodados;
7. critérios de aceite;
8. evidências esperadas;
9. confirmação de que não haverá commit, tag, deploy ou pull sem autorização.

### Quando usar cada agente

Usar Claude Code para patches de código, refatoração local, build, typecheck e validação funcional.

Usar Antigravity para inspeção visual e UX quando o ambiente estiver estável e a tarefa exigir olhar de navegação/tela.

Usar Codex para auditoria técnica, comparação de hipóteses, runtime, investigação de cache/build ou quando Claude/Antigravity travarem.

Usar ChatGPT para governança: decidir a ordem dos patches, revisar criticamente, manter a rota, criar prompts fechados e bloquear decisões precipitadas.

Usar Fábio para decisões finais de produto: aprovar se a tela comunica corretamente o conceito, se o fluxo faz sentido para venda/demonstração e se pode virar commit.

### Regra de parada

Se qualquer agente travar em comando simples, entrar em loop, alterar arquivo fora de escopo ou tentar commitar/deployar sem autorização, parar imediatamente e retornar o controle ao ChatGPT/Fábio.

## 9. Protocolo de execução por patch

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

## 10. Riscos

| Risco | Severidade | Mitigação |
|---|---|---|
| Remendar AccountSources indefinidamente | Alta | Separar responsabilidades na Fase A |
| Corrigir gates cedo demais | Alta | Só alterar gates na Fase D |
| Estado duplicado em customConfig | Alta | Centralizar artefatos por etapa |
| UI parecer cadastro individual | Alta | Remover labels ambíguos e mover mapping |
| Botão sem consequência | Alta | Conectar a estado real ou remover |
| Uso indevido de logos oficiais | Média | Usar placeholder honesto até asset autorizado |
| Prometer OAuth simples sem infraestrutura | Alta | Criar Fase I separada para conexão real |
| Token ou segredo exposto no client | Alta | Usar backend/API route segura e armazenamento protegido |
| RD CRM tratado como OAuth sem validação | Média | Classificar como Token/API até confirmação técnica |
| Handoff depender de chat | Alta | Manter esta rota e logs atualizados |
| Agentes concorrendo na mesma working tree | Alta | Um executor ativo por vez |
| Agente visual travando em comandos simples | Média | Parar e trocar para executor terminal |
| Consumo excessivo de contexto/tokens | Média | Reservar Codex para auditoria técnica e Claude para execução |

## 11. Marca e conectores

Não usar logo oficial de terceiro sem asset local autorizado. Até existir autorização, usar fallback textual premium e não chamar fallback de logo oficial.

## 12. Decisão sobre OAuth/Token

OAuth/Token é uma lapidação técnica futura, não pré-requisito para commitar a Fase A.

Classificação atual por conector:

| Conector | Método futuro provável | Status no setup atual |
|---|---|---|
| HubSpot | OAuth 2.0 Authorization Code | Conexão real pendente |
| Salesforce | OAuth 2.0 Web Server Flow / PKCE quando aplicável | Conexão real pendente |
| RD Station CRM | Token/API | Conexão real pendente |
| RD Station Marketing | OAuth2 a avaliar | Fora do escopo imediato |
| Upload CSV | Upload em lote | Caminho simples para MVP/fallback |
| Outro CRM | OAuth, token, API, banco, CSV ou middleware | Setup semiassistido |

Linguagem recomendada na UI enquanto não houver backend real:

- “Contrato local validado”;
- “Conexão real pendente”;
- “OAuth futuro”;
- “Token/API futuro”;
- “Preparar conexão”.

Evitar:

- “Conectado” quando não houver token válido;
- “Ativo” quando só houve clique local;
- “OAuth simples” como promessa de baixa complexidade.

## 13. Próximo passo recomendado

Executar Fase B.2 — Integração da Camada Canônica com validação/blockers locais.

Não iniciar Cockpit completo enquanto Contas V2 estiver nesse estado intermediário.

Não iniciar OAuth/Token antes de fechar o setup local com gates e artefatos coerentes.

## 13.1 Diretrizes para C1 — Modelo de Conexão Real

Registro de premissas técnicas para o próximo recorte. Esta seção não implementa C1 e não altera o estado atual local/simulado.

1. Estabilidade OAuth: prever renovação automática quando houver refresh token; evitar quebra silenciosa da análise por expiração; tratar estados explícitos de token válido, token expirado, refresh falhou e reconexão necessária.
2. Mapeamento de metadados: estruturar captura de objetos, campos padrão e campos customizados; permitir uso da mesma lógica canônica para HubSpot, Salesforce, RD Station e futuros CRMs; separar metadados de origem do schema canônico da Canopi.
3. Segurança de escopo: aplicar menor privilégio; solicitar apenas permissões necessárias para leitura, teste de conexão e sync planejado; documentar scopes por provedor antes da implementação.
4. Adaptadores por CRM: isolar cada CRM em adapter próprio; evitar acoplamento direto de Salesforce/HubSpot/RD no núcleo do app; permitir novo provedor por novo adapter sem refatorar o core.
5. Separação obrigatória de responsabilidades: provider adapter; auth handler; metadata discovery; field mapping; sync strategy; connection status; data confidence.

## 14. Regra de handoff

Se houver divergência entre memória de chat e este documento, usar este documento como ponto de partida e conferir o estado real do repositório antes de agir.
