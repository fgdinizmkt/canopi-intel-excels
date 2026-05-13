# HubSpot pós-writeback — roadmap operacional, auditorias e testes

> **Status:** documento operacional criado após a validação do HubSpot C2.9D.2 e antes do fechamento final da frente HubSpot.
>
> **Base de referência:** `25f666f — docs(ops): close HubSpot protected writeback execution`.
>
> **Importante:** este documento registra decisões e próximos recortes. Ele não fecha o WIP visual em andamento e não altera código funcional.

## 1. Contexto atual

A frente HubSpot já possui:

- conector read-only validado;
- preview de Companies;
- catálogo de propriedades;
- dry-run de base de empresas e contatos;
- setup de propriedades Canopi;
- writeback real protegido validado com upsert de Companies e Contacts;
- associação Contact ↔ Company;
- base completa subida e conferida no HubSpot.

O estado atual ainda contém ajustes em andamento de UI/storytelling, executados localmente pelo agente de código, nos arquivos:

- `src/app/(shell)/configuracoes/objetos/contas/fontes-conectores/hubspot/page.tsx`;
- `src/app/(shell)/configuracoes/objetos/contas/fontes-conectores/hubspot/HubspotWritebackSetup.tsx`;
- `src/app/(shell)/configuracoes/objetos/contas/fontes-conectores/hubspot/HubspotWritebackImport.tsx`.

Esses ajustes ainda não devem ser tratados como fechamento final da frente HubSpot.

## 2. Problemas e decisões levantadas

### 2.1 Painel conectado para leitura não pode ser decorativo

O painel atual de conexão não deve apenas confirmar que o token está ativo ou repetir mensagens de segurança.

Decisão:

- substituir informações genéricas como “o que continua protegido” por um estado real do HubSpot;
- mostrar entidades, disponibilidade e contagens reais quando possível;
- diferenciar total real de amostra;
- indicar objetos não disponíveis, sem escopo ou ainda não inventariados.

Entidades prioritárias para o snapshot:

- Companies / Contas;
- Contacts / Contatos;
- Deals / Opportunities;
- Leads;
- Campaigns;
- Associations, quando for viável;
- catálogo/propriedades quando útil para diagnóstico.

### 2.2 Preview de 10 empresas é amostra, não inventário

O preview atual de Companies é limitado a uma amostra e não representa o total real do CRM.

Decisão:

- manter a amostra como diagnóstico rápido quando útil;
- não exibir “10 empresas” como se fosse total do HubSpot;
- criar recorte separado para snapshot/inventário read-only com contagem real ou status honesto de limitação.

### 2.3 Identidade atual evita duplicidade apenas quando IDs Canopi permanecem iguais

O upsert está correto tecnicamente, mas depende de `canopi_company_id` e `canopi_contact_id` estáveis.

Risco confirmado:

- se campos que hoje entram na geração do ID mudarem, a Canopi pode gerar novo ID;
- nesse caso, o HubSpot pode interpretar como novo registro;
- isso é especialmente sensível para e-mail de contato, domínio, website e nome de empresa.

Decisão:

- tratar esse comportamento como limitação atual, não como regra final de produto;
- não resolver dentro do WIP visual atual;
- abrir recorte próprio de resolução de identidade, comparação de mudanças e decisão assistida.

### 2.4 Drawer de decisão assistida

Quando houver conflito, baixa confiança, alteração de campo sensível ou risco de duplicidade, a Canopi deve abrir um drawer para decisão do usuário.

O drawer deve mostrar:

- entidade afetada;
- registro atual no HubSpot;
- registro proposto pela Canopi;
- campos modificados;
- valor atual;
- valor proposto;
- nível de confiança;
- motivo do alerta;
- impacto da decisão.

Ações esperadas:

- atualizar registro existente;
- criar novo registro;
- ignorar nesta execução;
- revisar depois;
- aplicar decisão a casos semelhantes, apenas quando seguro.

### 2.5 Enriquecimento não pode ser limitado a exemplos simples

A Canopi vai enriquecer muito mais do que e-mail, telefone, cargo ou domínio.

Campos e camadas que devem ser tratados como atributos mutáveis/enriquecíveis:

- Company: vertical, segmento, porte, país, região, stack, tecnologias, maturidade, score, tier, ICP, cluster, ABM/ABX, potencial, risco, sinais, cobertura, histórico e classificações;
- Contact: e-mail, telefone, cargo, área, senioridade, persona, influência, acessibilidade, receptividade, papel no comitê, força relacional, histórico, sinais, score e classificações;
- Deal/Opportunity: estágio, valor, forecast, probabilidade, produto, dor, concorrência, risco, próximo passo, sinais de fechamento e associação ao comitê;
- Product/Service: SKU ou ID externo, categoria, oferta, status, preço, relacionamento com deal e uso em conta;
- Campaign: origem, influência, associação a contatos, contas e deals;
- Signals: eventos, triggers, severidade, origem, cooldown e impacto operacional.

Regra:

- enriquecimento deve atualizar atributos e inteligência;
- identidade deve ser estável e separada dos atributos mutáveis.

### 2.6 Classificação operacional de entidades

É possível identificar e classificar entidades como lead, prospect, contato de conta, contato cliente, contato de marketing, contato de vendas, lost lead, lead quente e oportunidade em fechamento.

Mas essa classificação não deve ser feita por achismo nem apenas pelo objeto de origem.

A classificação deve combinar:

- objeto de origem no HubSpot;
- lifecycle/status;
- lead status;
- associações com Company, Deal e Campaign;
- owner e origem comercial/marketing;
- histórico de interações;
- vínculo com conta cliente ou prospect;
- regras Canopi por tenant;
- sinais e comportamento.

### 2.7 Dados do HubSpot devem alimentar a Canopi transversalmente

Os dados lidos, normalizados e persistidos do HubSpot devem alimentar:

- Contas;
- Contatos;
- Comitê;
- Sinais;
- Plays;
- Performance;
- ABM;
- ABX;
- Cockpit;
- futuras páginas de Perfil da Empresa e Perfil do Contato.

Estado atual:

- a página HubSpot ainda opera principalmente como conector/preview/writeback;
- a integração transversal depende de normalização e persistência canônica;
- não prometer na UI que a alimentação transversal já existe se ainda não houver persistência real.

### 2.8 Busca nativa Cmd+Shift+F / Cmd+F

Foi identificado pelo usuário que não consegue usar busca na página para localizar termos.

Auditoria necessária:

- verificar se há handlers globais de teclado interceptando busca;
- verificar `preventDefault` em combinações com Cmd/Meta;
- confirmar se textos estão renderizados no DOM como texto real;
- identificar se conteúdo relevante fica escondido, colapsado, virtualizado ou truncado.

Não alterar atalhos sem causa comprovada.

## 3. Fatiamento sequencial recomendado

### H1 — Fechar ou corrigir WIP visual atual

Objetivo:

- validar visualmente o WIP atual de storytelling/copy;
- decidir se passa, se precisa de ajuste mínimo ou se deve ser substituído pelo snapshot real.

Auditorias obrigatórias:

- `git status -sb`;
- `git rev-parse --short HEAD`;
- `git rev-parse --short origin/main`;
- `git diff --stat`;
- confirmar que o WIP está limitado aos três arquivos de UI.

Teste operacional:

- abrir página HubSpot no browser;
- validar conexão;
- validar leitura de amostra;
- validar copy de amostra versus total;
- validar clareza do bloco de atualização;
- validar que nenhum writeback é disparado automaticamente.

Critério de saída:

- WIP aprovado visualmente ou substituído por ajuste mais útil;
- sem commit se houver dúvida funcional aberta.

### H2 — Snapshot real read-only do HubSpot

Objetivo:

- criar painel de estado real do HubSpot no lugar do painel decorativo.

Escopo:

- criar ou reaproveitar rota read-only de snapshot;
- consultar objetos com segurança;
- retornar status por entidade;
- diferenciar total real, amostra, sem escopo, indisponível e não implementado.

Entidades iniciais:

- Companies;
- Contacts;
- Deals/Opportunities;
- Leads;
- Campaigns;
- Associations, se viável sem custo excessivo.

Testes:

- token sem escopo completo;
- token com escopo parcial;
- objeto disponível;
- objeto indisponível;
- erro HubSpot sanitizado;
- contagem real versus amostra;
- ausência de gravação.

Critério de saída:

- painel mostra estado real e honesto;
- não inventa números;
- não confunde preview com inventário.

### H3 — Classificação operacional das entidades

Objetivo:

- mapear como a Canopi classifica entidades vindas do HubSpot.

Classificações iniciais:

- lead;
- prospect;
- contato de conta;
- contato cliente;
- contato de marketing;
- contato de vendas;
- lead quente;
- lost lead;
- oportunidade aberta;
- oportunidade em fechamento;
- conta target;
- conta cliente;
- conta em risco;
- conta com baixa cobertura relacional.

Auditoria:

- identificar campos HubSpot disponíveis para classificação;
- mapear lifecycle/status, lead status, owner, source, campaign, deal association e company association;
- definir regras Canopi por prioridade e conflito.

Critério de saída:

- tabela de classificação por entidade;
- campos necessários;
- campos opcionais;
- confiança;
- fallback;
- lacunas.

### H4 — Auditoria e especificação de identidade estável

Objetivo:

- separar identidade de atributos mutáveis;
- reduzir risco de duplicidade.

Auditoria:

- revisar geração atual de `canopi_company_id`;
- revisar geração atual de `canopi_contact_id`;
- mapear campos que alteram ID;
- identificar risco de duplicidade por mudança de e-mail, domínio, website, nome, telefone ou associação.

Critério de saída:

- especificação da identidade estável por entidade;
- decisão sobre `identity_key` persistido;
- estratégia de reaproveitamento de HubSpot ID;
- estratégia para registros antigos sem Canopi ID.

### H5 — Dry-run semântico com comparação HubSpot versus Canopi

Objetivo:

- antes de atualizar/criar, mostrar diferenças reais entre registro existente e registro proposto.

Escopo:

- buscar candidatos no HubSpot;
- calcular match confidence;
- comparar campos;
- mostrar valor atual versus valor proposto;
- indicar ação sugerida.

Testes:

- mesmo ID Canopi;
- mesmo HubSpot ID conhecido;
- mesmo e-mail com empresa igual;
- e-mail alterado;
- domínio alterado;
- múltiplos candidatos;
- nenhum candidato.

Critério de saída:

- dry-run deixa claro o que será atualizado, criado, ignorado ou revisado.

### H6 — Drawer de decisão assistida

Objetivo:

- permitir decisão humana quando houver conflito ou baixa confiança.

Ações:

- atualizar existente;
- criar novo;
- ignorar;
- revisar depois;
- aplicar a casos semelhantes quando seguro.

Persistência necessária:

- decisão tomada;
- usuário;
- timestamp;
- entidade;
- HubSpot ID;
- Canopi ID;
- campos comparados;
- confiança;
- motivo;
- escopo da decisão.

Critério de saída:

- decisões auditáveis;
- execute respeita decisões;
- não repete alertas iguais sem necessidade.

### H7 — Persistência canônica HubSpot → Canopi

Objetivo:

- transformar dados lidos do HubSpot em entidades canônicas utilizáveis por toda a Canopi.

Áreas consumidoras:

- Contas;
- Contatos;
- Comitê;
- Sinais;
- Plays;
- Performance;
- Cockpit;
- ABM/ABX;
- Perfil da Empresa;
- Perfil do Contato.

Auditoria:

- mapear tabelas existentes;
- mapear campos disponíveis;
- identificar lacunas de schema;
- definir o que entra no MVP versus futuro.

Critério de saída:

- dados sincronizados deixam de ser apenas preview/writeback e passam a alimentar a inteligência operacional.

### H8 — Enriquecimento Canopi

Objetivo:

- aplicar camada de características, pesos, classificações e inteligência nas entidades normalizadas.

Pré-condição:

- conectores principais com dados normalizados;
- identidade estável;
- leitura/persistência suficiente para evitar enriquecimento em cima de base frágil.

Entidades alvo:

- contas;
- contatos;
- comitês;
- oportunidades/deals;
- campanhas;
- sinais;
- produtos/serviços quando existirem.

Critério de saída:

- enriquecimento operacional e não apenas limpeza de CRM.

### H9 — Fechamento operacional da frente HubSpot

Objetivo:

- consolidar commits, docs e sincronização.

Checklist:

- lint;
- typecheck;
- diff check;
- validação visual;
- validação funcional read-only;
- validação funcional writeback quando aplicável;
- documentação de fechamento;
- atualização de `00-status-atual.md`;
- atualização de `03-log-de-sessoes.md`;
- atualização do script de sync Drive para incluir docs 43, 44, 45 e documentos novos;
- sync real do Google Drive;
- confirmação de Git local/remoto limpo.

Critério de saída:

- HubSpot fechado sem pontas soltas;
- RD Station CRM liberado apenas depois disso ou por decisão formal de postergação.

## 4. Ordem recomendada de execução imediata

1. Aguardar retorno do Codex sobre o recorte de snapshot real do HubSpot.
2. Analisar o output antes de novo prompt.
3. Se o recorte vier coerente, validar visualmente no browser.
4. Se passar, commit técnico do WIP de UI/snapshot.
5. Abrir recorte documental/arquitetural da identidade estável e drawer.
6. Só depois decidir implementação de identidade/drawer.
7. Não iniciar enriquecimento antes de fechar snapshot, classificação e identidade.
8. Não iniciar RD Station CRM antes do fechamento formal HubSpot ou decisão explícita.

## 5. O que não fazer agora

- Não reabrir Salesforce C4.18C.
- Não iniciar RD Station CRM em paralelo.
- Não implementar enriquecimento antes de estabilizar identidade e snapshot.
- Não transformar o drawer em confirmação genérica sem motor de match/confiança.
- Não prometer na UI que os dados já alimentam todas as páginas se ainda não há persistência canônica.
- Não tratar preview de 10 empresas como inventário do HubSpot.
- Não commitar WIP visual sem validação no browser.

## 6. Estado operacional após este registro

- Este documento é registro operacional e não altera produto funcional.
- O WIP de UI/storytelling/snapshot segue pendente de validação e eventual commit técnico.
- A frente HubSpot ainda não está fechada como um todo.
- A próxima decisão deve ser tomada após análise do retorno do Codex sobre o painel de snapshot real.
