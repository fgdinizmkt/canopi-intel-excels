# 36 - Configuração da Empresa Cliente

## 1. Contexto
Durante o desenvolvimento do módulo Salesforce e das ferramentas operacionais da Canopi, identificou-se a necessidade de uma camada estruturante de negócio. Atualmente, a plataforma consome dados brutos (Accounts, Contacts, Opportunities) e eventos, mas precisa de um referencial estratégico para transformar dados operacionais em inteligência acionável. A "Configuração da Empresa Cliente" servirá como este cérebro referencial.

## 2. Objetivo da área
Criar futuramente uma página/área de configuração da empresa cliente para calibrar a inteligência da Canopi com dados estratégicos e operacionais do negócio do cliente. Esta área não deve ser vista como uma tela isolada de settings, mas como a camada estruturante que ensina a plataforma a "pensar" como a empresa usuária.

## 3. Campos mínimos
A configuração deve abranger, no mínimo, as seguintes dimensões:
- Posicionamento da empresa
- ICPs (Ideal Customer Profiles)
- Personas
- Produtos e serviços
- Ciclo médio de fechamento
- OKRs mensais, trimestrais e/ou anuais
- Metas de receita
- Contexto comercial
- Premissas de go-to-market
- Segmentos prioritários
- Verticais atendidas
- Critérios de priorização de contas
- Critérios de qualificação/desqualificação
- Modelo comercial
- Canais de aquisição
- Playbooks comerciais e de marketing
- Parâmetros estratégicos para orientar análises, recomendações, priorização de contas, plays e leitura de performance

## 4. Como essa configuração alimenta a inteligência da plataforma
Esta área fornecerá o "norte" para o motor de recomendações da Canopi. Ao invés de usar heurísticas genéricas, o sistema cruzará os sinais e métricas de engajamento (ex: atividades de ABM) contra as metas (OKRs) e o ICP definidos. Isso permitirá que a plataforma classifique leads com maior precisão, sugira next best actions altamente contextualizadas e demonstre o impacto real no pipeline baseado no ciclo médio de vendas e contexto comercial.

## 5. Relação com cockpit, ABM, ABX, contas, contatos, sinais, plays e performance
- **Cockpit & Performance:** Os OKRs e metas de receita balizam os painéis executivos. O Cockpit refletirá se a operação está no caminho para atingir a meta configurada.
- **ABM & ABX:** Os segmentos prioritários, verticais e premissas de GTM guiarão a criação e a eficácia de campanhas focadas.
- **Contas e Contatos (Scoring):** Critérios de ICP, Personas e qualificação/desqualificação ditarão automaticamente o tiering e a prioridade de engajamento na Fila de Fogo.
- **Sinais & Ações Recomendadas (Plays):** Sinais capturados disparam playbooks específicos. O modelo comercial e os canais de aquisição informarão quais actions e plays têm maior chance de conversão.

## 6. Observações de MVP vs visão futura
- **MVP:** Atualmente, algumas lógicas podem estar hardcoded ou utilizando heurísticas gerais em memória.
- **Visão Futura:** A introdução dessa camada de configuração tornará a inteligência da Canopi 100% dinâmica, baseando suas recomendações no setup exclusivo do tenant (Empresa Cliente). Tudo o que é inferido hoje se tornará determinístico ou contextualizado a partir desta configuração.

## 7. Status
- **Estado:** Ideia registrada / Evolução futura / Não implementada.
