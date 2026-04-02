# 05 - Handoff atual

## Estado atual
- Fase: Fase 7 — Deep Intelligence (Em andamento)
- **Último recorte concluído:** Inteligência Cumulativa (27º Recorte Fase 7)
- **Último commit relevante:** `1190a0f` (feat(intel): implementação Recorte 27 - Insights Históricos e Lições Aprendidas (Inteligência Cumulativa))
- **Data:** 2026-04-02
- **Ambiente:** Next.js 15 App Router / main íntegra (Build 100% OK, Lint 100% OK)

## Status de Qualidade (Auditado)
- **Linting:** 100% Funcional. Saneamento de aspas em strings literais JSX (`&quot;`).
- **Build:** 100% Íntegro. `npm run build` validado (Exit 0).
- **Acessibilidade:** Mantida com hierarquia clara de títulos H2/H3.
- **Deep Data:** Consumo integral do campo `inteligencia{}` de `accountsData.ts`.

## Regras obrigatórias (Reforço)
1. Manter a disciplina de `npm run lint` antes de cada commit de fechamento de recorte.
2. Preservar o histórico completo nos documentos de operação.
3. Não introduzir comportamentos fictícios em botões ou interações visuais.

## O que foi entregue (Recorte 27 — Fase 7)
1.  **Insights Históricos:** Novo bloco triplo no perfil da conta separando Fatos Históricos, Conhecimento Extraído e Implicações Operacionais.
2.  **Memória Operacional:** Visualização de sucessos/insucessos e padrões de compra reconhecidos.
3.  **Hipóteses AI:** Seção dedicada a apostas estratégicas sugeridas pelo Canopi AI.
4.  **Preservação:** Radar Relacional e Comitê de Compras mantidos íntegros abaixo da nova camada de inteligência.

## Pendências e Observações (Auditado)
1.  **Avisos de Imagem (WA-NEXT):** `<img>` em uso (Warnings de LCP). Recomendado migrar para `next/image`.
2.  **Alertas de Recharts (WA-SSR):** `ResponsiveContainer` emitindo width(-1) em SSR (Performance e AbmStrategy).
3.  **IIFEs Gigantes:** Grupo de ~1000 linhas em `AbmStrategy.tsx` mantido como dívida técnica aceita.
4.  **Estilos Inline:** `Performance.tsx` ainda possui estilos inline legados.

## Próximos passos (Direção Recomendada)
- **Recorte 28 — Deep Intelligence (Fila de Fogo):** Implementar a "Fila de Fogo" (Fire Queue) — uma seção dinâmica de automação sugerida que cruza o histórico (R27) com os sinais ativos (R25/R26) para disparar plays em lote.
- **Refino de Gráficos:** Estabilização total de width/height em ResponsiveContainers.
- **Migração de Imagens:** Substituição gradual por next/image para otimização de LCP.
