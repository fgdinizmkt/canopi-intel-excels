# HubSpot identity mapping proposal dry-run — fechamento operacional

## Status
- Proposta controlada de recuperação de mappings HubSpot ↔ Canopi implementada, validada manualmente no Supabase SQL Editor em modo read-only e fechada operacionalmente.
- Nenhuma escrita foi feita.
- Nenhum apply foi executado.
- Nenhuma RPC foi chamada.
- O recorte não popula mappings, não adapta snapshot, não altera preflight e não altera a RPC.

## Commit
- `2119893` — `feat(settings): add HubSpot identity mapping proposal dry-run`

## Objetivo do recorte
- Criar uma proposta controlada, somente leitura, para medir se algum account do snapshot poderia virar mapping com segurança antes de qualquer insert em `hubspot_identity_mappings`.
- Separar proposta forte de persistência automática.

## Por que a proposta controlada foi necessária
- O dry-run anterior confirmou que a recuperação exata de identidade ainda não estava resolvida.
- As 348 accounts do snapshot permaneceram sem match seguro contra a base canônica atual.
- Era necessário confirmar, com queries manuais read-only, se havia algum candidato forte ou se a persistência de mappings deveria continuar bloqueada.

## Regra de classificação
- `proposed_exact` apenas quando existe ID canônico direto ou mapping persistido compatível.
- `proposed_strong` apenas quando nome + domínio normalizados apontam para um único candidato.
- `ambiguous` quando há mais de um candidato plausível.
- `unsafe` quando a evidência é fraca ou os sinais divergem.
- `unresolved` quando não há candidato seguro.
- `missing_required_fields` apenas quando faltam campos mínimos do próprio snapshot.
- Heurística não promove `proposed_exact`.

## Classificações usadas
- `proposed_exact`
- `proposed_strong`
- `ambiguous`
- `unsafe`
- `unresolved`
- `missing_required_fields`

## Validação manual read-only
- A execução local via Codex falhou por `fetch failed` no acesso ao Supabase.
- A validação funcional foi feita manualmente no Supabase SQL Editor com queries somente leitura.
- As queries foram apenas `SELECT`, sem RPC, sem `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER` ou `DROP`.

## Resultados confirmados
- Query 1:
  - `total_accounts = 348`
  - `accounts_with_nome = 348`
  - `accounts_with_dominio = 348`
  - `accounts_with_nome_e_dominio = 348`
  - `accounts_missing_required_fields = 0`
- Query 2:
  - `total_accounts = 348`
  - `proposed_exact = 0`
  - `proposed_strong = 0`
  - `ambiguous = 0`
  - `unsafe = 0`
  - `unresolved = 348`
  - `missing_required_fields = 0`
  - `direct_canonical_matches = 0`
  - `mapping_matches = 0`
  - `pair_count_one = 0`
  - `pair_count_many = 0`
  - `name_count_one = 0`
  - `domain_count_one = 0`
- Query 3:
  - `classification = unresolved`
  - `total = 348`
  - amostras como `marcam.com.br`, `ultragaz.com.br`, `grupopromex.com.br` e `cacaushow.com.br`
  - `nameCount = 0`
  - `domainCount = 0`
  - `pairCount = 0`
  - `mappingMatchCount = 0`
  - `directCanonicalMatch = false`
- Query 4:
  - `accounts = 250`
  - `contacts = 305`
  - `hubspot_identity_mappings = 0`
  - `hubspot_ingest_contracts = 3`

## Diagnóstico das 348 accounts unresolved
- Não houve match seguro por ID canônico.
- Não houve match por mapping persistido.
- Não houve match por nome normalizado.
- Não houve match por domínio normalizado.
- Não houve match por par nome+domínio.
- O problema é de desalinhamento entre a base HubSpot usada no snapshot e a base canônica atual da Canopi.
- A conclusão operacional é não persistir mappings agora.

## Limites explícitos deste recorte
- Não popula mappings.
- Não adapta snapshot.
- Não altera preflight.
- Não altera RPC.
- Não executa apply.
- Não resolve contacts individualmente.
- Não escreve em `accounts`, `contacts`, `hubspot_ingest_contracts`, `hubspot_identity_mappings` ou backups.

## Decisão operacional
- Não persistir mappings agora.
- Investigar o desalinhamento entre a base HubSpot e a base canônica atual antes de qualquer insert.

## Próximo recorte recomendado
- Investigar a origem do desalinhamento entre HubSpot e Canopi.
- Só depois decidir se haverá persistência controlada de mappings.
- Caso persista, regenerar snapshot com `canonicalId`, endurecer preflight e adaptar a RPC.
