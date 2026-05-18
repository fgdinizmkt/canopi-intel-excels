import { getSupabaseAdminClient } from './supabaseAdmin';
import { getHubspotIngestContractById } from './hubspotIngestContractService';
import { listHubspotIdentityMappings } from './hubspotIdentityMappingService';
import type {
  HubspotIdentityMapping,
  HubspotIdentityMappingEntityType,
  HubspotIdentityMappingRecoveryClassification,
  HubspotIdentityMappingRecoveryDryRunResult,
  HubspotIdentityMappingRecoveryMatchSource,
  HubspotIdentityMappingRecoveryRecord,
  HubspotIdentityMappingRecoverySummarySection,
  HubspotIngestContract,
  HubspotIngestApplySourceSnapshot,
  HubspotIngestExecutionPlanRecord,
  HubspotIngestExecutionPlanSnapshotExecutionSummary,
} from '../hubspotIngestTypes';

const PROVIDER = 'hubspot';
const EXPECTED_SNAPSHOT_VERSION = 'c2.9e.2b.2a';
const EXPECTED_SNAPSHOT_MODE = 'execution_plan_snapshot';

type CanonicalAccountRow = {
  id: string;
  nome: string | null;
  dominio: string | null;
  vertical: string | null;
  segmento: string | null;
  porte: string | null;
  localizacao: string | null;
  ownerPrincipal: string | null;
  etapa: string | null;
};

type CanonicalContactRow = {
  id: string;
  accountId: string | null;
  accountName: string | null;
  nome: string | null;
  cargo: string | null;
  area: string | null;
  status: string | null;
};

type ResolvedSignal = {
  canonicalId: string;
  source: HubspotIdentityMappingRecoveryMatchSource;
  mappingId: string | null;
  compatible: boolean;
  rowExists: boolean;
  note: string | null;
};

const MATCH_SOURCE_PRIORITY: HubspotIdentityMappingRecoveryMatchSource[] = [
  'direct_canonical_id',
  'identity_mapping_canopi_external_id',
  'identity_mapping_hubspot_id',
  'heuristic_name_domain',
  'heuristic_account_anchor',
  'heuristic_contact_identity',
  'none',
];

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeKey(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeDomain(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = trimmed.includes('://') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return url.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split(/[/?#]/)[0]
      .trim()
      .toLowerCase() || null;
  }
}

function normalizeNullable(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') return String(value);
  return null;
}

function buildGuardrails(): string[] {
  return [
    'Dry-run somente leitura: não grava mappings, accounts, contacts ou execution_summary.',
    'Recuperação exata exige crosswalk persistido ou match canônico direto.',
    'Heurísticas nunca promovem um registro para resolved_exact.',
    'Contacts dependem de account mapping exato para ancoragem segura.',
    'Resposta não expõe token, secrets, payload bruto ou .env.local.',
  ];
}

function buildEmptySummarySection(total: number): HubspotIdentityMappingRecoverySummarySection {
  return {
    total,
    resolvedExact: 0,
    unresolved: 0,
    ambiguous: 0,
    unsafe: 0,
    missingRequiredFields: 0,
  };
}

function extractSnapshot(contract: HubspotIngestContract): HubspotIngestExecutionPlanSnapshotExecutionSummary | null {
  const executionSummary = contract.executionSummary as HubspotIngestExecutionPlanSnapshotExecutionSummary | null;
  if (!executionSummary || typeof executionSummary !== 'object') return null;
  return executionSummary;
}

function buildCurrentAccountRow(row: Record<string, unknown> & { id: string }): CanonicalAccountRow {
  return {
    id: row.id,
    nome: normalizeNullable(row.nome),
    dominio: normalizeNullable(row.dominio),
    vertical: normalizeNullable(row.vertical),
    segmento: normalizeNullable(row.segmento),
    porte: normalizeNullable(row.porte),
    localizacao: normalizeNullable(row.localizacao),
    ownerPrincipal: normalizeNullable(row.ownerPrincipal),
    etapa: normalizeNullable(row.etapa),
  };
}

function buildCurrentContactRow(row: Record<string, unknown> & { id: string }): CanonicalContactRow {
  return {
    id: row.id,
    accountId: normalizeNullable(row.accountId),
    accountName: normalizeNullable(row.accountName),
    nome: normalizeNullable(row.nome),
    cargo: normalizeNullable(row.cargo),
    area: normalizeNullable(row.area),
    status: normalizeNullable(row.status),
  };
}

async function loadCanonicalState(): Promise<{
  accounts: CanonicalAccountRow[];
  contacts: CanonicalContactRow[];
}> {
  const supabase = getSupabaseAdminClient();
  const [accountsResult, contactsResult] = await Promise.all([
    supabase.from('accounts').select('id, nome, dominio, vertical, segmento, porte, localizacao, ownerPrincipal, etapa'),
    supabase.from('contacts').select('id, accountId, accountName, nome, cargo, area, status'),
  ]);

  if (accountsResult.error || contactsResult.error) {
    throw new Error('READ_CANONICAL_STATE_FAILED');
  }

  return {
    accounts: (accountsResult.data ?? []).map((row) => buildCurrentAccountRow(row as Record<string, unknown> & { id: string })),
    contacts: (contactsResult.data ?? []).map((row) => buildCurrentContactRow(row as Record<string, unknown> & { id: string })),
  };
}

function indexById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row] as const));
}

function indexMappings(mappings: HubspotIdentityMapping[]): {
  byCanopiExternalId: Map<string, HubspotIdentityMapping[]>;
  byHubspotId: Map<string, HubspotIdentityMapping[]>;
} {
  const byCanopiExternalId = new Map<string, HubspotIdentityMapping[]>();
  const byHubspotId = new Map<string, HubspotIdentityMapping[]>();

  for (const mapping of mappings) {
    const externalBucket = byCanopiExternalId.get(mapping.canopiExternalId) ?? [];
    externalBucket.push(mapping);
    byCanopiExternalId.set(mapping.canopiExternalId, externalBucket);

    if (mapping.hubspotId) {
      const hubspotBucket = byHubspotId.get(mapping.hubspotId) ?? [];
      hubspotBucket.push(mapping);
      byHubspotId.set(mapping.hubspotId, hubspotBucket);
    }
  }

  return { byCanopiExternalId, byHubspotId };
}

function isMappingCompatibleWithContract(mapping: HubspotIdentityMapping, contractSourceConnectionId: string | null): boolean {
  if (!contractSourceConnectionId) {
    return true;
  }
  if (!mapping.sourceConnectionId) {
    return true;
  }
  return mapping.sourceConnectionId === contractSourceConnectionId;
}

function collectMappingSignals(params: {
  source: 'identity_mapping_canopi_external_id' | 'identity_mapping_hubspot_id';
  mappings: HubspotIdentityMapping[];
  currentRowById: Map<string, { id: string }>;
  contractSourceConnectionId: string | null;
}): ResolvedSignal[] {
  const signals: ResolvedSignal[] = [];
  const deduped = new Map<string, HubspotIdentityMapping>();
  for (const mapping of params.mappings) {
    deduped.set(mapping.id, mapping);
  }

  for (const mapping of deduped.values()) {
    const canonicalRowExists = params.currentRowById.has(mapping.canonicalId);
    const compatible = isMappingCompatibleWithContract(mapping, params.contractSourceConnectionId);

    signals.push({
      canonicalId: mapping.canonicalId,
      source: params.source,
      mappingId: mapping.id,
      compatible,
      rowExists: canonicalRowExists,
      note: !compatible
        ? 'source_connection_id incompatível com o contrato.'
        : !canonicalRowExists
          ? 'canonical_id do mapping não existe na tabela canônica.'
          : null,
    });
  }

  return signals;
}

function collectHeuristicAccountCandidates(
  record: HubspotIngestExecutionPlanRecord,
  accounts: CanonicalAccountRow[],
): CanonicalAccountRow[] {
  const normalizedName = normalizeKey(record.fieldCandidates.nome ?? null);
  const normalizedDomain = normalizeDomain(record.fieldCandidates.dominio ?? null);

  return accounts.filter((row) => {
    const rowName = normalizeKey(row.nome);
    const rowDomain = normalizeDomain(row.dominio);

    if (normalizedName && rowName !== normalizedName) {
      return false;
    }

    if (normalizedDomain && rowDomain !== normalizedDomain) {
      return false;
    }

    return Boolean(normalizedName || normalizedDomain);
  });
}

function collectHeuristicContactCandidates(params: {
  record: HubspotIngestExecutionPlanRecord;
  contacts: CanonicalContactRow[];
  anchorCanonicalAccountId: string | null;
}): CanonicalContactRow[] {
  const normalizedName = normalizeKey(params.record.fieldCandidates.nome ?? null);
  const normalizedCargo = normalizeKey(params.record.fieldCandidates.cargo ?? null);
  const normalizedArea = normalizeKey(params.record.fieldCandidates.area ?? null);
  const normalizedStatus = normalizeKey(params.record.fieldCandidates.status ?? null);
  const normalizedAccountName = normalizeKey(params.record.fieldCandidates.accountName ?? null);

  if (!params.anchorCanonicalAccountId) {
    return [];
  }

  return params.contacts.filter((row) => {
    if (row.accountId !== params.anchorCanonicalAccountId) {
      return false;
    }

    const rowName = normalizeKey(row.nome);
    const rowCargo = normalizeKey(row.cargo);
    const rowArea = normalizeKey(row.area);
    const rowStatus = normalizeKey(row.status);
    const rowAccountName = normalizeKey(row.accountName);

    if (normalizedName && rowName !== normalizedName) return false;
    if (normalizedCargo && rowCargo !== normalizedCargo) return false;
    if (normalizedArea && rowArea !== normalizedArea) return false;
    if (normalizedStatus && rowStatus !== normalizedStatus) return false;
    if (normalizedAccountName && rowAccountName !== normalizedAccountName) return false;

    return Boolean(normalizedName || normalizedCargo || normalizedArea || normalizedStatus || normalizedAccountName);
  });
}

function buildRecordSnapshotFields(record: HubspotIngestExecutionPlanRecord): Record<string, string | null> {
  return {
    ...record.fieldCandidates,
  };
}

function buildRecordResult(params: {
  entityType: HubspotIdentityMappingEntityType;
  record: HubspotIngestExecutionPlanRecord;
  classification: HubspotIdentityMappingRecoveryClassification;
  matchSource: HubspotIdentityMappingRecoveryMatchSource;
  canonicalId: string | null;
  mappingId: string | null;
  candidateCanonicalIds: string[];
  reasons: string[];
}): HubspotIdentityMappingRecoveryRecord {
  return {
    entityType: params.entityType,
    hubspotId: params.record.hubspotId,
    snapshotCanopiId: params.record.canopiId,
    canonicalId: params.canonicalId,
    classification: params.classification,
    matchSource: params.matchSource,
    mappingId: params.mappingId,
    candidateCanonicalIds: params.candidateCanonicalIds,
    reasons: params.reasons,
    snapshotFields: buildRecordSnapshotFields(params.record),
  };
}

function choosePreferredMatchSource(sources: HubspotIdentityMappingRecoveryMatchSource[]): HubspotIdentityMappingRecoveryMatchSource {
  for (const source of MATCH_SOURCE_PRIORITY) {
    if (sources.includes(source)) {
      return source;
    }
  }
  return 'none';
}

function summarizeRecords(records: HubspotIdentityMappingRecoveryRecord[]): HubspotIdentityMappingRecoverySummarySection {
  return records.reduce<HubspotIdentityMappingRecoverySummarySection>(
    (accumulator, record) => {
      accumulator.total += 1;
      if (record.classification === 'resolved_exact') accumulator.resolvedExact += 1;
      else if (record.classification === 'unresolved') accumulator.unresolved += 1;
      else if (record.classification === 'ambiguous') accumulator.ambiguous += 1;
      else if (record.classification === 'unsafe') accumulator.unsafe += 1;
      else if (record.classification === 'missing_required_fields') accumulator.missingRequiredFields += 1;
      return accumulator;
    },
    buildEmptySummarySection(0),
  );
}

function buildFailureResult(params: {
  contractId: string;
  blockers: string[];
  warnings: string[];
}): HubspotIdentityMappingRecoveryDryRunResult {
  const generatedAt = new Date().toISOString();
  const snapshot: HubspotIngestApplySourceSnapshot = {
    version: EXPECTED_SNAPSHOT_VERSION,
    mode: EXPECTED_SNAPSHOT_MODE,
    planHash: '',
    status: 'blocked',
  };

  return {
    status: 'blocked',
    mode: 'identity_mapping_recovery_dry_run',
    provider: PROVIDER,
    contractId: params.contractId,
    generatedAt,
    snapshot,
    summary: {
      accounts: buildEmptySummarySection(0),
      contacts: buildEmptySummarySection(0),
    },
    accounts: [],
    contacts: [],
    blockers: params.blockers,
    warnings: params.warnings,
    guardrails: buildGuardrails(),
  };
}

export async function dryRunHubspotIdentityMappingRecovery(contractId: string): Promise<HubspotIdentityMappingRecoveryDryRunResult> {
  const normalizedContractId = typeof contractId === 'string' ? contractId.trim() : '';
  if (!normalizedContractId || !isUuidLike(normalizedContractId)) {
    return buildFailureResult({
      contractId: normalizedContractId,
      blockers: ['contractId deve ser uma string UUID válida.'],
      warnings: [],
    });
  }

  try {
    const contract = await getHubspotIngestContractById(normalizedContractId);
    if (!contract) {
      return buildFailureResult({
        contractId: normalizedContractId,
        blockers: ['Contrato HubSpot não encontrado.'],
        warnings: [],
      });
    }

    if (contract.provider !== PROVIDER) {
      return buildFailureResult({
        contractId: normalizedContractId,
        blockers: ['Contrato não pertence ao provider hubspot.'],
        warnings: [],
      });
    }

    if (!contract.contractJson || contract.contractJson.version !== 'c2.9e.2a') {
      return buildFailureResult({
        contractId: normalizedContractId,
        blockers: ['contract_json.version divergente.'],
        warnings: [],
      });
    }

    const snapshot = extractSnapshot(contract);
    if (!snapshot) {
      return buildFailureResult({
        contractId: normalizedContractId,
        blockers: ['execution_summary ausente.'],
        warnings: [],
      });
    }

    if (snapshot.version !== EXPECTED_SNAPSHOT_VERSION || snapshot.mode !== EXPECTED_SNAPSHOT_MODE) {
      return buildFailureResult({
        contractId: normalizedContractId,
        blockers: ['execution_summary.version ou mode divergentes.'],
        warnings: snapshot.warnings ?? [],
      });
    }

    if (snapshot.status !== 'planned') {
      return buildFailureResult({
        contractId: normalizedContractId,
        blockers: ['execution_summary.status deve ser planned.'],
        warnings: snapshot.warnings ?? [],
      });
    }

    if (snapshot.persisted || snapshot.canonicalPersisted) {
      return buildFailureResult({
        contractId: normalizedContractId,
        blockers: ['Snapshot já marcado como persistido ou canonicalPersisted.'],
        warnings: snapshot.warnings ?? [],
      });
    }

    const [canonicalState, accountMappings, contactMappings] = await Promise.all([
      loadCanonicalState(),
      listHubspotIdentityMappings({ entityType: 'account' }),
      listHubspotIdentityMappings({ entityType: 'contact' }),
    ]);

    const accountRowsById = indexById(canonicalState.accounts);
    const contactRowsById = indexById(canonicalState.contacts);
    const accountMappingsIndexes = indexMappings(accountMappings);
    const contactMappingsIndexes = indexMappings(contactMappings);

    const exactAccountCanonicalIdByExternalId = new Map<string, string>();
    const accountRecords: HubspotIdentityMappingRecoveryRecord[] = [];
    const accountReasons: string[] = [];

    for (const record of snapshot.records.accounts) {
      const directRow = accountRowsById.get(record.canopiId);
      const exactSignals = [
        ...(directRow
          ? [{
              canonicalId: directRow.id,
              source: 'direct_canonical_id' as const,
              mappingId: null,
              compatible: true,
              rowExists: true,
              note: null,
            }]
          : []),
        ...collectMappingSignals({
          source: 'identity_mapping_canopi_external_id',
          mappings: accountMappingsIndexes.byCanopiExternalId.get(record.canopiId) ?? [],
          currentRowById: accountRowsById,
          contractSourceConnectionId: contract.sourceConnectionId,
        }),
        ...collectMappingSignals({
          source: 'identity_mapping_hubspot_id',
          mappings: accountMappingsIndexes.byHubspotId.get(record.hubspotId) ?? [],
          currentRowById: accountRowsById,
          contractSourceConnectionId: contract.sourceConnectionId,
        }),
      ];

      const exactCanonicalIds = [...new Set(exactSignals.map((signal) => signal.canonicalId))];
      const compatibleExactSignals = exactSignals.filter((signal) => signal.compatible && signal.rowExists);
      const incompatibleSignals = exactSignals.filter((signal) => !signal.compatible || !signal.rowExists);

      if (exactCanonicalIds.length === 1 && compatibleExactSignals.length > 0) {
        const canonicalId = exactCanonicalIds[0];
        exactAccountCanonicalIdByExternalId.set(record.canopiId, canonicalId);
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'resolved_exact',
            matchSource: choosePreferredMatchSource(compatibleExactSignals.map((signal) => signal.source)),
            canonicalId,
            mappingId: compatibleExactSignals.find((signal) => signal.mappingId)?.mappingId ?? null,
            candidateCanonicalIds: [canonicalId],
            reasons: [
              'Match exato resolvido sem heurística.',
              ...(compatibleExactSignals.some((signal) => signal.source === 'direct_canonical_id')
                ? ['ID canônico já coincide com o snapshot.']
                : ['Mapping ativo e compatível encontrado.']),
              ...incompatibleSignals
                .map((signal) => signal.note)
                .filter((note): note is string => Boolean(note)),
            ],
          }),
        );
        continue;
      }

      if (exactCanonicalIds.length > 1) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'ambiguous',
            matchSource: 'none',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: exactCanonicalIds,
            reasons: ['Mais de um canonical_id foi associado ao mesmo registro de snapshot.'],
          }),
        );
        continue;
      }

      if (exactCanonicalIds.length === 1 && compatibleExactSignals.length === 0) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'unsafe',
            matchSource: incompatibleSignals[0]?.source ?? 'none',
            canonicalId: exactCanonicalIds[0],
            mappingId: incompatibleSignals.find((signal) => signal.mappingId)?.mappingId ?? null,
            candidateCanonicalIds: exactCanonicalIds,
            reasons: [
              'Existe sinal de mapeamento, mas ele não é compatível com o contrato ou a linha canônica está ausente.',
              ...incompatibleSignals
                .map((signal) => signal.note)
                .filter((note): note is string => Boolean(note)),
            ],
          }),
        );
        continue;
      }

      const heuristicCandidates = collectHeuristicAccountCandidates(record, canonicalState.accounts);
      const heuristicCanonicalIds = heuristicCandidates.map((candidate) => candidate.id);
      const hasRequiredFields = Boolean(normalizeNullable(record.fieldCandidates.nome) && normalizeDomain(record.fieldCandidates.dominio ?? null));

      if (!hasRequiredFields) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'missing_required_fields',
            matchSource: 'none',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [],
            reasons: ['Nome e domínio são necessários para heurística de account.'],
          }),
        );
        continue;
      }

      if (heuristicCanonicalIds.length === 0) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'unresolved',
            matchSource: 'none',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [],
            reasons: ['Sem mapping persistido e sem candidato heurístico único para account.'],
          }),
        );
        continue;
      }

      if (heuristicCanonicalIds.length > 1) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'ambiguous',
            matchSource: 'heuristic_name_domain',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: heuristicCanonicalIds,
            reasons: ['Mais de um account atual bate com nome/domínio do snapshot.'],
          }),
        );
        continue;
      }

      accountRecords.push(
        buildRecordResult({
          entityType: 'account',
          record,
          classification: 'unsafe',
          matchSource: 'heuristic_name_domain',
          canonicalId: heuristicCanonicalIds[0],
          mappingId: null,
          candidateCanonicalIds: heuristicCanonicalIds,
          reasons: [
            'Recuperação heurística única encontrada, mas sem crosswalk persistido.',
            'Não promover para resolved_exact sem mapping salvo.',
          ],
        }),
      );
    }

    const contactRecords: HubspotIdentityMappingRecoveryRecord[] = [];
    for (const record of snapshot.records.contacts) {
      const directRow = contactRowsById.get(record.canopiId);
      const exactSignals = [
        ...(directRow
          ? [{
              canonicalId: directRow.id,
              source: 'direct_canonical_id' as const,
              mappingId: null,
              compatible: true,
              rowExists: true,
              note: null,
            }]
          : []),
        ...collectMappingSignals({
          source: 'identity_mapping_canopi_external_id',
          mappings: contactMappingsIndexes.byCanopiExternalId.get(record.canopiId) ?? [],
          currentRowById: contactRowsById,
          contractSourceConnectionId: contract.sourceConnectionId,
        }),
        ...collectMappingSignals({
          source: 'identity_mapping_hubspot_id',
          mappings: contactMappingsIndexes.byHubspotId.get(record.hubspotId) ?? [],
          currentRowById: contactRowsById,
          contractSourceConnectionId: contract.sourceConnectionId,
        }),
      ];

      const exactCanonicalIds = [...new Set(exactSignals.map((signal) => signal.canonicalId))];
      const compatibleExactSignals = exactSignals.filter((signal) => signal.compatible && signal.rowExists);
      const incompatibleSignals = exactSignals.filter((signal) => !signal.compatible || !signal.rowExists);

      if (exactCanonicalIds.length === 1 && compatibleExactSignals.length > 0) {
        const canonicalId = exactCanonicalIds[0];
        contactRecords.push(
          buildRecordResult({
            entityType: 'contact',
            record,
            classification: 'resolved_exact',
            matchSource: choosePreferredMatchSource(compatibleExactSignals.map((signal) => signal.source)),
            canonicalId,
            mappingId: compatibleExactSignals.find((signal) => signal.mappingId)?.mappingId ?? null,
            candidateCanonicalIds: [canonicalId],
            reasons: [
              'Match exato resolvido sem heurística.',
              ...(compatibleExactSignals.some((signal) => signal.source === 'direct_canonical_id')
                ? ['ID canônico já coincide com o snapshot.']
                : ['Mapping ativo e compatível encontrado.']),
              ...incompatibleSignals
                .map((signal) => signal.note)
                .filter((note): note is string => Boolean(note)),
            ],
          }),
        );
        continue;
      }

      if (exactCanonicalIds.length > 1) {
        contactRecords.push(
          buildRecordResult({
            entityType: 'contact',
            record,
            classification: 'ambiguous',
            matchSource: 'none',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: exactCanonicalIds,
            reasons: ['Mais de um canonical_id foi associado ao mesmo contato do snapshot.'],
          }),
        );
        continue;
      }

      if (exactCanonicalIds.length === 1 && compatibleExactSignals.length === 0) {
        contactRecords.push(
          buildRecordResult({
            entityType: 'contact',
            record,
            classification: 'unsafe',
            matchSource: incompatibleSignals[0]?.source ?? 'none',
            canonicalId: exactCanonicalIds[0],
            mappingId: incompatibleSignals.find((signal) => signal.mappingId)?.mappingId ?? null,
            candidateCanonicalIds: exactCanonicalIds,
            reasons: [
              'Existe sinal de mapeamento, mas ele não é compatível com o contrato ou a linha canônica está ausente.',
              ...incompatibleSignals
                .map((signal) => signal.note)
                .filter((note): note is string => Boolean(note)),
            ],
          }),
        );
        continue;
      }

      const anchorCanonicalId = exactAccountCanonicalIdByExternalId.get(record.fieldCandidates.accountId ?? '');
      if (!anchorCanonicalId) {
        contactRecords.push(
          buildRecordResult({
            entityType: 'contact',
            record,
            classification: 'unresolved',
            matchSource: 'none',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [],
            reasons: [
              'Account de origem não possui mapping exato resolvido; contato não pode ser ancorado com segurança.',
            ],
          }),
        );
        continue;
      }

      const heuristicCandidates = collectHeuristicContactCandidates({
        record,
        contacts: canonicalState.contacts,
        anchorCanonicalAccountId: anchorCanonicalId,
      });
      const heuristicCanonicalIds = heuristicCandidates.map((candidate) => candidate.id);
      const hasRequiredFields = Boolean(
        normalizeNullable(record.fieldCandidates.nome) &&
          normalizeNullable(record.fieldCandidates.accountId) &&
          normalizeNullable(record.fieldCandidates.accountName),
      );

      if (!hasRequiredFields) {
        contactRecords.push(
          buildRecordResult({
            entityType: 'contact',
            record,
            classification: 'missing_required_fields',
            matchSource: 'none',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [],
            reasons: ['Nome, accountId e accountName são necessários para heurística de contact.'],
          }),
        );
        continue;
      }

      if (heuristicCanonicalIds.length === 0) {
        contactRecords.push(
          buildRecordResult({
            entityType: 'contact',
            record,
            classification: 'unresolved',
            matchSource: 'heuristic_contact_identity',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [],
            reasons: ['Anchor resolvido, mas nenhum contato atual bateu de forma única.'],
          }),
        );
        continue;
      }

      if (heuristicCanonicalIds.length > 1) {
        contactRecords.push(
          buildRecordResult({
            entityType: 'contact',
            record,
            classification: 'ambiguous',
            matchSource: 'heuristic_contact_identity',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: heuristicCanonicalIds,
            reasons: ['Mais de um contato atual bate com o mesmo anchor e identidade heurística.'],
          }),
        );
        continue;
      }

      contactRecords.push(
        buildRecordResult({
          entityType: 'contact',
          record,
          classification: 'unsafe',
          matchSource: 'heuristic_contact_identity',
          canonicalId: heuristicCanonicalIds[0],
          mappingId: null,
          candidateCanonicalIds: heuristicCanonicalIds,
          reasons: [
            'Recuperação heurística única encontrada, mas sem crosswalk persistido para contato.',
            'Não promover para resolved_exact sem mapping salvo.',
          ],
        }),
      );
    }

    const accountsSummary = summarizeRecords(accountRecords);
    const contactsSummary = summarizeRecords(contactRecords);
    const blockers: string[] = [];
    const warnings = [...snapshot.warnings];

    if (accountRecords.length === 0) {
      warnings.push('Nenhuma account do snapshot pôde ser avaliada. Verifique se o crosswalk de accounts está disponível.');
    }
    if (contactRecords.length === 0) {
      warnings.push('Nenhum contact do snapshot pôde ser avaliado. Verifique se o crosswalk de contacts está disponível.');
    }
    if (accountsSummary.resolvedExact === 0 && contactsSummary.resolvedExact === 0) {
      warnings.push('Não houve recuperação exata via mapping persistido ou canonical_id direto.');
    }
    if (accountMappings.length === 0 && contactMappings.length === 0) {
      warnings.push('Tabela hubspot_identity_mappings está vazia; o dry-run operou apenas com heurísticas.');
    }

    return {
      status: 'success',
      mode: 'identity_mapping_recovery_dry_run',
      provider: PROVIDER,
      contractId: contract.id,
      generatedAt: new Date().toISOString(),
      snapshot: {
        version: snapshot.version,
        mode: snapshot.mode,
        planHash: snapshot.planHash ?? '',
        status: snapshot.status,
        createdAt: snapshot.createdAt,
      },
      summary: {
        accounts: accountsSummary,
        contacts: contactsSummary,
      },
      accounts: accountRecords,
      contacts: contactRecords,
      blockers,
      warnings: warnings.sort((left, right) => left.localeCompare(right)),
      guardrails: buildGuardrails(),
    };
  } catch {
    return buildFailureResult({
      contractId: normalizedContractId,
      blockers: ['Não foi possível executar o dry-run de recuperação de mappings no momento.'],
      warnings: [],
    });
  }
}
