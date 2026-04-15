# E22.1 — Reabertura Controlada: Checklist e Resultado de Execução

## Objetivo Original
Eliminar ambiguidade na retomada do E22.1 com escopo fechado, entregável literal e critério de aceite claro.

## Status
**Checklist foi executado.** Este documento agora serve como referência histórica da reabertura controlada do E22.1.

## Pré-condição que foi Atendida
✅ Janela de validação visual interna executada conforme doc 24  
✅ Validação visual interna favorável  
✅ Código publicado em commit 24ab020  
✅ Build validado  
✅ Diff isolado  
✅ Próximo passo: user evaluation no front

---

## Escopo permitido
Arquivo principal:
- `src/pages/Accounts.tsx`

Dependências permitidas apenas se inevitáveis e mínimas:
- imports já publicados do E22
- nenhum outro arquivo visual

---

## O que deve ser literalmente entregue
1. integração do read model canônico de campanhas em `Accounts.tsx`
2. quatro filtros discretos e adicionais:
   - `usoPrincipal`
   - `origem`
   - `escala`
   - `tipoCampanha`
3. badge compacto de campanhas na grade
4. badge compacto de campanhas na lista
5. nenhum impacto no board
6. nenhuma remoção de elementos existentes
7. build passando
8. diff isolado
9. evidência visual para aprovação do usuário antes de commit

---

## O que não pode ser entregue
- mudança no hero
- mudança nos presets
- mudança em outras páginas
- nova seção estrutural em `Accounts`
- alteração de schema
- alteração do E22
- commit sem aprovação visual explícita do usuário

---

## Critério de aceite
A implementação só pode seguir para commit se todas as condições abaixo forem verdadeiras:
- os filtros novos aparecem como dimensão adicional, sem poluir a hierarquia
- badges de campanhas não competem com sinais e plays
- spacing, wrap e truncamento estão corretos
- a tela continua coerente nas visões lista e grade
- `npm run build` passa
- o usuário aprova visualmente no front

---

## Regra técnica transitória aceita
No E22.1, a associação conta -> campanhas canônicas pode ser inferida via `interaction.campaignId`.

Isso é aceitável apenas como regra transitória deste recorte.

Não abrir refactor estrutural por causa disso no E22.1.

---

## Prompt final fechado para Claude Code
```text
Contexto: Canopi | intel excels

Reabrir E22.1 de forma controlada, sem ambiguidade e sem abrir novas frentes.

Objetivo literal:
implementar em `src/pages/Accounts.tsx` a primeira integração funcional do read model canônico de campanhas já publicado no E22.

Arquivo permitido:
- `src/pages/Accounts.tsx`

Escopo exato:
1. usar o read model canônico de campanhas já existente
2. adicionar filtros discretos para:
   - usoPrincipal
   - origem
   - escala
   - tipoCampanha
3. adicionar badge compacto de campanhas na grade
4. adicionar badge compacto de campanhas na lista
5. não mexer no board
6. não mexer no hero
7. não mexer nos presets
8. não mexer em outras páginas
9. não remover nada da tela atual

Regra técnica aceita neste recorte:
- inferência conta -> campanhas canônicas via `interaction.campaignId`
- isso é transitório e suficiente para E22.1

Entregáveis literais:
1. diff apenas de `src/pages/Accounts.tsx`
2. nomenclatura limpa, sem typos
3. `npm run build`
4. `git diff --stat`
5. evidência visual objetiva para avaliação do usuário
6. não commitar ainda

Formato de retorno obrigatório:
- resumo curto do que mudou
- diff stat
- confirmação de build
- descrição visual objetiva ou screenshots se disponíveis
- instrução final única: aguardar aprovação visual do usuário antes de commit

Proibições:
- não abrir refactor paralelo
- não alterar outro arquivo
- não commitar
- não trazer opções
```

---

## Estado final esperado da reabertura
Antes da aprovação visual do usuário:
- implementação local validada
- build passando
- diff isolado
- sem commit

Depois da aprovação visual do usuário:
- commit único
- push
- fechamento do E22.1 como publicado

---

**Status:** Executado  
**Data de publicação:** 2026-04-15  
**Commit:** [24ab020](https://github.com/fgdinizmkt/canopi-intel-excels/commit/24ab020)  
**Referência:** Doc 21 registra resultado final da publicação
