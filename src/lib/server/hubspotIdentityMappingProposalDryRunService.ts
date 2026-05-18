import { getSupabaseAdminClient } from './supabaseAdmin';
import { getHubspotIngestContractById } from './hubspotIngestContractService';
import { listHubspotIdentityMappings } from './hubspotIdentityMappingService';
import type {
  HubspotIdentityMapping,
  HubspotIdentityMappingEntityType,
  HubspotIdentityMappingProposalClassification,
  HubspotIdentityMappingProposalDryRunResult,
  HubspotIdentityMappingProposalMatchSource,
  HubspotIdentityMappingProposalRecord,
  HubspotIdentityMappingProposalSummarySection,
  HubspotIngestApplySourceSnapshot,
  HubspotIngestContract,
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
};

type ProposalSignal = {
  canonicalId: string;
  source: HubspotIdentityMappingProposalMatchSource;
  mappingId: string | null;
  compatible: boolean;
  rowExists: boolean;
  note: string | null;
};

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeNullable(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return null;
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

function extractSnapshot(contract: HubspotIngestContract): HubspotIngestExecutionPlanSnapshotExecutionSummary | null {
  const executionSummary = contract.executionSummary as unknown as HubspotIngestExecutionPlanSnapshotExecutionSummary | null;
  if (!executionSummary || typeof executionSummary !== 'object') return null;
  return executionSummary;
}

function buildGuardrails(): string[] {
  return [
    'Dry-run somente leitura: não grava mappings, accounts, contacts ou execution_summary.',
    'proposed_exact exige vínculo canônico exato ou mapping persistido compatível.',
    'proposed_strong é apenas candidato forte; não é persistência automática.',
    'Contacts continuam em diagnóstico agregado e dependem de account anchor resolvido.',
    'Resposta não expõe token, secrets, payload bruto ou .env.local.',
  ];
}

function buildEmptySummarySection(total: number): HubspotIdentityMappingProposalSummarySection {
  return {
    total,
    proposedExact: 0,
    proposedStrong: 0,
    ambiguous: 0,
    unresolved: 0,
    unsafe: 0,
    missingRequiredFields: 0,
  };
}

function buildFailureResult(params: {
  contractId: string;
  blockers: string[];
  warnings: string[];
}): HubspotIdentityMappingProposalDryRunResult {
  const snapshot: HubspotIngestApplySourceSnapshot = {
    version: EXPECTED_SNAPSHOT_VERSION,
    mode: EXPECTED_SNAPSHOT_MODE,
    planHash: '',
    status: 'blocked',
  };

  return {
    status: 'blocked',
    mode: 'identity_mapping_proposal_dry_run',
    provider: PROVIDER,
    contractId: params.contractId,
    generatedAt: new Date().toISOString(),
    snapshot,
    summary: {
      accounts: buildEmptySummarySection(0),
      contacts: {
        total: 0,
        dependentOnUnresolvedAccount: 0,
        evaluableIfAccountsResolved: 0,
        missingRequiredFields: 0,
        blockers: [],
      },
    },
    accounts: [],
    blockers: params.blockers,
    warnings: params.warnings,
    guardrails: buildGuardrails(),
  };
}

async function withRetry<T>(factory: () => Promise<T>, attempts = 3, baseDelayMs = 750): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await factory();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('READ_RETRY_FAILED');
}

function buildCurrentAccountRow(row: Record<string, unknown> & { id: string }): CanonicalAccountRow {
  return {
    id: row.id,
    nome: normalizeNullable(row.nome),
    dominio: normalizeNullable(row.dominio),
  };
}

function indexById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((row) => [row.id, row] as const));
}

function indexAccountsByNormalizedFields(rows: CanonicalAccountRow[]): {
  byComposite: Map<string, CanonicalAccountRow[]>;
  byName: Map<string, CanonicalAccountRow[]>;
  byDomain: Map<string, CanonicalAccountRow[]>;
} {
  const byComposite = new Map<string, CanonicalAccountRow[]>();
  const byName = new Map<string, CanonicalAccountRow[]>();
  const byDomain = new Map<string, CanonicalAccountRow[]>();

  for (const row of rows) {
    const normalizedName = normalizeKey(row.nome);
    const normalizedDomain = normalizeDomain(row.dominio);

    if (normalizedName) {
      const bucket = byName.get(normalizedName) ?? [];
      bucket.push(row);
      byName.set(normalizedName, bucket);
    }

    if (normalizedDomain) {
      const bucket = byDomain.get(normalizedDomain) ?? [];
      bucket.push(row);
      byDomain.set(normalizedDomain, bucket);
    }

    if (normalizedName && normalizedDomain) {
      const key = `${normalizedName}||${normalizedDomain}`;
      const bucket = byComposite.get(key) ?? [];
      bucket.push(row);
      byComposite.set(key, bucket);
    }
  }

  return { byComposite, byName, byDomain };
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
  if (!contractSourceConnectionId) return true;
  if (!mapping.sourceConnectionId) return true;
  return mapping.sourceConnectionId === contractSourceConnectionId;
}

function collectExactSignals(params: {
  source: 'identity_mapping_canopi_external_id' | 'identity_mapping_hubspot_id';
  mappings: HubspotIdentityMapping[];
  currentRowById: Map<string, { id: string }>;
  contractSourceConnectionId: string | null;
}): ProposalSignal[] {
  const signals: ProposalSignal[] = [];
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

function choosePreferredMatchSource(sources: HubspotIdentityMappingProposalMatchSource[]): HubspotIdentityMappingProposalMatchSource {
  const priority: HubspotIdentityMappingProposalMatchSource[] = [
    'direct_canonical_id',
    'identity_mapping_canopi_external_id',
    'identity_mapping_hubspot_id',
    'heuristic_name_domain',
    'heuristic_name_only',
    'heuristic_domain_only',
    'none',
  ];

  for (const source of priority) {
    if (sources.includes(source)) {
      return source;
    }
  }

  return 'none';
}

function buildRecordResult(params: {
  entityType: HubspotIdentityMappingEntityType;
  record: HubspotIngestExecutionPlanRecord;
  classification: HubspotIdentityMappingProposalClassification;
  matchSource: HubspotIdentityMappingProposalMatchSource;
  canonicalId: string | null;
  mappingId: string | null;
  candidateCanonicalIds: string[];
  reasons: string[];
}): HubspotIdentityMappingProposalRecord {
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
    snapshotFields: { ...params.record.fieldCandidates },
  };
}

function summarizeRecords(records: HubspotIdentityMappingProposalRecord[]): HubspotIdentityMappingProposalSummarySection {
  return records.reduce<HubspotIdentityMappingProposalSummarySection>(
    (accumulator, record) => {
      accumulator.total += 1;
      if (record.classification === 'proposed_exact') accumulator.proposedExact += 1;
      else if (record.classification === 'proposed_strong') accumulator.proposedStrong += 1;
      else if (record.classification === 'ambiguous') accumulator.ambiguous += 1;
      else if (record.classification === 'unresolved') accumulator.unresolved += 1;
      else if (record.classification === 'unsafe') accumulator.unsafe += 1;
      else if (record.classification === 'missing_required_fields') accumulator.missingRequiredFields += 1;
      return accumulator;
    },
    buildEmptySummarySection(0),
  );
}

async function loadCanonicalAccounts(): Promise<CanonicalAccountRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('id, nome, dominio');

  if (error) {
    throw new Error('READ_CANONICAL_ACCOUNTS_FAILED');
  }

  return (data ?? []).map((row) => buildCurrentAccountRow(row as Record<string, unknown> & { id: string }));
}

function collectAccountHeuristicCandidates(
  record: HubspotIngestExecutionPlanRecord,
  indexes: ReturnType<typeof indexAccountsByNormalizedFields>,
): {
  normalizedName: string | null;
  normalizedDomain: string | null;
  nameCandidates: CanonicalAccountRow[];
  domainCandidates: CanonicalAccountRow[];
  compositeCandidates: CanonicalAccountRow[];
} {
  const normalizedName = normalizeKey(record.fieldCandidates.nome ?? null);
  const normalizedDomain = normalizeDomain(record.fieldCandidates.dominio ?? null);
  const nameCandidates = normalizedName ? indexes.byName.get(normalizedName) ?? [] : [];
  const domainCandidates = normalizedDomain ? indexes.byDomain.get(normalizedDomain) ?? [] : [];
  const compositeCandidates = normalizedName && normalizedDomain ? indexes.byComposite.get(`${normalizedName}||${normalizedDomain}`) ?? [] : [];

  return {
    normalizedName,
    normalizedDomain,
    nameCandidates,
    domainCandidates,
    compositeCandidates,
  };
}

function buildContactDependencySummary(params: {
  contactRecords: HubspotIngestExecutionPlanRecord[];
  accountProposalByExternalId: Map<string, HubspotIdentityMappingProposalRecord>;
}): HubspotIdentityMappingProposalDryRunResult['summary']['contacts'] {
  let dependentOnUnresolvedAccount = 0;
  let evaluableIfAccountsResolved = 0;
  let missingRequiredFields = 0;
  const blockers = new Set<string>();

  for (const record of params.contactRecords) {
    const hasRequiredFields = Boolean(
      normalizeNullable(record.fieldCandidates.nome) &&
        normalizeNullable(record.fieldCandidates.accountId) &&
        normalizeNullable(record.fieldCandidates.accountName),
    );

    if (!hasRequiredFields) {
      missingRequiredFields += 1;
      blockers.add('Há contacts sem nome/accountId/accountName suficientes para avaliação futura.');
      continue;
    }

    const anchorExternalId = normalizeNullable(record.fieldCandidates.accountId);
    const anchorProposal = anchorExternalId ? params.accountProposalByExternalId.get(anchorExternalId) ?? null : null;

    if (anchorProposal && (anchorProposal.classification === 'proposed_exact' || anchorProposal.classification === 'proposed_strong')) {
      evaluableIfAccountsResolved += 1;
    } else {
      dependentOnUnresolvedAccount += 1;
      blockers.add('Contacts dependem de account anchor resolvido antes de qualquer tentativa de avaliação individual.');
    }
  }

  return {
    total: params.contactRecords.length,
    dependentOnUnresolvedAccount,
    evaluableIfAccountsResolved,
    missingRequiredFields,
    blockers: [...blockers].sort((left, right) => left.localeCompare(right)),
  };
}

export async function dryRunHubspotIdentityMappingProposal(contractId: string): Promise<HubspotIdentityMappingProposalDryRunResult> {
  const normalizedContractId = typeof contractId === 'string' ? contractId.trim() : '';
  if (!normalizedContractId || !isUuidLike(normalizedContractId)) {
    return buildFailureResult({
      contractId: normalizedContractId,
      blockers: ['contractId deve ser uma string UUID válida.'],
      warnings: [],
    });
  }

  try {
    const contract = await withRetry(() => getHubspotIngestContractById(normalizedContractId));
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

    const [canonicalAccounts, accountMappings] = await Promise.all([
      withRetry(() => loadCanonicalAccounts()),
      withRetry(() => listHubspotIdentityMappings({ entityType: 'account' })),
    ]);

    const accountRowsById = indexById(canonicalAccounts);
    const accountIndexes = indexAccountsByNormalizedFields(canonicalAccounts);
    const accountMappingsIndexes = indexMappings(accountMappings);

    const accountProposalByExternalId = new Map<string, HubspotIdentityMappingProposalRecord>();
    const accountRecords: HubspotIdentityMappingProposalRecord[] = [];
    const unresolvedReasons = new Map<string, number>();

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
        ...collectExactSignals({
          source: 'identity_mapping_canopi_external_id',
          mappings: accountMappingsIndexes.byCanopiExternalId.get(record.canopiId) ?? [],
          currentRowById: accountRowsById,
          contractSourceConnectionId: contract.sourceConnectionId,
        }),
        ...collectExactSignals({
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
        const recordResult = buildRecordResult({
          entityType: 'account',
          record,
          classification: 'proposed_exact',
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
        });
        accountProposalByExternalId.set(record.canopiId, recordResult);
        accountRecords.push(recordResult);
        continue;
      }

      if (exactCanonicalIds.length > 1) {
        const recordResult = buildRecordResult({
          entityType: 'account',
          record,
          classification: 'ambiguous',
          matchSource: 'none',
          canonicalId: null,
          mappingId: null,
          candidateCanonicalIds: exactCanonicalIds,
          reasons: ['Mais de um canonical_id foi associado ao mesmo registro de snapshot.'],
        });
        accountRecords.push(recordResult);
        unresolvedReasons.set('ambiguous_exact', (unresolvedReasons.get('ambiguous_exact') ?? 0) + 1);
        continue;
      }

      if (exactCanonicalIds.length === 1 && compatibleExactSignals.length === 0) {
        const recordResult = buildRecordResult({
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
        });
        accountRecords.push(recordResult);
        unresolvedReasons.set('unsafe_exact', (unresolvedReasons.get('unsafe_exact') ?? 0) + 1);
        continue;
      }

      const { normalizedName, normalizedDomain, nameCandidates, domainCandidates, compositeCandidates } = collectAccountHeuristicCandidates(
        record,
        accountIndexes,
      );

      const nameCandidateIds = [...new Set(nameCandidates.map((candidate) => candidate.id))];
      const domainCandidateIds = [...new Set(domainCandidates.map((candidate) => candidate.id))];

      if (!normalizedName || !normalizedDomain) {
        const missingFields: string[] = [];
        if (!normalizedName) missingFields.push('nome');
        if (!normalizedDomain) missingFields.push('domínio');
        const recordResult = buildRecordResult({
          entityType: 'account',
          record,
          classification: 'missing_required_fields',
          matchSource: 'none',
          canonicalId: null,
          mappingId: null,
          candidateCanonicalIds: [],
          reasons: [`Campos mínimos ausentes para proposta segura: ${missingFields.join(' e ')}.`],
        });
        accountRecords.push(recordResult);
        unresolvedReasons.set('missing_required_fields', (unresolvedReasons.get('missing_required_fields') ?? 0) + 1);
        continue;
      }

      if (compositeCandidates.length === 1) {
        const canonicalId = compositeCandidates[0].id;
        const recordResult = buildRecordResult({
          entityType: 'account',
          record,
          classification: 'proposed_strong',
          matchSource: 'heuristic_name_domain',
          canonicalId,
          mappingId: null,
          candidateCanonicalIds: [canonicalId],
          reasons: ['Nome e domínio normalizados apontaram para um único account canônico.'],
        });
        accountProposalByExternalId.set(record.canopiId, recordResult);
        accountRecords.push(recordResult);
        continue;
      }

      if (compositeCandidates.length > 1) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'ambiguous',
            matchSource: 'heuristic_name_domain',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: compositeCandidates.map((candidate) => candidate.id),
            reasons: ['Mais de um account canônico corresponde ao mesmo par nome+domínio normalizados.'],
          }),
        );
        unresolvedReasons.set('ambiguous_composite', (unresolvedReasons.get('ambiguous_composite') ?? 0) + 1);
        continue;
      }

      const nameAndDomainIntersection = new Set(nameCandidateIds.filter((candidateId) => domainCandidateIds.includes(candidateId)));
      const intersectionIds = [...nameAndDomainIntersection];

      if (intersectionIds.length > 1) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'ambiguous',
            matchSource: 'heuristic_name_domain',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: intersectionIds,
            reasons: ['Mais de um account canônico permanece plausível após cruzar nome e domínio normalizados.'],
          }),
        );
        unresolvedReasons.set('ambiguous_intersection', (unresolvedReasons.get('ambiguous_intersection') ?? 0) + 1);
        continue;
      }

      if (nameCandidateIds.length === 1 && domainCandidateIds.length === 1 && nameCandidateIds[0] !== domainCandidateIds[0]) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'unsafe',
            matchSource: 'heuristic_name_domain',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [...new Set([...nameCandidateIds, ...domainCandidateIds])],
            reasons: [
              'Nome normalizado e domínio normalizado apontam para accounts diferentes.',
              'Recuperação automática seria insegura sem mapping persistido.',
            ],
          }),
        );
        unresolvedReasons.set('unsafe_divergent_signals', (unresolvedReasons.get('unsafe_divergent_signals') ?? 0) + 1);
        continue;
      }

      if (nameCandidateIds.length === 1 || domainCandidateIds.length === 1) {
        const reason = nameCandidateIds.length === 1
          ? 'Nome normalizado aponta para um único account, mas o domínio não confirmou o mesmo candidato.'
          : 'Domínio normalizado aponta para um único account, mas o nome não confirmou o mesmo candidato.';

        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'unsafe',
            matchSource: nameCandidateIds.length === 1 ? 'heuristic_name_only' : 'heuristic_domain_only',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [...new Set([...nameCandidateIds, ...domainCandidateIds])],
            reasons: [
              reason,
              'Sinal único é forte demais para persistência automática sem crosswalk.',
            ],
          }),
        );
        unresolvedReasons.set('unsafe_single_signal', (unresolvedReasons.get('unsafe_single_signal') ?? 0) + 1);
        continue;
      }

      if (nameCandidateIds.length > 1 || domainCandidateIds.length > 1) {
        accountRecords.push(
          buildRecordResult({
            entityType: 'account',
            record,
            classification: 'ambiguous',
            matchSource: nameCandidateIds.length > 1 ? 'heuristic_name_only' : 'heuristic_domain_only',
            canonicalId: null,
            mappingId: null,
            candidateCanonicalIds: [...new Set([...nameCandidateIds, ...domainCandidateIds])],
            reasons: ['Mais de um candidato apareceu ao analisar nome e/ou domínio normalizados.'],
          }),
        );
        unresolvedReasons.set('ambiguous_single_signal', (unresolvedReasons.get('ambiguous_single_signal') ?? 0) + 1);
        continue;
      }

      accountRecords.push(
        buildRecordResult({
          entityType: 'account',
          record,
          classification: 'unresolved',
          matchSource: 'none',
          canonicalId: null,
          mappingId: null,
          candidateCanonicalIds: [],
          reasons: [
            'Nenhum candidato seguro apareceu por nome+domínio normalizados.',
            'Pode haver divergência de normalização, ausência de domínio ou mudança de nome.',
          ],
        }),
      );
      unresolvedReasons.set('unresolved_no_candidate', (unresolvedReasons.get('unresolved_no_candidate') ?? 0) + 1);
    }

    const accountsSummary = summarizeRecords(accountRecords);
    const contactsSummary = buildContactDependencySummary({
      contactRecords: snapshot.records.contacts,
      accountProposalByExternalId,
    });
    const blockers: string[] = [];
    const warnings = [...snapshot.warnings];

    if (accountsSummary.proposedExact === 0 && accountsSummary.proposedStrong === 0) {
      warnings.push('Não houve recuperação exata nem proposta forte para accounts.');
    }
    if (accountMappings.length === 0) {
      warnings.push('Tabela hubspot_identity_mappings está vazia; a proposta operou só com leitura canônica e heurísticas.');
    }
    if (accountsSummary.ambiguous > 0) {
      warnings.push('Há accounts ambíguas e elas precisam de revisão manual antes de qualquer persistência de mapping.');
    }
    if (accountsSummary.unresolved > 0) {
      warnings.push('Há accounts sem proposta segura; revisar ausência de domínio, divergência de nome ou falta de match canônico.');
    }
    if (contactsSummary.dependentOnUnresolvedAccount > 0) {
      warnings.push('Contacts continuam dependentes de account anchor resolvido antes de qualquer avaliação individual.');
    }
    if (contactsSummary.missingRequiredFields > 0) {
      warnings.push('Há contacts com campos mínimos ausentes para avaliação futura.');
    }

    if (unresolvedReasons.size > 0) {
      warnings.push(
        `Diagnóstico accounts: ${[...unresolvedReasons.entries()]
          .map(([reason, count]) => `${reason}=${count}`)
          .join(', ')}`,
      );
    }

    return {
      status: 'success',
      mode: 'identity_mapping_proposal_dry_run',
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
      blockers,
      warnings: warnings.sort((left, right) => left.localeCompare(right)),
      guardrails: buildGuardrails(),
    };
  } catch {
    return buildFailureResult({
      contractId: normalizedContractId,
      blockers: ['Não foi possível executar a proposta de recuperação de mappings no momento.'],
      warnings: [],
    });
  }
}
