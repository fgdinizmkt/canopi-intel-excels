# 05 - Handoff atual

## Estado atual
- Fase: Fase 7 — Deep Intelligence (Em andamento)
- **Último recorte concluído:** Deep Intelligence Perfil (25º Recorte Fase 7)
- **Último commit relevante:** `a0bd8f6` (feat(command-center): Recorte 25 - perfil empresa com leitura estruturada, ações, oportunidades e scores)
- **Data:** 2026-04-02
- **Ambiente:** Next.js 15 App Router / main íntegra (Build 100% OK, Lint 100% OK)

## Status de Qualidade (Auditado)
- **Linting:** 100% Funcional. `npm run lint` executado com 0 erros bloqueadores.
- **Build:** 100% Íntegro. `npm run build` validado com sucesso em todas as 16 rotas.
- **Acessibilidade:** Preservada e estendida no perfil da empresa.
- **Dinamização:** Enriquecimento de dados reais em `AccountDetailView.tsx`.

## Regras obrigatórias (Reforço)
1. Manter a disciplina de `npm run lint` antes de cada commit de fechamento de recorte.
2. Preservar o histórico completo nos documentos de operação.
3. Não introduzir comportamentos fictícios em botões ou interações visuais.

## O que foi entregue (Recorte 25 — Fase 7)
1.  **Perfil da Empresa:** Evolução completa de `AccountDetailView.tsx` com firmografia, scores, leitura estruturada AI, ações operacionais e pipeline de oportunidades.
2.  **Dinamização:** Conexão direta com a riqueza de dados já disponível em `contasMock`.
3.  **Qualidade:** Build de produção validado e 0 erros de lint nos arquivos alterados.

## Pendências e Observações (Auditado)
1.  **Avisos de Imagem (WA-NEXT):** `<img>` em uso (Warnings de LCP). Recomendado migrar para `next/image`.
2.  **Alertas de Recharts (WA-SSR):** `ResponsiveContainer` emitindo width(-1) em SSR (Performance e AbmStrategy).
3.  **IIFEs Gigantes:** Grupo de ~1000 linhas em `AbmStrategy.tsx` mantido como dívida técnica aceita.
4.  **Estilos Inline:** `Performance.tsx` ainda possui estilos inline legados.

## Próximos passos (Direção Recomendada)
- **Recorte 26 — Inteligência Relacional:** Aprofundar a conexão entre stakeholders e sinais ativos dentro do perfil.
- **Refino de Gráficos:** Estabilização total de width/height em ResponsiveContainers.
- **Migração de Imagens:** Substituição gradual por next/image para otimização de LCP.
