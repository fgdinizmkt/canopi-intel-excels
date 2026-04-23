# Auditoria de Aderência — Etapa 4 (Plays, ABM e ABX)

Esta auditoria valida a materialização da Etapa 4 da página de Configurações, focando na camada de orquestração e táticas avançadas da Canopi.

## 1. Prova de Materialização (Ground Truth)

Com base no arquivo `src/app/(shell)/configuracoes/page.tsx`:

### A. Biblioteca de Plays (Tactical Plays)
- **Localização (Estado):** Linhas ~330-375 (`plays`).
- **Localização (UI):** Linhas ~1190-1255 (`PlaysSection`).
- **Implementado:** 
  - Cards detalhados com Categoria (Acquisition/Expansion), Tipo, Owner Padrão e Estágio de Ativação.
  - Exibição de Pré-condições e Critérios de Sucesso.
  - Governança de Status (Draft, Validated, Published).

### B. ABM Setup (ICP, Tiers e Clusters)
- **Localização (Estado):** Linhas ~377-398 (`abmConfig`).
- **Localização (UI):** Linhas ~1257-1324 (`ABMSection`).
- **Implementado:**
  - Setup de ICP: Verticais, Employee Range, Revenue Min e Technographics.
  - Gestão de Tiers: Definição de critérios lógicos e playbooks sugeridos por Tier.
  - Clusters Operacionais: Lógica de agrupamento de contas (ex: Finance LATAM).

### C. ABX Orchestration (Journey & Rules)
- **Localização (Estado):** Linhas ~400-422 (`abxConfig`).
- **Localização (UI):** Linhas ~1326-1417 (`ABXSection`).
- **Implementado:**
  - Definição de Journey Stages (Unaware -> Expansion).
  - Lógica de Sponsor e Champion Recognition.
  - Regras de Orquestração: Mapeamento de Evento -> Ação -> Handoff entre times.
  - Risk Alert: Stagnation days e Multi-threading triggers.

---

## 2. Separação de Camadas

| Bloco | Real no Front | Simulação/Local State | Motor Operacional |
| :--- | :--- | :--- | :--- |
| **Plays** | Biblioteca visual completa com badges e tags. | Dados das plays e filtros. | Ativação automática de plays (Pendente). |
| **ABM** | Setup de ICP e matriz de Tiers. | Parâmetros de segmentação. | Atribuição de Tier via engine (Pendente). |
| **ABX** | Fluxograma de orquestração e regras de risco. | Regras de transição de estágio. | Orquestrador de eventos real (Pendente). |

---

## 3. Mapa de Espelhamento: Configuração ↔ Canopi

| Configuração Criada | Onde aparece na Canopi | O que muda quando alterada |
| :--- | :--- | :--- |
| **Tactical Plays** | Cockpit / Ações Sugeridas | As táticas que o SDR/AE visualiza ao abrir uma conta. |
| **Account Tiers** | Visão Geral de Contas | A priorização e o nível de serviço (SLA) aplicado à conta. |
| **Journey Stages** | Orquestração ABX / Pipeline | Onde a conta é posicionada no funil de maturidade. |
| **Technographics ICP** | Filtros de Inteligência | Quais contas são sinalizadas como "High Fit" automaticamente. |

---

## 4. Auditoria de Contrato (ROADMAP)

- **Alta densidade funcional?** Confirmado. Seções utilizam grids, badges de status e detalhamento de regras lógicas.
- **Não virou health dashboard?** Confirmado. O foco é estrito na parametrização de regras e critérios (pre-conditions, success criteria).
- **Sem vazamento para Etapa 5?** Confirmado. Não foram incluídas funcionalidades de Intelligence Exchange ou Governança de API.
- **Coerência com Etapas 1-3?** Confirmado. As regras de orquestração (Etapa 4) utilizam os sinais (Etapa 3) e objetos (Etapa 1) como insumos.

---

## 5. Evidências de Build e Diff

### Output do Build
```bash
▲ Next.js 15.5.15
   Creating an optimized production build ...
 ✓ Generating static pages (40/40)
Exit code: 0
```

### Git Diff Stat
```text
 .../00-status-atual.md        |   21 +
 ...iguracoes-setup-roadmap.md |  259 +-
 .../configuracoes/page.tsx    | 1510 +++++-
```
