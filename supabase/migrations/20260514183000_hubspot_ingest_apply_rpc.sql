-- Migration: HubSpot ingest apply RPC — transactional foundation for canonical apply
-- This function is not invoked in this recorte. It only prepares the transactional boundary
-- for the future apply real step using the approved execution snapshot.

CREATE OR REPLACE FUNCTION public.hubspot_ingest_apply_build_result(
  p_status TEXT,
  p_contract_id UUID,
  p_approved_plan_hash TEXT,
  p_idempotency_key TEXT,
  p_persisted BOOLEAN,
  p_canonical_persisted BOOLEAN,
  p_contract_status_before TEXT,
  p_contract_status_after TEXT,
  p_summary JSONB,
  p_blockers TEXT[],
  p_warnings TEXT[],
  p_counts_before JSONB,
  p_counts_after JSONB,
  p_source_snapshot JSONB
) RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'status', p_status,
    'mode', 'apply',
    'provider', 'hubspot',
    'contractId', p_contract_id,
    'approvedPlanHash', p_approved_plan_hash,
    'idempotencyKey', p_idempotency_key,
    'persisted', p_persisted,
    'canonicalPersisted', p_canonical_persisted,
    'contractStatusBefore', p_contract_status_before,
    'contractStatusAfter', p_contract_status_after,
    'summary', p_summary,
    'blockers', COALESCE(to_jsonb(p_blockers), '[]'::jsonb),
    'warnings', COALESCE(to_jsonb(p_warnings), '[]'::jsonb),
    'countsBefore', p_counts_before,
    'countsAfter', p_counts_after,
    'sourceSnapshot', p_source_snapshot
  );
$$;

CREATE OR REPLACE FUNCTION public.apply_hubspot_ingest_contract(
  contract_id UUID,
  approved_plan_hash TEXT,
  idempotency_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contract_row public.hubspot_ingest_contracts%ROWTYPE;
  snapshot JSONB;
  source_snapshot JSONB;
  final_summary JSONB;
  counts_before JSONB;
  counts_after JSONB;
  counts_before_contracts INTEGER := 0;
  counts_before_accounts INTEGER := 0;
  counts_before_contacts INTEGER := 0;
  counts_after_contracts INTEGER := 0;
  counts_after_accounts INTEGER := 0;
  counts_after_contacts INTEGER := 0;
  blockers TEXT[] := ARRAY[]::TEXT[];
  warnings TEXT[] := ARRAY[]::TEXT[];
  contract_status_before TEXT := 'ready';
  contract_status_after TEXT := 'ready';
  accounts_applied INTEGER := 0;
  accounts_skip INTEGER := 0;
  accounts_review INTEGER := 0;
  accounts_blocked INTEGER := 0;
  contacts_applied INTEGER := 0;
  contacts_skip INTEGER := 0;
  contacts_review INTEGER := 0;
  contacts_blocked INTEGER := 0;
  account_record JSONB;
  contact_record JSONB;
  account_apply_row RECORD;
  contact_apply_row RECORD;
  current_row JSONB;
  patch JSONB;
  field_name TEXT;
  candidate TEXT;
  current_value TEXT;
  has_conflict BOOLEAN;
  replay_contract_summary JSONB;
BEGIN
  SELECT count(*)::INTEGER INTO counts_before_contracts FROM public.hubspot_ingest_contracts;
  SELECT count(*)::INTEGER INTO counts_before_accounts FROM public.accounts;
  SELECT count(*)::INTEGER INTO counts_before_contacts FROM public.contacts;

  counts_before := jsonb_build_object(
    'hubspot_ingest_contracts', counts_before_contracts,
    'accounts', counts_before_accounts,
    'contacts', counts_before_contacts
  );

  IF contract_id IS NULL THEN
    blockers := array_append(blockers, 'contract_id é obrigatório.');
    counts_after := counts_before;
    RETURN public.hubspot_ingest_apply_build_result(
      'blocked',
      contract_id,
      approved_plan_hash,
      idempotency_key,
      false,
      false,
      contract_status_before,
      contract_status_after,
      jsonb_build_object(
        'accounts', jsonb_build_object('planned', 0, 'applied', 0, 'review', 0, 'blocked', 0, 'skip', 0),
        'contacts', jsonb_build_object('planned', 0, 'applied', 0, 'review', 0, 'blocked', 0, 'skip', 0)
      ),
      blockers,
      warnings,
      counts_before,
      counts_after,
      NULL
    );
  END IF;

  IF approved_plan_hash IS NULL OR btrim(approved_plan_hash) = '' THEN
    blockers := array_append(blockers, 'approved_plan_hash é obrigatório.');
  END IF;

  IF idempotency_key IS NULL OR btrim(idempotency_key) = '' THEN
    blockers := array_append(blockers, 'idempotency_key é obrigatório.');
  END IF;

  IF array_length(blockers, 1) IS NOT NULL THEN
    counts_after := counts_before;
    RETURN public.hubspot_ingest_apply_build_result(
      'blocked',
      contract_id,
      COALESCE(btrim(approved_plan_hash), ''),
      COALESCE(btrim(idempotency_key), ''),
      false,
      false,
      contract_status_before,
      contract_status_after,
      jsonb_build_object(
        'accounts', jsonb_build_object('planned', 0, 'applied', 0, 'review', 0, 'blocked', 0, 'skip', 0),
        'contacts', jsonb_build_object('planned', 0, 'applied', 0, 'review', 0, 'blocked', 0, 'skip', 0)
      ),
      blockers,
      warnings,
      counts_before,
      counts_after,
      NULL
    );
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('hubspot-apply:' || contract_id::TEXT, 0));

  SELECT *
    INTO contract_row
    FROM public.hubspot_ingest_contracts
   WHERE id = contract_id
   FOR UPDATE;

  IF NOT FOUND THEN
    blockers := array_append(blockers, 'Contrato HubSpot não encontrado.');
    counts_after := counts_before;
    RETURN public.hubspot_ingest_apply_build_result(
      'blocked',
      contract_id,
      approved_plan_hash,
      idempotency_key,
      false,
      false,
      contract_status_before,
      contract_status_after,
      jsonb_build_object(
        'accounts', jsonb_build_object('planned', 0, 'applied', 0, 'review', 0, 'blocked', 0, 'skip', 0),
        'contacts', jsonb_build_object('planned', 0, 'applied', 0, 'review', 0, 'blocked', 0, 'skip', 0)
      ),
      blockers,
      warnings,
      counts_before,
      counts_after,
      NULL
    );
  END IF;

  contract_status_before := contract_row.status;
  snapshot := contract_row.execution_summary;
  warnings := ARRAY(
    SELECT jsonb_array_elements_text(COALESCE(snapshot->'warnings', '[]'::jsonb))
  );

  IF contract_row.provider <> 'hubspot' THEN
    blockers := array_append(blockers, 'Contrato não pertence ao provider hubspot.');
  END IF;

  IF contract_row.status = 'executed' THEN
    replay_contract_summary := contract_row.execution_summary;
    IF replay_contract_summary IS NOT NULL
       AND (replay_contract_summary->>'mode') = 'apply'
       AND (replay_contract_summary->>'status') = 'success'
       AND (replay_contract_summary->>'approvedPlanHash') = approved_plan_hash
       AND (replay_contract_summary->>'idempotencyKey') = idempotency_key THEN
      counts_after := counts_before;
      RETURN replay_contract_summary;
    END IF;

    blockers := array_append(blockers, 'Contrato já executado com um resultado incompatível com esta tentativa.');
  ELSIF contract_row.status <> 'ready' THEN
    blockers := array_append(blockers, format('Contrato não está pronto para apply (status atual: %s).', contract_row.status));
  END IF;

  IF contract_row.contract_json->>'version' <> 'c2.9e.2a' THEN
    blockers := array_append(blockers, 'contract_json.version divergente.');
  END IF;

  IF snapshot IS NULL THEN
    blockers := array_append(blockers, 'execution_summary ausente.');
  ELSE
    IF snapshot->>'version' <> 'c2.9e.2b.2a' THEN
      blockers := array_append(blockers, 'execution_summary.version divergente.');
    END IF;
    IF snapshot->>'mode' <> 'execution_plan_snapshot' THEN
      blockers := array_append(blockers, 'execution_summary.mode divergente.');
    END IF;
    IF snapshot->>'status' <> 'planned' THEN
      blockers := array_append(blockers, 'execution_summary.status deve ser planned.');
    END IF;
    IF COALESCE(snapshot->>'planHash', '') <> approved_plan_hash THEN
      blockers := array_append(blockers, 'approvedPlanHash não confere com o snapshot salvo.');
    END IF;
    IF COALESCE((snapshot->>'persisted')::BOOLEAN, false) THEN
      blockers := array_append(blockers, 'Snapshot já marcado como persistido.');
    END IF;
    IF COALESCE((snapshot->>'canonicalPersisted')::BOOLEAN, false) THEN
      blockers := array_append(blockers, 'Snapshot já marcado como canonicalPersisted.');
    END IF;
    IF COALESCE((snapshot->'unresolved'->>'ambiguousItems')::INTEGER, 0) > 0 THEN
      blockers := array_append(blockers, 'Há ambiguousItems no snapshot.');
    END IF;
    IF COALESCE((snapshot->'summary'->'accounts'->>'create')::INTEGER, 0) > 0
       OR COALESCE((snapshot->'summary'->'contacts'->>'create')::INTEGER, 0) > 0 THEN
      blockers := array_append(blockers, 'Snapshot contém create, mas este recorte é update-only.');
    END IF;
  END IF;

  IF array_length(blockers, 1) IS NOT NULL THEN
    counts_after := counts_before;
    RETURN public.hubspot_ingest_apply_build_result(
      'blocked',
      contract_id,
      approved_plan_hash,
      idempotency_key,
      false,
      false,
      contract_status_before,
      contract_status_before,
      jsonb_build_object(
        'accounts', jsonb_build_object('planned', COALESCE((snapshot->'summary'->'accounts'->>'planned')::INTEGER, 0), 'applied', 0, 'review', 0, 'blocked', 0, 'skip', COALESCE((snapshot->'summary'->'accounts'->>'skip')::INTEGER, 0)),
        'contacts', jsonb_build_object('planned', COALESCE((snapshot->'summary'->'contacts'->>'planned')::INTEGER, 0), 'applied', 0, 'review', 0, 'blocked', 0, 'skip', COALESCE((snapshot->'summary'->'contacts'->>'skip')::INTEGER, 0))
      ),
      blockers,
      warnings,
      counts_before,
      counts_before,
      CASE
        WHEN snapshot IS NULL THEN NULL
        ELSE jsonb_build_object(
          'version', snapshot->>'version',
          'mode', snapshot->>'mode',
          'planHash', snapshot->>'planHash',
          'status', snapshot->>'status',
          'createdAt', snapshot->>'createdAt'
        )
      END
    );
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS hubspot_apply_accounts (
    canopi_id TEXT PRIMARY KEY,
    patch JSONB NOT NULL
  ) ON COMMIT DROP;
  CREATE TEMP TABLE IF NOT EXISTS hubspot_apply_contacts (
    canopi_id TEXT PRIMARY KEY,
    patch JSONB NOT NULL
  ) ON COMMIT DROP;

  TRUNCATE TABLE hubspot_apply_accounts;
  TRUNCATE TABLE hubspot_apply_contacts;

  FOR account_record IN
    SELECT value
      FROM jsonb_array_elements(COALESCE(snapshot->'records'->'accounts', '[]'::jsonb)) AS value
  LOOP
    IF COALESCE(account_record->>'action', '') <> 'update' THEN
      accounts_skip := accounts_skip + 1;
      CONTINUE;
    END IF;

    current_row := NULL;
    SELECT to_jsonb(a)
      INTO current_row
      FROM public.accounts AS a
     WHERE a.id = account_record->>'canopiId'
     FOR UPDATE;

    IF current_row IS NULL THEN
      accounts_blocked := accounts_blocked + 1;
      blockers := array_append(blockers, format('Account inexistente no Canopi: %s.', account_record->>'canopiId'));
      CONTINUE;
    END IF;

    patch := '{}'::JSONB;
    has_conflict := false;

    FOREACH field_name IN ARRAY ARRAY['nome', 'dominio', 'vertical', 'segmento', 'porte', 'localizacao', 'ownerPrincipal', 'etapa']
    LOOP
      candidate := NULLIF(BTRIM(COALESCE(account_record->'fieldCandidates'->>field_name, '')), '');
      IF candidate IS NULL THEN
        CONTINUE;
      END IF;

      current_value := NULLIF(BTRIM(COALESCE(current_row->>field_name, '')), '');
      IF current_value IS NULL THEN
        patch := patch || jsonb_build_object(field_name, candidate);
      ELSIF current_value <> candidate THEN
        accounts_blocked := accounts_blocked + 1;
        blockers := array_append(blockers, format('Conflito em accounts.%s para %s.', field_name, account_record->>'canopiId'));
        has_conflict := true;
        EXIT;
      END IF;
    END LOOP;

    IF has_conflict THEN
      CONTINUE;
    END IF;

    IF patch = '{}'::JSONB THEN
      accounts_skip := accounts_skip + 1;
      CONTINUE;
    END IF;

    INSERT INTO hubspot_apply_accounts (canopi_id, patch)
    VALUES (account_record->>'canopiId', patch);
    accounts_applied := accounts_applied + 1;
  END LOOP;

  FOR contact_record IN
    SELECT value
      FROM jsonb_array_elements(COALESCE(snapshot->'records'->'contacts', '[]'::jsonb)) AS value
  LOOP
    IF COALESCE(contact_record->>'action', '') <> 'update' THEN
      contacts_skip := contacts_skip + 1;
      CONTINUE;
    END IF;

    current_row := NULL;
    SELECT to_jsonb(c)
      INTO current_row
      FROM public.contacts AS c
     WHERE c.id = contact_record->>'canopiId'
     FOR UPDATE;

    IF current_row IS NULL THEN
      contacts_blocked := contacts_blocked + 1;
      blockers := array_append(blockers, format('Contact inexistente no Canopi: %s.', contact_record->>'canopiId'));
      CONTINUE;
    END IF;

    patch := '{}'::JSONB;
    has_conflict := false;

    FOREACH field_name IN ARRAY ARRAY['accountId', 'accountName', 'nome', 'cargo', 'area', 'status']
    LOOP
      candidate := NULLIF(BTRIM(COALESCE(contact_record->'fieldCandidates'->>field_name, '')), '');
      IF candidate IS NULL THEN
        CONTINUE;
      END IF;

      current_value := NULLIF(BTRIM(COALESCE(current_row->>field_name, '')), '');
      IF current_value IS NULL THEN
        patch := patch || jsonb_build_object(field_name, candidate);
      ELSIF current_value <> candidate THEN
        contacts_blocked := contacts_blocked + 1;
        blockers := array_append(blockers, format('Conflito em contacts.%s para %s.', field_name, contact_record->>'canopiId'));
        has_conflict := true;
        EXIT;
      END IF;
    END LOOP;

    IF has_conflict THEN
      CONTINUE;
    END IF;

    IF patch = '{}'::JSONB THEN
      contacts_skip := contacts_skip + 1;
      CONTINUE;
    END IF;

    INSERT INTO hubspot_apply_contacts (canopi_id, patch)
    VALUES (contact_record->>'canopiId', patch);
    contacts_applied := contacts_applied + 1;
  END LOOP;

  IF array_length(blockers, 1) IS NOT NULL THEN
    counts_after := counts_before;
    RETURN public.hubspot_ingest_apply_build_result(
      'blocked',
      contract_id,
      approved_plan_hash,
      idempotency_key,
      false,
      false,
      contract_status_before,
      contract_status_before,
      jsonb_build_object(
        'accounts', jsonb_build_object('planned', COALESCE((snapshot->'summary'->'accounts'->>'planned')::INTEGER, 0), 'applied', 0, 'review', 0, 'blocked', accounts_blocked, 'skip', accounts_skip),
        'contacts', jsonb_build_object('planned', COALESCE((snapshot->'summary'->'contacts'->>'planned')::INTEGER, 0), 'applied', 0, 'review', 0, 'blocked', contacts_blocked, 'skip', contacts_skip)
      ),
      blockers,
      warnings,
      counts_before,
      counts_before,
      jsonb_build_object(
        'version', snapshot->>'version',
        'mode', snapshot->>'mode',
        'planHash', snapshot->>'planHash',
        'status', snapshot->>'status',
        'createdAt', snapshot->>'createdAt'
      )
    );
  END IF;

  FOR account_apply_row IN
    SELECT p.canopi_id, p.patch
      FROM hubspot_apply_accounts p
  LOOP
    UPDATE public.accounts
       SET "nome" = COALESCE(NULLIF(account_apply_row.patch->>'nome', ''), "nome"),
           "dominio" = COALESCE(NULLIF(account_apply_row.patch->>'dominio', ''), "dominio"),
           "vertical" = COALESCE(NULLIF(account_apply_row.patch->>'vertical', ''), "vertical"),
           "segmento" = COALESCE(NULLIF(account_apply_row.patch->>'segmento', ''), "segmento"),
           "porte" = COALESCE(NULLIF(account_apply_row.patch->>'porte', ''), "porte"),
           "localizacao" = COALESCE(NULLIF(account_apply_row.patch->>'localizacao', ''), "localizacao"),
           "ownerPrincipal" = COALESCE(NULLIF(account_apply_row.patch->>'ownerPrincipal', ''), "ownerPrincipal"),
           "etapa" = COALESCE(NULLIF(account_apply_row.patch->>'etapa', ''), "etapa")
     WHERE id = account_apply_row.canopi_id;
  END LOOP;

  FOR contact_apply_row IN
    SELECT p.canopi_id, p.patch
      FROM hubspot_apply_contacts p
  LOOP
    UPDATE public.contacts
       SET "accountId" = COALESCE(NULLIF(contact_apply_row.patch->>'accountId', ''), "accountId"),
           "accountName" = COALESCE(NULLIF(contact_apply_row.patch->>'accountName', ''), "accountName"),
           "nome" = COALESCE(NULLIF(contact_apply_row.patch->>'nome', ''), "nome"),
           "cargo" = COALESCE(NULLIF(contact_apply_row.patch->>'cargo', ''), "cargo"),
           "area" = COALESCE(NULLIF(contact_apply_row.patch->>'area', ''), "area"),
           "status" = COALESCE(NULLIF(contact_apply_row.patch->>'status', ''), "status")
     WHERE id = contact_apply_row.canopi_id;
  END LOOP;

  SELECT count(*)::INTEGER INTO counts_after_contracts FROM public.hubspot_ingest_contracts;
  SELECT count(*)::INTEGER INTO counts_after_accounts FROM public.accounts;
  SELECT count(*)::INTEGER INTO counts_after_contacts FROM public.contacts;

  counts_after := jsonb_build_object(
    'hubspot_ingest_contracts', counts_after_contracts,
    'accounts', counts_after_accounts,
    'contacts', counts_after_contacts
  );

  source_snapshot := jsonb_build_object(
    'version', snapshot->>'version',
    'mode', snapshot->>'mode',
    'planHash', snapshot->>'planHash',
    'status', snapshot->>'status',
    'createdAt', snapshot->>'createdAt'
  );

  final_summary := jsonb_build_object(
    'version', 'c2.9e.2b.2b',
    'mode', 'apply',
    'provider', 'hubspot',
    'contractId', contract_id,
    'approvedPlanHash', approved_plan_hash,
    'idempotencyKey', idempotency_key,
    'startedAt', snapshot->>'createdAt',
    'finishedAt', now(),
    'status', 'success',
    'persisted', true,
    'canonicalPersisted', true,
    'contractStatusBefore', contract_status_before,
    'contractStatusAfter', 'executed',
    'sourceSnapshot', source_snapshot,
    'countsBefore', counts_before,
    'countsAfter', counts_after,
    'summary', jsonb_build_object(
        'accounts', jsonb_build_object('planned', COALESCE((snapshot->'summary'->'accounts'->>'planned')::INTEGER, 0), 'applied', accounts_applied, 'review', 0, 'blocked', accounts_blocked, 'skip', accounts_skip),
        'contacts', jsonb_build_object('planned', COALESCE((snapshot->'summary'->'contacts'->>'planned')::INTEGER, 0), 'applied', contacts_applied, 'review', 0, 'blocked', contacts_blocked, 'skip', contacts_skip)
      ),
    'blockers', COALESCE(to_jsonb(blockers), '[]'::jsonb),
    'warnings', COALESCE(to_jsonb(warnings), '[]'::jsonb)
  );

  UPDATE public.hubspot_ingest_contracts
     SET status = 'executed',
         execution_summary = final_summary,
         updated_at = NOW()
   WHERE id = contract_id
     AND provider = 'hubspot';

  contract_status_after := 'executed';

  RETURN final_summary;
END;
$$;

REVOKE ALL ON FUNCTION public.hubspot_ingest_apply_build_result(
  TEXT,
  UUID,
  TEXT,
  TEXT,
  BOOLEAN,
  BOOLEAN,
  TEXT,
  TEXT,
  JSONB,
  TEXT[],
  TEXT[],
  JSONB,
  JSONB,
  JSONB
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.hubspot_ingest_apply_build_result(
  TEXT,
  UUID,
  TEXT,
  TEXT,
  BOOLEAN,
  BOOLEAN,
  TEXT,
  TEXT,
  JSONB,
  TEXT[],
  TEXT[],
  JSONB,
  JSONB,
  JSONB
) TO service_role;

REVOKE ALL ON FUNCTION public.apply_hubspot_ingest_contract(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_hubspot_ingest_contract(UUID, TEXT, TEXT) TO service_role;
