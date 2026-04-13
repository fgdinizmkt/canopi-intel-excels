# Seed Canônico do Canopi

Este diretório é o ponto de entrada oficial da futura camada de seed reaplicável do Canopi.

## Objetivo

Materializar o seed canônico da plataforma a partir de uma fonte de verdade controlada no repo, evitando depender de inserts manuais avulsos no SQL Editor.

## Escopo inicial

A primeira fase deste diretório é o **Bloco A** do plano canônico:

- `accounts`
- `contas`
- `contacts`
- `signals`
- `actions`
- `oportunidades`

## Fonte de verdade inicial

- `src/data/accountsData.ts`

## Cenário oficial inicial

- `Parcial`

## Regra principal

Não inventar uma segunda verdade para as entidades.

Os builders de seed devem **derivar** os dados do modelo canônico já existente, em vez de recriar manualmente contas, owners, sinais e ações sem vínculo com a base semântica atual.

## Estrutura prevista

Este diretório deverá evoluir para conter algo próximo de:

```text
scripts/seed/
  README.md
  buildSeed.ts
  scenarios/
    parcial.ts
  builders/
    buildAccounts.ts
    buildContas.ts
    buildContacts.ts
    buildSignals.ts
    buildActions.ts
    buildOportunidades.ts
```

## Critério de qualidade

O seed só será considerado aceitável quando:

1. for reaplicável
2. respeitar IDs e slugs estáveis
3. preservar coerência entre contas, contatos, sinais, ações e oportunidades
4. manter ABM e ABX semanticamente compatíveis com a plataforma
5. sustentar handoff sem depender de explicação oral

## Leituras obrigatórias

1. `docs/98-operacao/01-plano-canonico-seed-handoff-obrigatorio.md`
2. `docs/98-operacao/02-bloco-a-mapeamento-canonico.md`
3. `src/data/accountsData.ts`

## Próxima ação oficial

Criar o primeiro artefato executável do seed do Bloco A.
