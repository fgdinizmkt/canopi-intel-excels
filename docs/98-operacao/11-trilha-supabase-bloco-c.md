# Trilha Supabase Bloco C — Infraestrutura e Persistência
 
## Contexto
Esta etapa prepara a infraestrutura para levar os dados determinísticos do Bloco C (Campaigns, Interactions, Play Recommendations) para o Supabase, seguindo o padrão defensivo de leitura com fallback.
 
## Componentes Criados
 
1. **Migration SQL**: `supabase/migrations/20260413000000_bloco_c.sql`
   - Define as tabelas `campaigns`, `interactions` e `play_recommendations`.
   - Implementa snake_case no banco e RLS básico (leitura pública).
 
2. **Repositories (Leitura Defensiva + Adaptation Layer)**:
   - `src/lib/campaignsRepository.ts`
   - `src/lib/interactionsRepository.ts`
   - `src/lib/playRecommendationsRepository.ts`
   - **Camada de Adaptação**: Implementação de mappers explícitos para converter `snake_case` (Supabase) para `camelCase` (Domínio).
   - **Filtros Confiáveis**: Filtros por `accountId` e `campaignId` agora operam sobre dados já adaptados.
   - **Padrão**: Tenta ler do Supabase -> Adapta Rows para Domain -> Fallback automático para `buildBlockCSeed()` (JSON versionado).
 
3. **Import Script**: `scripts/supabase/importBlockCSeed.ts`
   - Script idempotente que lê `seed/generated/bloco-c.parcial.json` e faz `upsert` no Supabase.
   - Realiza o mapeamento camelCase (TS) -> snake_case (SQL).
 
## Fluxo de Execução
 
### 1. Aplicar Migration
Copie o conteúdo de `supabase/migrations/20260413000000_bloco_c.sql` e execute no SQL Editor do seu dashboard Supabase.
 
### 2. Configurar Variáveis de Ambiente
Certifique-se de que o `.env.local` contenha a Service Role Key para permitir a importação:
```
SUPABASE_SERVICE_ROLE_KEY_DEV=sua_chave_aqui
```
 
### 3. Rodar Importação
Execute o script de importação via `npx tsx`:
```bash
export PATH=$PATH:/usr/local/bin && npx tsx scripts/supabase/importBlockCSeed.ts
```
O script é **idempotente** (pode ser rodado múltiplas vezes sem duplicar registros).
 
### 4. Validação
O log do console deve indicar o sucesso do upsert para as 3 tabelas. 
A partir deste momento, as chamadas a `getCampaigns()`, `getInteractions()` e `getPlayRecommendations()` passarão a preferir os dados do Supabase se configurado.
 
## Invariantes Preservados
- **Integridade de Casca (Mappers)**: Nenhuma propriedade `snake_case` vaza para a aplicação. O contrato do domínio em `camelCase` é a única interface visível.
- **Local-First**: Se o Supabase estiver offline ou não configurado, o sistema usa o JSON versionado automaticamente com o mesmo shape.
- **Estrutura**: A tipagem do repositório é idêntica à do Seed, garantindo zero impacto na build.
- **Zero UI Impact**: Nenhuma tela foi alterada ainda, apenas a infraestrutura de dados.

## Decisões Arquiteturais (Draft Migration)
- **Foreign Keys materiais**: Nesta etapa de infraestrutura básica, as FKs não foram aplicadas via `ALTER TABLE` na migration para evitar bloqueios de importação durante cargas parciais ou shells órfãos. Elas serão migradas para constraints físicas na fase de "Fechamento Binário" do projeto.
- **Validação em Runtime**: A integridade relacional é garantida pela camada de repositório e pelos validadores de seed.
 
## Próximo Passo
Integração progressiva destes repositórios nas páginas de `Accounts`, `Signals` e `Campaigns/Analytics` para substituir o consumo direto de mocks locais.
