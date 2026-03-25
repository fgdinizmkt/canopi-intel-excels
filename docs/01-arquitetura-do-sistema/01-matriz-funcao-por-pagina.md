# Canopi | Matriz de Função por Página

## Objetivo
Consolidar o papel de cada página da Canopi, delimitando claramente sua função principal, o que consome, o que produz, para onde direciona o usuário e qual é sua fronteira funcional dentro da V1.

## Regras desta matriz
- A plataforma não deve virar uma coleção de dashboards soltos.
- Cada página precisa ter uma responsabilidade principal clara.
- Detectar, analisar, executar e aprender são camadas diferentes e não devem ser confundidas.
- Páginas fora da V1 podem existir como referência futura, mas não devem contaminar o escopo atual.

## Matriz

| Página | Camada | Papel principal | Consome | Produz | Para onde empurra o usuário | Fronteira clara | Status V1 |
|---|---|---|---|---|---|---|---|
| Visão Geral | Núcleo | Cockpit executivo-operacional da plataforma | KPIs, alertas, status de contas, canais, integrações | priorização macro, leitura de risco e oportunidade | Sinais, Ações, Desempenho, Contas, ABM, ABX | não aprofunda análise nem execução | Entra |
| Sinais | Núcleo | Detectar desvios, riscos, oportunidades e anomalias | dados operacionais, CRM, canais, ABM, ABX | alertas qualificados com causa provável, impacto e urgência | Ações, Contas, ABM, ABX, Integrações | não executa, não vira dashboard geral | Entra |
| Ações | Núcleo | Hub operacional consolidado de execução | ações manuais, ações sugeridas por sinais, ABM, ABX, canais | fila operacional, owners, prazos, status, plano executável | Contas, canais, ABM, ABX | não é recomendador puro, é camada de execução | Entra |
| Desempenho | Núcleo | Leitura analítica consolidada por dimensão | campanhas, canais, conversão, pipeline, owners | diagnóstico comparativo, eficiência, tendências | Ações, Contas, canais, ABM, ABX | não substitui BI detalhado nem páginas de canal | Entra |
| Contas | Entidade | Visão profunda por empresa | CRM, histórico, sinais, ações, pipeline, owners | contexto acionável da conta, prioridade, risco, prontidão | Contatos, Ações, ABM, ABX | não absorve execução nem o detalhe individual do contato | Entra |
| Contatos | Entidade | Visão profunda por stakeholder | dados do contato, relacionamento, sinais, campanhas, comitê | leitura de influência, acessibilidade, abordagem e próxima ação | Conta, Ações, ABM, ABX | não substitui a conta, nem CRM bruto | Entra |
| Estratégia ABM | Estratégia | Planejar e qualificar motion account-based | contas-alvo, fit, prontidão, campanhas, sinais | seleção, clusters, prioridade, plays ABM | Contas, Ações, canais | não opera jornada contínua de pós-venda/expansão | Entra |
| Orquestração ABX | Estratégia | Orquestrar continuidade, expansão e plays por jornada | contas, contatos, relacionamento, jornada, sinais | plays ABX, continuidade, handoffs, expansão | Contas, Contatos, Ações | não substitui ABM, nem vira CS completo | Entra |
| Inteligência Cruzada | Estratégia | Reaproveitar aprendizados entre ABM e ABX | padrões históricos, contas similares, resultados, sinais | recomendações reaproveitáveis, hipóteses e sugestões | Ações, ABM, ABX, Contas | não executa, não substitui Sinais nem Ações | Entra |
| Performance Orgânica | Canal prioritário | Ler impacto e execução do orgânico | conteúdo, SEO, tráfego, contas impactadas | diagnóstico e oportunidades do canal | Desempenho, Ações, Contas | não vira página geral de conteúdo | Entra |
| Mídia Paga | Canal prioritário | Ler impacto e execução de mídia | campanhas, investimento, público, contas | diagnóstico, eficiência, públicos e ajustes | Desempenho, Ações, Contas, ABM | não substitui gestão detalhada do ads manager | Entra |
| Outbound | Canal prioritário | Operar e ler cadências e abordagem ativa | contatos, contas, cadências, respostas, sinais | priorização de abordagem, follow-up, ajuste de play | Ações, Contatos, ABM, ABX | não vira CRM comercial inteiro | Entra |
| Assistente | Sustentação | Apoiar leitura, síntese e recomendação no sistema todo | dados e contexto de toda a plataforma | respostas, resumos, explicações, sugestões | qualquer página relevante | não é módulo isolado de operação | Entra |
| Integrações | Sustentação | Governar fontes, conectores e disponibilidade de dados | status das conexões, mapeamentos, falhas | visibilidade de cobertura, ausência e saúde de dados | Configurações, páginas dependentes | não é página analítica de negócio | Entra |
| Configurações | Sustentação | Governar regras, pesos, alertas e preferências | perfis, critérios, regras, campos, notificações | comportamento do sistema e governança | toda a plataforma | não é tela de uso diário operacional | Entra |
| Eventos | Canal complementar | Canal de ativação e influência por evento | participação, follow-up, engajamento | sinais e ações ligadas a eventos | Ações, Contas, ABX | não entra agora | Fora da V1 |
| Social | Canal complementar | Distribuição e leitura social por conta/campanha | posts, engajamento, campanhas | sinais e ações de distribuição social | Desempenho, Ações, Contas | não entra agora | Fora da V1 |
| Customer Success | Frente posterior | Leitura pós-venda e expansão dedicada | saúde da conta, uso, risco, expansão | plays de retenção e expansão | ABX, Contas, Ações | não entra agora como módulo próprio | Fora da V1 |

## Leituras de produto
- A Canopi precisa separar com clareza páginas de núcleo, entidades, estratégia, canais prioritários e sustentação.
- Visão Geral não é página de trabalho profundo. Ela serve para orientar navegação e priorização.
- Sinais e Ações formam o eixo mais operacional do sistema: uma detecta, a outra dá consequência.
- Contas e Contatos são profundidades reais de entidade, não apenas listas com filtros.
- ABM e ABX não devem viver como universos paralelos. Devem se apoiar em entidades e fluxos comuns.
- Assistente, Integrações e Configurações são camadas de sustentação. Não devem roubar protagonismo operacional das páginas núcleo.

## Decisões oficiais derivadas
1. Eventos, Social e Customer Success ficam fora da V1.
2. A V1 deve priorizar páginas que geram leitura acionável e consequência operacional.
3. A Canopi deve evitar redundância entre páginas de canal, Desempenho, Sinais e Ações.
4. Toda nova página futura deve explicitar sua fronteira antes de entrar no produto.
