# Trilha Supabase Bloco C — Infraestrutura e Persistência
 
## Contexto
Esta etapa prepara a infraestrutura para levar os dados determinísticos do Bloco C (Campaigns, Interactions, Play Recommendations) para o Supabase, seguindo o padrão defensivo de leitura com fallback.
 
## Componentes Criados
 
1. **Migration SQL**: `supabase/migrations/20260413000000_bloco_c.sql`
   - Define as tabelas `campaigns`, `interactions` e `play_recommendations`.
   - Implementa snake_case no banco e RLS básico (leitura pública).
 
2. **Repositories (Leitura Defensiva)**:
   - `src/lib/campaignsRepository.ts`
   - `src/lib/interactionsRepository.ts`
   - `src/lib/playRecommendationsRepository.ts`
   - Padrão: Tenta ler do Supabase -> Fallback automático para `buildBlockCSeed()` (JSON versionado).
 
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
- **Local-First**: Se o Supabase estiver offline ou não configurado, o sistema usa o JSON versionado automaticamente.
- **Estrutura**: A tipagem do repositório é idêntica à do Seed, garantindo zero impacto na build.
- **Zero UI Impact**: Nenhuma tela foi alterada ainda, apenas a infraestrutura de dados.
 
## Próximo Passo
Integração progressiva destes repositórios nas páginas de `Accounts`, `Signals` e `Campaigns/Analytics` para substituir o consumo direto de mocks locais.
