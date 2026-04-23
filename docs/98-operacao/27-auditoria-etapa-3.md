# Auditoria de Aderência — Etapa 3 (Scores, Sinais e Roteamento)

Esta auditoria valida a materialização da Etapa 3 da página de Configurações, garantindo que a camada de parametrização operacional foi implementada sem desvios do roadmap oficial.

## 1. Prova de Materialização (Ground Truth)

Com base no arquivo `src/app/(shell)/configuracoes/page.tsx`:

### A. Scores (Estratificados)
- **Localização (Estado):** Linhas 161-206 (`scoringRules`).
- **Localização (UI):** Linhas 904-948 (`ScoresSection`).
- **Implementado:** Definição de pesos percentuais para Lead Fit (30%), Engagement (25%) e ABX Readiness (20%). Cada score possui componentes granulares (ex: ICP Match, Atividade Web).

### B. Sinais (Categorias, Severidade e Threshold)
- **Localização (Estado):** Linhas 208-245 (`signalConfigs`).
- **Localização (UI):** Linhas 950-988 (`SignalsSection`).
- **Atributos Reais:**
  - **Categorias:** Inbound, Pipeline, ABM.
  - **Severidade:** critical, high, medium.
  - **Thresholds:** Definição textual de gatilhos (ex: "Acesso a página de preços").
  - **Cooldown:** Prazos de resfriamento (7, 14, 30 dias).
  - **Owner/SLA:** SLA em horas (2h, 24h, 48h) e owner padrão (SDR Team, ABM Lead).

### C. Roteamento & Fallback
- **Localização (Estado):** Linhas 247-280 (`routingRules`).
- **Localização (UI):** Linhas 990-1057 (`RoutingSection`).
- **Implementado:** Priorização (1 a 3), critérios lógicos em string (`criteria`), destinos (target) e regras de fallback (ex: "Operador de Plantão").

### D. Governança (Draft/Published)
- **Localização:** Linha 157 (`publishStatus`) e Toggle no Header (linhas 1070-1080).
- **Implementado:** Alternância visual de estado entre rascunho (amber) e publicado (emerald).

---

## 2. Separação de Camadas

| Bloco | Real no Front | Simulação/Local State | Motor Operacional |
| :--- | :--- | :--- | :--- |
| **Scores** | Cards de pesos, lista de componentes e impacto. | Valores de pesos e ativação. | Cálculo de score em tempo real (Pendente). |
| **Sinais** | Visualização de severidade, SLA e condição. | Gatilhos e dependência de fonte. | Engine de disparo cross-source (Pendente). |
| **Roteamento** | Tabela de prioridades e fallbacks. | Regras de atribuição. | Atribuição automática de leads/contas (Pendente). |

---

## 3. Mapa de Espelhamento: Configuração ↔ Canopi

| Configuração Criada | Onde aparece na Canopi | O que muda quando alterada |
| :--- | :--- | :--- |
| **Lead Fit Score** | Dashboard de Contas / Cockpit | A qualificação de contas para entrada em Plays ABM. |
| **Alta Intenção (Signal)** | Fila de Ações do SDR / Notificações | A urgência de abordagem e prioridade na fila. |
| **Enterprise Routing** | Atribuição de Owner no CRM/Canopi | Quem recebe o alerta e o prazo para primeira interação (SLA). |

---

## 4. Auditoria de Contrato (ROADMAP)

- **Não empobreceu a página?** Confirmado. A página mantém alta densidade funcional com 14 abas operacionais categorizadas.
- **Não virou health dashboard?** Confirmado. O foco é em parâmetros configuráveis (Pesos, SLAs, Regras), não apenas em leitura de status.
- **Não abriu Etapa 4 indevidamente?** Confirmado. Não foram criadas bibliotecas de Plays, definições de ICP profundo ou regras de expansão.
- **Coerência com Etapas 1 e 2?** Confirmado. A Etapa 3 utiliza as fontes definidas na Etapa 1 (CRM, Stakeholders) e os sinais sugeridos na Etapa 2 (GA4, Medição).

---

## 5. Evidências de Build e Diff

### Output do Build
```bash
▲ Next.js 15.5.15
   Creating an optimized production build ...
 ✓ Generating static pages (40/40)
Exit code: 0
```
