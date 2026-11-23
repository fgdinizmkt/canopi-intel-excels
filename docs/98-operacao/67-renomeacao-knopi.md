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
| 3 | Documentação: `docs/`, `agents/`, `CONTEXTO.md`, `CLAUDE.md`, `AGENTS.md` e comentários e textos de `scripts/` | Feito, aguardando commit |
| 4 | Contratos externos, mais os 60 nomes internos camelCase que passam por gravação no banco ou RPC (por exemplo `canopiId`, que a função SQL de apply lê): propriedades `knopi_*` novas no HubSpot, cópia dos valores (247 empresas, 305 contatos, 27 negócios), migração Supabase e código, com teste antes de gravar | Pendente, plano próprio |
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
