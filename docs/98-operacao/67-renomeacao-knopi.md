# Renomeação Canopi → Knopi

## Decisão
Em 23/11/2026, o Fábio definiu que o produto passa a se chamar **Knopi**, com troca em tudo: app, código, documentação, contratos externos (HubSpot, Supabase, variáveis de ambiente), pastas locais e repositório no GitHub. Cada etapa é documentada aqui e aprovada antes do commit.

A identidade visual única e definitiva é o **Knopi · Manual de Marca v1.1** (`~/Downloads/Knopi · Manual de Marca v1.1.pdf`). Assinatura da marca: "Knopi | intel excels".

## Inventário de partida (23/11/2026)
| Tipo | Ocorrências | Risco |
|---|---|---|
| Marca visível em `src/` ("Canopi", "CANOPI") | 425 linhas em 67 arquivos | Baixo |
| Nomes internos de código (`outsideCanopiCount`, pacote `canopi-intel-excels-app`) | algumas centenas | Baixo |
| Contratos externos: propriedades HubSpot `canopi_*`, colunas e RPC em 3 migrations Supabase, variáveis `CANOPI_*` | mais de 700 | Alto |
| Texto gravado em dados: `seed/` e mensagens das migrations | dezenas | Médio |
| Documentação (`docs/`, `CONTEXTO.md`, `agents/`) | cerca de 700 | Baixo |

## Etapas
| # | Etapa | Status |
|---|---|---|
| 1 | Marca visível em `src/`: "Canopi" → "Knopi" e "CANOPI" → "KNOPI", só como palavra isolada | Feito (`c4a6f59`) |
| 2 | Nomes internos que vivem só no app, nome do pacote e nomes dos CSVs de exemplo | Feito (`f19784d`) |
| 3 | Documentação: `docs/`, `agents/`, `CONTEXTO.md`, `CLAUDE.md`, `AGENTS.md` e comentários e textos de `scripts/` | Feito (`7f2c787`) |
| 4 | Contratos externos, mais os 60 nomes internos camelCase que passam por gravação no banco ou RPC (por exemplo `canopiId`, que a função SQL de apply lê): propriedades `knopi_*` novas no HubSpot, cópia dos valores (247 empresas, 305 contatos, 27 negócios), migração Supabase e código, com teste antes de gravar | Em andamento: passos 4.1 e 4.2 feitos |
| 5 | Texto gravado em dados (`seed/`, registros existentes) e chaves do navegador (`canopi_actions`, `canopi_v1_actions`, `canopi_v1_logs`, `canopi_hubspot_v1_session_token`), com leitura da chave antiga para não perder o que está salvo | Pendente |
| 6 | Pasta local e configuração do Claude Code ligada a ela | Pendente |
| 7 | Repositório no GitHub (`fgdinizmkt/canopi-intel-excels`) | Pendente |
| 8 | Aplicação da identidade visual do manual v1.1 no app | Pendente, plano próprio |

## Etapa 1 · o que mudou
- Substituição por palavra inteira (`\bCanopi\b`, `\bCANOPI\b`), então `outsideCanopiCount`, `canopi_*` e `CANOPI_*` ficaram intactos para as etapas 2 e 4.
- Conferido que nenhum texto trocado é comparado com valor gravado em banco.
- `npx tsc --noEmit` sem erros; tela de login conferida renderizando em `localhost:3053`.
- Valores padrão novos: `origin` "Knopi Command Center" e `actor` "Knopi AI" (`src/context/AccountDetailContext.tsx`). Registros antigos continuam com "Canopi" até a etapa 5.

## Etapa 2 · o que mudou
- 12 nomes internos que não passam por banco, RPC ou armazenamento: `canopiAuth` (arquivo `src/lib/canopiAuth.ts` → `src/lib/knopiAuth.ts`), `setCanopiAuthClient`, `clearCanopiAuthClient`, `CanopiEvent`, `canopiEvents`, `canopiAttr`, `canopiFlag`, `canopiMap`, `canopiOwned`, `findHubspotIdentityMappingByCanopiExternalId`, `listHubspotIdentityMappingsByCanopiExternalId` e `normalizedCanopiExternalId`.
- Pacote `canopi-intel-excels-app` → `knopi-intel-excels-app` em `package.json` e `package-lock.json`.
- CSVs de exemplo do Salesforce: `canopi_salesforce_*_exemplo.csv` → `knopi_salesforce_*_exemplo.csv`.
- Os outros 60 nomes camelCase ficam em arquivos que gravam no HubSpot, no Supabase ou no Salesforce; vários são chaves de contratos guardados no banco, então seguem com a etapa 4.
- `npx tsc --noEmit` sem erros; login e shell respondendo no servidor local.

## Etapa 3 · o que mudou
- 370 trocas de "Canopi"/"CANOPI" por "Knopi"/"KNOPI" em 78 arquivos de documentação e scripts, inclusive o histórico do log de sessões.
- Mantidos de propósito: as linhas que descrevem a própria troca ("Canopi → Knopi"); nomes técnicos (`canopi_*`, camelCase) e caminhos com `canopi-intel-excels`, que continuam descrevendo o código real até as etapas 4, 6 e 7.
- Ficaram para outras etapas: `scripts/seed/buildBlockASeed.ts` (valor `'Canopi Seed'` gravado no seed, etapa 5) e `scripts/sync-drive-memory.mjs` (cita o nome real da pasta "Canopi" no Google Drive; muda quando a pasta for renomeada).
- Fora do escopo: `backups/`, que guarda cópias históricas do código e fica como arquivo.

## Etapa 4 · migração dos contratos externos

### Medição de 23/11/2026 (só leitura)
- HubSpot, portal 51070541: 9 propriedades `canopi_*` em empresas, 10 em contatos e 10 em negócios, todas nos grupos padrão de informação do objeto. Produtos: o token não tem permissão de leitura do schema.
- Registros com valor: 595 empresas (247 da carga limpa e 348 de carga anterior, com `canopi_simulated_fields`), 993 contatos (305 e 688) e 27 negócios.
- O registro `src/lib/hubspotPropertyRegistry.ts` diverge do HubSpot: cita propriedades que não existem lá (`canopi_icp_tier`, `canopi_segment` e outras) e usa `canopi_last_synced_at`, enquanto o HubSpot tem `canopi_last_sync_at`.
- Supabase `yyubngmzmjfzlxjwnkkz` estava pausado (INACTIVE) e foi reativado em 23/11 com autorização do Fábio. Dados intactos: 579 mappings (247 account, 305 contact, 27 deal), 250 accounts, 305 contacts, 27 oportunidades, 3 contratos de ingest (os 3 com "canopi" no JSON), 33 contratos Salesforce e 28 actions.
- Objetos com "canopi" no banco: coluna `hubspot_identity_mappings.canopi_external_id` e função `apply_hubspot_ingest_contract`.

### Passos
| Passo | O que faz | Status |
|---|---|---|
| 4.1 | Criar 29 propriedades `knopi_*` no HubSpot, espelho das `canopi_*` (tipo, opções, valor único) | Feito em 23/11: 29 de 29, conferidas sem divergência |
| 4.2 | Copiar os valores `canopi_*` → `knopi_*`: 595 empresas (3.716 valores), 993 contatos (6.873) e 27 negócios (270), em lotes de 100 | Feito em 23/11: teste de 1 registro por objeto conferido, depois 17 lotes sem erro. Releitura completa: 3.716, 6.873 e 270 valores `knopi_*`, iguais aos `canopi_*`, zero divergência |
| 4.3 | Supabase: renomear coluna, atualizar a função de apply e as chaves dos contratos guardados | Pendente |
| 4.4 | Código: `canopi_*`, 60 nomes camelCase e variáveis `CANOPI_*` | Pendente |
| 4.5 | Decidir o destino das propriedades `canopi_*` antigas, depois do app validado | Decisão do Fábio |
