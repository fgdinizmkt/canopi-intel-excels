# Task: Overhaul do Centro de Comando ABX

O objetivo é transformar a página de Orquestração ABX no carro-chefe da Canopi, com máxima densidade de dados e clareza operacional.

## 1. Reconstrução do Hero e Big Numbers
- [x] Implementar Hero Layer com âncora visual forte (escuro/premium).
- [x] Adicionar Big Numbers Executivos: Mapeamento, Qualidade, Potencial Upsell/Cross-sell (R$), Churn Risk (R$).
- [x] Destacar insights críticos (Top Opp, Top Risk, Funnel Bottleneck) no Hero.

## 2. Implementação das Rotas de Ação (Intervention Hub)
- [x] Criar componente `ActionRoutesLayer` com 4 categorias de intervenção.
- [x] Adicionar cards operacionais com conta, ação, canal, owner e justificativa.
- [x] Sugerir alternativas de "Acelerar" e "Defender" com base nos dados.

## 3. Visualização e Heatmaps Corrigidos
- [x] Corrigir Heatmap de Cobertura com escala semântica Quente/Frio.
- [x] Redesenhar Heatmap de Whitespace como Matriz Categórica (Atendida/Opp/Risco).
- [x] Adicionar legendas claras e hovers explicativos.

## 4. Pipeline e Dados Operacionais
- [x] Detalhar Pipeline por Vertical x Estágio do Funil.
- [x] Integrar fontes de dados (CRM, Apollo, etc.) em toda a página.
- [x] Expandir Memória Comercial com histórico de Wins/Losses e projetos ativos.

## 5. Fila Operacional e Detalhamento da Conta
- [x] Adicionar novas colunas na Fila de Comando: Rota Sugerida, Confiança, Fonte.
- [x] Implementar Painel Lateral (Modal) com visão 360° da conta ao clicar.

## 7. Polimento de Design e Contraste (Obrigatório)
- [x] Corrigir botões em branco e elementos incompletos.
- [x] Ajustar contraste de textos, chips e badges.
- [x] Padronizar hierarquia visual (eliminar sensação de placeholder).
- [x] Melhorar legibilidade sem remover blocos atuais.

## 8. Nova Macroseção: Camada de Pessoas e Influência ABX
- [x] Criar `ContactsSummaryLayer` (Big Numbers de contatos).
- [x] Implementar `ContactCoverageHeatmap` (Contas x Buying Group Roles).
- [x] Implementar `ContactEngagementHeatmap` (Contatos x Canais).
- [x] Adicionar Gráficos de Dispersão (Influência x Acessibilidade e Engajamento x Poder).
- [x] Criar `ContactOperationalTable` (Fila operacional de pessoas).
- [x] implementar `PersonRecommendedActions` (Cards de Aproximar, Contornar, etc.).
- [x] Adicionar `HumanMappingDiagnosis` (Status de mapeamento por conta).
- [x] Indicar Fontes de Dados (CRM, Apollo, etc.) na camada de contatos.
- [x] Garantir que a seção seja integrada abaixo de tudo o que já existe.
