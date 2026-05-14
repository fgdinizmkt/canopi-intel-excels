import { getSupabaseAdminClient } from './supabaseAdmin';
import { getHubspotIngestContractById } from './hubspotIngestContractService';
import type {
  HubspotIngestApplyPreflightRecordResult,
  HubspotIngestApplyPreflightResult,
  HubspotIngestApplyPreflightSummarySection,
  HubspotIngestExecutionPlanRecord,
  HubspotIngestExecutionPlanSnapshotExecutionSummary,
  HubspotIngestContract,
} from '../hubspotIngestTypes';

const PROVIDER = 'hubspot';
const EXPECTED_CONTRACT_VERSION = 'c2.9e.2a';
const EXPECTED_SNAPSHOT_VERSION = 'c2.9e.2b.2a';
const EXPECTED_SNAPSHOT_MODE = 'execution_plan_snapshot';
const ACCOUNT_ALLOWED_FIELDS = ['nome', 'dominio', 'vertical', 'segmento', 'porte', 'localizacao', 'ownerPrincipal', 'etapa'] as const;
const CONTACT_ALLOWED_FIELDS = ['id', 'accountId', 'accountName', 'nome', 'cargo', 'area', 'status'] as const;
const CRITICAL_ACCOUNT_FIELDS = new Set(['dominio']);
const CRITICAL_CONTACT_FIELDS = new Set(['accountId', 'accountName']);

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function buildPreflightGuardrails(): string[] {
  return [
    'contractId, approvedPlanHash e idempotencyKey são obrigatórios.',
    'O snapshot é lido somente do banco; HubSpot não é consultado novamente.',
    'accounts e contacts são somente leitura neste sub-recorte.',
    'Campos críticos: accounts.dominio, contacts.accountId e contacts.accountName.',
    'Campos vazios, undefined ou nulos não geram overwrite.',
    'Ambiguidades, divergências de hash ou snapshot ausente bloqueiam o preflight.',
    'Resposta não expõe token, secrets, payload bruto ou .env.local.',
  ];
}

function buildEmptySection(planned: number): HubspotIngestApplyPreflightSummarySection {
  return {
    planned,
    readyToApply: 0,
    review: 0,
    blocked: 0,
    skip: 0,
  };
}

function extractSnapshot(contract: HubspotIngestContract): HubspotIngestExecutionPlanSnapshotExecutionSummary | null {
  const executionSummary = contract.executionSummary as HubspotIngestExecutionPlanSnapshotExecutionSummary | null;
  if (!executionSummary || typeof executionSummary !== 'object') return null;
  return executionSummary;
}

function normalizeCandidates(record: HubspotIngestExecutionPlanRecord): Record<string, string | null> {
  return Object.entries(record.fieldCandidates).reduce<Record<string, string | null>>((accumulator, [key, value]) => {
    const normalized = normalizeNullableString(value);
    if (normalized) {
      accumulator[key] = normalized;
    }
    return accumulator;
  }, {});
}

function summarizeRecordComparison(params: {
  record: HubspotIngestExecutionPlanRecord;
  existingRow: Record<string, string | null> | null;
  allowedFields: readonly string[];
  criticalFields: Set<string>;
}): HubspotIngestApplyPreflightRecordResult {
  const fieldCandidates = normalizeCandidates(params.record);
  const existingValues = params.allowedFields.reduce<Record<string, string | null>>((accumulator, field) => {
    const current = params.existingRow?.[field] ?? null;
    accumulator[field] = normalizeNullableString(current);
    return accumulator;
  }, {});

  const conflicts: string[] = [];
  const warnings: string[] = [];
  let status: HubspotIngestApplyPreflightRecordResult['status'] = 'ready_to_apply';

  for (const field of params.allowedFields) {
    const candidate = fieldCandidates[field] ?? null;
    const current = existingValues[field] ?? null;
    if (!candidate) {
      continue;
    }
    if (!current) {
      continue;
    }
    if (current === candidate) {
      continue;
    }
    if (params.criticalFields.has(field)) {
      conflicts.push(`Campo crítico ${field} divergente para ${params.record.canopiId}.`);
      status = 'blocked';
    } else {
      conflicts.push(`Campo ${field} divergente para ${params.record.canopiId}.`);
      if (status !== 'blocked') {
        status = 'review';
      }
    }
  }

  if (params.record.action === 'skip') {
    status = 'skip';
  } else if (params.record.action === 'review') {
    status = status === 'blocked' ? 'blocked' : 'review';
  }

  return {
    hubspotId: params.record.hubspotId,
    canopiId: params.record.canopiId,
    status,
    action: params.record.action,
    allowedFields: [...params.allowedFields],
    fieldCandidates,
    existingValues,
    conflicts,
    warnings,
  };
}

async function fetchCurrentRows() {
  const supabase = getSupabaseAdminClient();
  const [accounts, contacts] = await Promise.all([
    supabase.from('accounts').select('id, nome, dominio, vertical, segmento, porte, localizacao, ownerPrincipal, etapa'),
    supabase.from('contacts').select('id, accountId, accountName, nome, cargo, area, status'),
  ]);

  if (accounts.error || contacts.error) {
    throw new Error('READ_CURRENT_CANONICAL_STATE_FAILED');
  }

  return {
    accounts: new Map(
      (accounts.data ?? []).map((row) => {
        const value = row as Record<string, unknown> & { id: string };
        return [
          value.id,
          {
            nome: normalizeNullableString(value.nome),
            dominio: normalizeNullableString(value.dominio),
            vertical: normalizeNullableString(value.vertical),
            segmento: normalizeNullableString(value.segmento),
            porte: normalizeNullableString(value.porte),
            localizacao: normalizeNullableString(value.localizacao),
            ownerPrincipal: normalizeNullableString(value.ownerPrincipal),
            etapa: normalizeNullableString(value.etapa),
          },
        ] as const;
      }),
    ),
    contacts: new Map(
      (contacts.data ?? []).map((row) => {
        const value = row as Record<string, unknown> & { id: string };
        return [
          value.id,
          {
            id: normalizeNullableString(value.id),
            accountId: normalizeNullableString(value.accountId),
            accountName: normalizeNullableString(value.accountName),
            nome: normalizeNullableString(value.nome),
            cargo: normalizeNullableString(value.cargo),
            area: normalizeNullableString(value.area),
            status: normalizeNullableString(value.status),
          },
        ] as const;
      }),
    ),
  };
}

function buildSnapshotBlockers(params: {
  contract: HubspotIngestContract;
  snapshot: HubspotIngestExecutionPlanSnapshotExecutionSummary | null;
  approvedPlanHash: string;
  idempotencyKey: string;
}): string[] {
  const blockers: string[] = [];
  const snapshot = params.snapshot;
  const contract = params.contract;

  if (contract.provider !== PROVIDER) blockers.push('Contrato não pertence ao provider hubspot.');
  if (contract.status !== 'ready') blockers.push(`Contrato não está pronto para apply (status atual: ${contract.status}).`);
  if (contract.contractJson.version !== EXPECTED_CONTRACT_VERSION) blockers.push('contract_json.version divergente.');
  if (!snapshot) {
    blockers.push('execution_summary ausente.');
    return blockers;
  }
  if (snapshot.version !== EXPECTED_SNAPSHOT_VERSION) blockers.push('execution_summary.version divergente.');
  if (snapshot.mode !== EXPECTED_SNAPSHOT_MODE) blockers.push('execution_summary.mode divergente.');
  if (snapshot.status !== 'planned') blockers.push('execution_summary.status deve ser planned.');
  if (!snapshot.planHash || snapshot.planHash !== params.approvedPlanHash) blockers.push('approvedPlanHash não confere com o snapshot salvo.');
  if (snapshot.persisted || snapshot.canonicalPersisted) blockers.push('Snapshot já marcado como persistido.');
  if (!isUuidLike(params.idempotencyKey)) blockers.push('idempotencyKey deve ser um UUID válido.');
  if (snapshot.unresolved.ambiguousItems > 0) blockers.push('Há ambiguousItems no snapshot.');
  return blockers;
}

function buildWarnings(snapshot: HubspotIngestExecutionPlanSnapshotExecutionSummary): string[] {
  return [...snapshot.warnings].sort((left, right) => left.localeCompare(right));
}

export async function preflightHubspotIngestApply(params: {
  contractId: string;
  approvedPlanHash: string;
  idempotencyKey: string;
}): Promise<HubspotIngestApplyPreflightResult> {
  const normalizedContractId = params.contractId.trim();
  const normalizedHash = params.approvedPlanHash.trim();
  const normalizedIdempotencyKey = params.idempotencyKey.trim();

  if (!normalizedContractId || !isUuidLike(normalizedContractId)) {
    return {
      status: 'blocked',
      mode: 'apply_preflight',
      provider: PROVIDER,
      contractId: normalizedContractId,
      approvedPlanHash: normalizedHash,
      idempotencyKey: normalizedIdempotencyKey,
      canApply: false,
      wouldPersist: false,
      summary: {
        accounts: buildEmptySection(0),
        contacts: buildEmptySection(0),
      },
      conflicts: { accounts: [], contacts: [] },
      blockers: ['contractId deve ser uma string UUID válida.'],
      warnings: [],
      guardrails: buildPreflightGuardrails(),
      nextStep: 'apply_real_requires_transactional_boundary',
    };
  }

  if (!normalizedHash) {
    return {
      status: 'blocked',
      mode: 'apply_preflight',
      provider: PROVIDER,
      contractId: normalizedContractId,
      approvedPlanHash: normalizedHash,
      idempotencyKey: normalizedIdempotencyKey,
      canApply: false,
      wouldPersist: false,
      summary: {
        accounts: buildEmptySection(0),
        contacts: buildEmptySection(0),
      },
      conflicts: { accounts: [], contacts: [] },
      blockers: ['approvedPlanHash é obrigatório.'],
      warnings: [],
      guardrails: buildPreflightGuardrails(),
      nextStep: 'apply_real_requires_transactional_boundary',
    };
  }

  if (!normalizedIdempotencyKey || !isUuidLike(normalizedIdempotencyKey)) {
    return {
      status: 'blocked',
      mode: 'apply_preflight',
      provider: PROVIDER,
      contractId: normalizedContractId,
      approvedPlanHash: normalizedHash,
      idempotencyKey: normalizedIdempotencyKey,
      canApply: false,
      wouldPersist: false,
      summary: {
        accounts: buildEmptySection(0),
        contacts: buildEmptySection(0),
      },
      conflicts: { accounts: [], contacts: [] },
      blockers: ['idempotencyKey deve ser um UUID válido.'],
      warnings: [],
      guardrails: buildPreflightGuardrails(),
      nextStep: 'apply_real_requires_transactional_boundary',
    };
  }

  const contract = await getHubspotIngestContractById(normalizedContractId);
  if (!contract) {
    return {
      status: 'blocked',
      mode: 'apply_preflight',
      provider: PROVIDER,
      contractId: normalizedContractId,
      approvedPlanHash: normalizedHash,
      idempotencyKey: normalizedIdempotencyKey,
      canApply: false,
      wouldPersist: false,
      summary: {
        accounts: buildEmptySection(0),
        contacts: buildEmptySection(0),
      },
      conflicts: { accounts: [], contacts: [] },
      blockers: ['Contrato HubSpot não encontrado.'],
      warnings: [],
      guardrails: buildPreflightGuardrails(),
      nextStep: 'apply_real_requires_transactional_boundary',
    };
  }

  const snapshot = extractSnapshot(contract);
  const blockers = buildSnapshotBlockers({
    contract,
    snapshot,
    approvedPlanHash: normalizedHash,
    idempotencyKey: normalizedIdempotencyKey,
  });
  if (!snapshot || blockers.length > 0) {
    return {
      status: 'blocked',
      mode: 'apply_preflight',
      provider: PROVIDER,
      contractId: normalizedContractId,
      approvedPlanHash: normalizedHash,
      idempotencyKey: normalizedIdempotencyKey,
      canApply: false,
      wouldPersist: false,
      summary: {
        accounts: buildEmptySection(snapshot?.summary.accounts.planned ?? 0),
        contacts: buildEmptySection(snapshot?.summary.contacts.planned ?? 0),
      },
      conflicts: { accounts: [], contacts: [] },
      blockers,
      warnings: snapshot ? buildWarnings(snapshot) : [],
      guardrails: buildPreflightGuardrails(),
      nextStep: 'apply_real_requires_transactional_boundary',
    };
  }

  const { accounts: currentAccounts, contacts: currentContacts } = await fetchCurrentRows();
  const accountResults: HubspotIngestApplyPreflightRecordResult[] = [];
  const contactResults: HubspotIngestApplyPreflightRecordResult[] = [];
  let accountReady = 0;
  let accountReview = 0;
  let accountBlocked = 0;
  let accountSkip = 0;
  let contactReady = 0;
  let contactReview = 0;
  let contactBlocked = 0;
  let contactSkip = 0;

  for (const record of snapshot.records.accounts) {
    const existingRow = currentAccounts.get(record.canopiId) ?? null;
    const result = summarizeRecordComparison({
      record,
      existingRow,
      allowedFields: ACCOUNT_ALLOWED_FIELDS,
      criticalFields: CRITICAL_ACCOUNT_FIELDS,
    });
    accountResults.push(result);
    if (result.status === 'ready_to_apply') accountReady++;
    else if (result.status === 'review') accountReview++;
    else if (result.status === 'blocked') accountBlocked++;
    else accountSkip++;
  }

  for (const record of snapshot.records.contacts) {
    const existingRow = currentContacts.get(record.canopiId) ?? null;
    const result = summarizeRecordComparison({
      record,
      existingRow,
      allowedFields: CONTACT_ALLOWED_FIELDS,
      criticalFields: CRITICAL_CONTACT_FIELDS,
    });
    contactResults.push(result);
    if (result.status === 'ready_to_apply') contactReady++;
    else if (result.status === 'review') contactReview++;
    else if (result.status === 'blocked') contactBlocked++;
    else contactSkip++;
  }

  const finalBlockers: string[] = [...blockers];
  if (accountBlocked > 0 || contactBlocked > 0) {
    finalBlockers.push('Existem conflitos críticos bloqueando o apply futuro.');
  }

  return {
    status: finalBlockers.length > 0 ? 'blocked' : 'ready',
    mode: 'apply_preflight',
    provider: PROVIDER,
    contractId: normalizedContractId,
    approvedPlanHash: normalizedHash,
    idempotencyKey: normalizedIdempotencyKey,
    canApply: false,
    wouldPersist: false,
    summary: {
      accounts: {
        planned: snapshot.summary.accounts.planned,
        readyToApply: accountReady,
        review: accountReview,
        blocked: accountBlocked,
        skip: accountSkip,
      },
      contacts: {
        planned: snapshot.summary.contacts.planned,
        readyToApply: contactReady,
        review: contactReview,
        blocked: contactBlocked,
        skip: contactSkip,
      },
    },
    conflicts: {
      accounts: accountResults.filter((item) => item.status !== 'skip'),
      contacts: contactResults.filter((item) => item.status !== 'skip'),
    },
    blockers: finalBlockers,
    warnings: buildWarnings(snapshot),
    guardrails: buildPreflightGuardrails(),
    nextStep: 'apply_real_requires_transactional_boundary',
  };
}
