# Especificação UX: Guia Único de Mapeamento e Qualidade Salesforce

## 1. Diagnóstico UX (O problema atual)
O modelo atual de "Cards de Pendência" + "Seção Verde de Resolvidos" apresenta falhas críticas de usabilidade e percepção de valor:
- **Duplicação de Experiência:** O usuário precisa olhar em dois lugares diferentes para entender o estado da mesma massa de dados.
- **Espaço Desperdiçado:** A seção de itens resolvidos ocupa espaço vertical precioso de forma meramente decorativa, sem oferecer poder operacional real após a correção.
- **Incerteza de Fluxo:** Não há um feedback claro de "Conclusão". O usuário resolve um item, ele "some" de um lugar e "aparece" em outro, gerando uma carga cognitiva desnecessária para rastrear o progresso.
- **Hierarquia Invertida:** A jornada parece uma lista de tarefas (to-do list) em vez de um processo de integração profissional (Mapeamento -> Qualidade -> Sincronização).
- **Fragmentação da Decisão:** As correções locais parecem descoladas da fonte original, quando deveriam ser tratadas como um "Mapeamento de Valor" (ex: "No Salesforce é X, na Canopi será Y").

## 2. Jornada-alvo da Página Salesforce

A experiência deve seguir um fluxo linear de 10 passos:

| Etapa | Nome | Objetivo | CTA Principal | Estado de Sucesso | Consequência Real |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Conectar** | Estabelecer ponte com API | Conectar via Salesforce | Conectado | Token OAuth ativo |
| 2 | **Validar** | Confirmar saúde da conexão | Validar conexão | Conexão Ativa | Garantia de leitura |
| 3 | **Escopo** | Selecionar o que buscar | Buscar Accounts | Dados localizados | JSON bruto carregado |
| 4 | **Analisar** | Identificar gaps de dados | Analisar qualidade | Análise concluída | Pendências mapeadas |
| 5 | **Mapear & Revisar** | Unificar visão de campos | (Navegação na Tabela) | Campos mapeados | `qualityResolutions` criados |
| 6 | **Resolver Inline** | Corrigir gaps sem sair da tela | Aplicar Correção | Status: Pronto | Valor normalizado em memória |
| 7 | **Recalcular** | Atualizar visão após ajustes | Recalcular análise | 100% Prontos | Contrato pronto para dry-run |
| 8 | **Revisar Impacto** | Ver o que será alterado | Revisar dry-run | Sem bloqueadores | Segurança operacional |
| 9 | **Confirmar Sync** | Executar gravação segura | Sincronizar dados | Sync em progresso | Gravação no DB Canopi |
| 10 | **Concluir** | Fechar ciclo | Ver Dashboard | Finalizado | Memória de sessão limpa |

## 3. Seção: "Guia de mapeamento e qualidade dos dados"

Esta seção substitui integralmente os componentes `AccountQualityPendingCards` e `AccountQualityResolvedSection`.

### Estrutura Visual
- **Header:** Barra de progresso compacta (ex: `12 itens analisados · 8 prontos · 3 requerem ajuste · 1 bloqueador`).
- **Controles:** Filtros rápidos por Status (Ver todos, Apenas erros, Apenas corrigidos).
- **Tabela Única:** Interface de alta densidade inspirada em planilhas/RD Station.

### Colunas da Tabela
1. **Conta/Registro:** Nome e Id do Salesforce (com link externo).
2. **Campo:** O nome do campo (ex: Industry, Website).
3. **Valor Salesforce:** O valor original vindo da API.
4. **Valor Canopi / Decisão:** Select ou Input para edição inline.
5. **Status:** Badge visual indicando o estado da linha.
6. **Ação:** Botão "Aplicar" ou ícone de "Salvar".

## 4. Status e Comportamento por Linha

| Status | Sinal Visual | Significado | Operacional |
| :--- | :--- | :--- | :--- |
| **Requer ajuste** | 🟡 Amarelo | Campo vazio ou valor inválido | Bloqueia sync deste registro |
| **Corrigido local** | 🔵 Azul | Valor alterado manualmente na Canopi | Usa o valor local no sync |
| **Bloqueador** | 🔴 Vermelho | Falta Id ou Nome (campos chave) | Bloqueia o processo inteiro |
| **Ignorado** | ⚪ Cinza | Usuário optou por não sincronizar este item | Registro pulado no sync |
| **Pronto** | 🟢 Verde | Dados válidos e mapeados | Pronto para gravação |

## 5. Edição Inline por Campo

As correções ocorrem diretamente na célula da coluna **Valor Canopi / Decisão**:

- **Industry (Setor):**
    - Select com os setores oficiais da Canopi.
    - Se "Outro", abre input de texto.
    - Botão "Aplicar" na linha. Status vira "Corrigido local".
- **Type (Tipo):**
    - Select fixo. Aplicar na linha.
- **Website:**
    - Input de texto com validação de URL.
- **OwnerId:**
    - Não editável. Opções: "Corrigir no Salesforce" (apenas texto instrutivo) ou "Aceitar temporariamente".
- **Name/Id:**
    - Bloqueador. Exibe mensagem: "Corrija na origem para prosseguir".

## 6. Regras de Consequência Real
- **Persistência de Sessão:** Toda alteração alimenta o objeto `accountQualityResolutions` no estado do componente.
- **Independência de Sync:** Salvar uma linha NÃO dispara o sync real. Apenas prepara os dados para o próximo "Recalcular".
- **Normalização:** Valores devem ser salvos sem prefixos técnicos como `__custom__` ou `__ai__`. O sistema deve saber diferenciar a origem pela estrutura do objeto de resolução.

## 7. Progressão e Conclusão Real
O botão de ação principal da página (embaixo) reage ao guia:
- Enquanto houver **Bloqueadores**: Botão desabilitado. Texto: "Resolva os bloqueadores para avançar".
- Enquanto houver **Pendências**: Botão: "Recalcular análise".
- Quando **Tudo Pronto**: Botão: "Revisar impacto da sincronização" (abre o Dry-run).

---

## 8. Wireframe Textual (Markdown)

```text
+-----------------------------------------------------------------------+
|  SALESFORCE: IMPORTAÇÃO E QUALIDADE                                   |
+-----------------------------------------------------------------------+
| [ Stepper: Conectar > Analisar > MAPEAR > Sincronizar ]               |
+-----------------------------------------------------------------------+
|                                                                       |
|  Guia de mapeamento e qualidade dos dados                             |
|  [||||||||||-------] 8 de 12 itens prontos (1 bloqueador)             |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Conta        | Campo     | Valor Salesforce | Valor Canopi      |  |
|  +--------------+-----------+------------------+-------------------+  |
|  | Acme Corp    | Industry  | <vazio>          | [ Selecionar... ] |  | [Aplicar]
|  | Globex Inc   | Website   | inv@lid          | [ globex.com    ] |  | [Aplicar]
|  | Stark Ind    | Name      | <vazio>          | ! Bloqueador      |  | [Ver no SF]
|  | Wayne Ent    | Type      | Customer         | Pronto (🟢)       |  | [Editar]
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [ Botão: RECALCULAR ANÁLISE ]                                        |
|                                                                       |
+-----------------------------------------------------------------------+
| > Detalhes técnicos e auditoria (Recolhido)                           |
+-----------------------------------------------------------------------+
```

---

## 9. Handoff para Claude Code/Sonnet

### Objetivo da Implementação
Substituir a lógica de cards espalhados por uma estrutura de tabela/lista controlada que gerencie `accountQualityResolutions` de forma centralizada e visualmente unificada.

### Arquivos Envolvidos
- `SalesforceMultiEntityPreview.tsx` (Componente principal).
- Criar `SalesforceQualityGuide.tsx` (Novo componente de tabela).
- Remover `AccountQualityPendingCards.tsx` e `AccountQualityResolvedSection.tsx`.

### Estados a Gerenciar
- Integrar as resoluções existentes ao carregar o guia.
- Manter o estado local sincronizado com a prévia de Accounts.

### Critérios de Aceite
1. Nenhuma linha "Resolvida" deve aparecer em seção separada.
2. O botão "Aplicar" deve atualizar o status da linha na hora, sem reload.
3. Se o usuário mudar a extração (contrato), as resoluções compatíveis (por Id) devem ser preservadas.
4. O header de progresso deve refletir o estado real da tabela após cada "Aplicar".

### Validação Técnica
- Garantir que `onApplyResolution` receba o objeto limpo.
- Validar se a função `deriveAccountStatus` (ou similar) está pronta para lidar com a nova taxonomia de status.
