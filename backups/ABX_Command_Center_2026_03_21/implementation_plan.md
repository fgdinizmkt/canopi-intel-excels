# Overhaul do Centro de Comando ABX - Canopi

A página de Orquestração ABX será transformada na tela-assinatura da Canopi, um verdadeiro **Centro de Comando de Expansão e Retenção**. O objetivo é atingir a densidade máxima de dados úteis, eliminando placeholders e tornando cada pixel operacionalmente memorável.

## User Review Required

> [!IMPORTANT]
> Esta é uma reestruturação profunda. Vou consolidar o "Hero" como um centro escuro de alta densidade e introduzir uma nova camada de "Rotas de Ação".
> [!WARNING]
> Os Heatmaps serão totalmente refeitos para usar uma escala semântica clara (Quente/Frio), o que pode alterar a leitura visual imediata em favor da clareza operacional.

## Mudanças Propostas

### 1. Hero Layer: O Coração do Comando (Dark & Strong)
*   **Big Numbers Executivos**: Mapeamento, Qualidade, Potencial de Upsell/Cross-sell (em R$) e Risco de Churn (em R$).
*   **Insights Críticos**: Destaque para a conta de maior oportunidade, maior risco e o estágio mais lento do funil.
*   **Call to Actions**: Botões fortes para "Abrir Fila Priorizada" e "Ver Recomendações".

### 2. Rotas de Ação (Intervention Hub) [NOVO]
*   **Categorias**: Acelerar Upsell, Acelerar Cross-sell, Defender Churn, Destravar Conta Parada.
*   **Interface**: Grid de 4 áreas com cards contextuais sugerindo ações imediatas (ex: "Acionar Sponsor Executivo", "Pagar LinkedIn Ads para Champion").

### 3. Pipeline e Heatmaps Corrigidos
*   **Escala Quente-Frio**: Vermelho/Laranja (Alta Urgência/Oportunidade) para Azul/Cinza (Baixa intensidade/Estável).
*   **Whitespace Matrix**: Matriz categórica clara mostrando Presença, Oportunidade Aberta, Expansão Recomendada e Risco.

### 4. Memória Comercial e Dados Reais
*   **Integração de Dados**: Uso extensivo dos campos `Obs`, `MÉDIA`, e `Qual_Solução...` para derivar dores e próximos passos.
*   **Histórico**: Visualização de Wins/Losses e projetos ativos de forma mais granular.

### 5. Fila Operacional V2
*   **Side Panel**: Ao clicar em uma conta, abre-se um painel lateral com 360° da conta (Projetos, Dores, Whitespace, Contatos).
*   **Fontes**: Badges explícitos indicando de onde vem cada insight (CRM, Apollo, Paid Media).

## Plano de Verificação

### Visual & UX
*   Confirmar que não há retângulos vazios ou placeholders.
*   Validar hierarquia visual entre o bloco escuro e o restante da página.

### Dados e Funcionalidade
*   Testar o cálculo automático de "Potencial R$" baseado no tamanho das empresas.
*   Verificar a correta atribuição de cores nos novos heatmaps semânticos.
*   Garantir diferenciação total da página de ABM Strategy.
