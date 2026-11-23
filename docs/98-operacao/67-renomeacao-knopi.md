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
| 1 | Marca visível em `src/`: "Canopi" → "Knopi" e "CANOPI" → "KNOPI", só como palavra isolada | Feito, aguardando commit |
| 2 | Nomes internos de código e nome do pacote | Pendente |
| 3 | Documentação | Pendente |
| 4 | Contratos externos: propriedades `knopi_*` novas no HubSpot, cópia dos valores (247 empresas, 305 contatos, 27 negócios), migração Supabase e código, com teste antes de gravar | Pendente, plano próprio |
| 5 | Texto gravado em dados (`seed/`, registros existentes) | Pendente |
| 6 | Pasta local e configuração do Claude Code ligada a ela | Pendente |
| 7 | Repositório no GitHub (`fgdinizmkt/canopi-intel-excels`) | Pendente |
| 8 | Aplicação da identidade visual do manual v1.1 no app | Pendente, plano próprio |

## Etapa 1 · o que mudou
- Substituição por palavra inteira (`\bCanopi\b`, `\bCANOPI\b`), então `outsideCanopiCount`, `canopi_*` e `CANOPI_*` ficaram intactos para as etapas 2 e 4.
- Conferido que nenhum texto trocado é comparado com valor gravado em banco.
- `npx tsc --noEmit` sem erros; tela de login conferida renderizando em `localhost:3053`.
- Valores padrão novos: `origin` "Knopi Command Center" e `actor` "Knopi AI" (`src/context/AccountDetailContext.tsx`). Registros antigos continuam com "Canopi" até a etapa 5.
