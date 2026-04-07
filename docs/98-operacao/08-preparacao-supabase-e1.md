# Preparação Supabase E1 — Ambiente Base

## Contexto
Recorte 21 prepara a fundação de ambiente Supabase sem migração total ainda.
Mocks e lógica atual permanecem intactos durante esta fase.

## Estrutura de Ambiente

### Convenção
- **dev:** Desenvolvimento local
- **staging:** Homologação (pré-produção)
- **prod:** Produção

### Variáveis de Ambiente
Todas as variáveis estão documentadas em `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL_DEV
NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV

NEXT_PUBLIC_SUPABASE_URL_STAGING
NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING

NEXT_PUBLIC_SUPABASE_URL_PROD
NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD

NEXT_PUBLIC_ENVIRONMENT (default: 'dev')
```

## Cliente Supabase

### Localização
`src/lib/supabaseClient.ts`

### Características
- Suporte a múltiplos ambientes via `NEXT_PUBLIC_ENVIRONMENT`
- Configuração dinâmica baseada em ambiente ativo
- Degradação graciosa quando env vars ausentes (retorna `null`)
- Helpers: `isSupabaseConfigured()`, `getEnvironment()`

### Uso
```typescript
import supabase, { isSupabaseConfigured } from '@/lib/supabaseClient';

if (isSupabaseConfigured()) {
  // Use Supabase
  const data = await supabase.from('table').select('*');
} else {
  // Fallback ou aviso de configuração faltante
  console.warn('Supabase não configurado');
}
```

## Setup Local

1. Copiar `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Preenchimento de credenciais (quando disponíveis):
   - Adicionar `NEXT_PUBLIC_SUPABASE_URL_DEV`
   - Adicionar `NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV`

3. Verificar que aplicação constrói sem erros:
   ```bash
   npm run build
   ```

## Estado Atual (E1)

✅ Preparação de ambiente concluída
- Cliente Supabase materializado
- Estrutura de multi-ambiente ativa
- Comportamento defensivo ativo (sem quebras se env vars faltarem)
- Mocks ainda em uso (nenhuma migração feita ainda)

⌛ Próximo: E2 (migração de primeira entidade)
