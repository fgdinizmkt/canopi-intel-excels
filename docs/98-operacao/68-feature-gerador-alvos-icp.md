# Feature: Gerador de alvos ABM por ICP (a jusante do ABX)

## Origem
Em 23/11/2026 o Fábio apontou que a base de 733 decisores (`prospec_*`) e a rede de design de 55 nomes (`design_*`) não são dado de entrada: são **saída**. Cada uma é o resultado de aplicar um ICP sobre uma base e separar, na mão, quem vale perseguir. A feature nasce de automatizar isso.

## O que a feature faz
Dada uma base de contas e contatos, mais a definição de um ICP, o Knopi:

1. **Entende a base.** Segmenta e pontua as contas por fit de ICP (porte, vertical, cargo, sinais).
2. **Fomenta ABX.** Aquece a base e gera sinal e engajamento antes da abordagem direta.
3. **Devolve a lista ABM.** Os decisores priorizados que batem com o ICP, no padrão das listas que hoje são feitas à mão.

A saída é multi-ICP: o mesmo motor produz uma lista de decisores B2B (ICP comercial) ou uma rede de comunidade (ICP de design), trocando só a definição do ICP.

## Gabaritos de validação (golden sets já carregados)
A prova de que o motor funciona é ele reencontrar e rankear gente como a que já foi curada na mão:

| Gabarito | Prefixo | ICP | Volume |
|---|---|---|---|
| Decisores Brasil | `prospec_` | ICP de decisores da UX (fundos, bancos, agro, corporativo) | 733 contatos, 96 contas |
| Rede de design | `design_` | ICP de comunidade de design | 55 contatos, 38 contas |

## Onde se apoia (já existe no app)
Não parte do zero. O Knopi já tem:
- `src/lib/abmRepository.ts`: scoring ABM por conta.
- `src/lib/abxRepository.ts`: contexto de expansão ABX.
- `src/lib/playRecommendationsRepository.ts`: próxima melhor ação por conta.

A feature estende essas três camadas com (1) uma definição de ICP em regras e (2) um passo de geração e ranqueamento da lista de alvos.

## Substrato de simulação (bases carregadas em 23/11/2026)
Carregadas no Supabase do Knopi (`yyubngmzmjfzlxjwnkkz`), separadas por prefixo no `id`, reversíveis por prefixo, sem tocar a base limpa original (250/305/27):

| Base simulada | Prefixo | Tipo | Contas | Contatos | Negócios |
|---|---|---|---|---|---|
| UX Agency | `uxrd_` | B2B | 6.576 | 9.041 | 341 |
| Santos Neto | `santosneto_` | B2B | 1.191 | 3.473 | 0 |
| HuntGo | `huntgo_` | B2C | 1 | 191 | 201 |
| Decisores (prospecção) | `prospec_` | B2B outbound | 96 | 733 | 0 |
| Rede de design | `design_` | comunidade | 38 | 55 | 0 |
| **Total (com base limpa)** | | | **8.152** | **13.798** | **569** |

Pulsinc ficou de fora: a base dela não está acessível por API nem conector nesta sessão.

## Próximo passo sugerido
Prototipar o scoring sobre o substrato carregado e comparar a lista que sai contra os dois gabaritos (`prospec_` e `design_`): medir quantos dos curados à mão o motor reencontra, e o que ele traz de novo. Antes disso, escrever o ICP de decisores em regras explícitas (cargo alvo, vertical, porte, sinais), porque "ICP" precisa virar critério antes de virar código.
