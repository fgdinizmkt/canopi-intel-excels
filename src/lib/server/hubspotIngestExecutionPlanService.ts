import { createHash } from 'node:crypto';
import { dryRunHubspotIngestExecution } from './hubspotIngestExecuteService';
import {
  getHubspotIngestContractById,
  updateHubspotIngestContractExecutionSummary,
} from './hubspotIngestContractService';
import type {
  HubspotIngestExecutionPlanRecord,
  HubspotIngestExecutionPlanSnapshotExecutionSummary,
  HubspotIngestObjectType,
} from '../hubspotIngestTypes';

const PROVIDER = 'hubspot';
const PLAN_VERSION = 'c2.9e.2b.2a';
const PLAN_MODE = 'execution_plan_snapshot';
const OUT_OF_SCOPE_OBJECTS: HubspotIngestObjectType[] = ['deals', 'leads', 'campaigns', 'properties', 'associations'];
const ACCOUNT_ALLOWED_FIELDS = ['nome', 'dominio', 'vertical', 'segmento', 'porte', 'localizacao', 'ownerPrincipal', 'etapa'];
const CONTACT_ALLOWED_FIELDS = ['id', 'accountId', 'accountName', 'nome', 'cargo', 'area', 'status'];
const HUBSPOT_SEARCH_LIMIT = 100;

type HubspotSearchPageRecord = {
  id?: string | number;
  createdAt?: string;
  updatedAt?: string;
  properties?: Record<string, unknown>;
  associations?: Record<string, unknown>;
};

type HubspotSearchResponse = {
  total?: number;
  results?: HubspotSearchPageRecord[];
  paging?: {
    next?: {
      after?: string;
    };
  };
};

type HubspotSearchResult = {
  ok: boolean;
  status: number;
  errorMessage: string | null;
  total: number | null;
  nextAfter: string | null;
  results: Array<{
    id: string;
    createdAt: string | null;
    updatedAt: string | null;
    properties: Record<string, string | null>;
  }>;
};

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

function sanitizeHubspotError(status: number, label: string): string {
  if (status === 400) return `Token inválido ou malformado ao consultar ${label}.`;
  if (status === 401 || status === 403) return `Token sem permissão para consultar ${label}.`;
  if (status === 404) return `${label} não está disponível nesta conta.`;
  if (status === 429) return `HubSpot atingiu limite temporário ao consultar ${label}.`;
  if (status >= 500) return `HubSpot indisponível no momento ao consultar ${label}.`;
  return `Não foi possível consultar ${label}.`;
}

function readHubspotToken(): string | null {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim() ?? '';
  return token.length > 0 ? token : null;
}

function compactCandidates(candidates: Record<string, string | null>): Record<string, string | null> {
  return Object.fromEntries(
    Object.entries(candidates).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
  ) as Record<string, string | null>;
}

function extractHostname(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = trimmed.includes('://') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    return url.hostname.replace(/^www\./i, '').trim() || null;
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]?.trim() || null;
  }
}

function joinLocation(parts: Array<string | null>): string | null {
  const filtered = parts.filter((part): part is string => Boolean(part && part.trim()));
  return filtered.length > 0 ? filtered.join(', ') : null;
}

function normalizeSortKey(value: string | null): string {
  return value ? value.toLowerCase() : '';
}

function stableSortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stableSortValue(item));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = stableSortValue((value as Record<string, unknown>)[key]);
        return accumulator;
      }, {});
  }
  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableSortValue(value));
}

function hashPlan(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

async function fetchHubspotSearchPage(params: {
  token: string;
  objectType: 'companies' | 'contacts';
  after?: string | null;
  properties: string[];
  propertyName: string;
  operator: 'HAS_PROPERTY' | 'NOT_HAS_PROPERTY';
  limit?: number;
}): Promise<HubspotSearchResult> {
  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/${params.objectType}/search`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.token}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: params.propertyName,
              operator: params.operator,
            },
          ],
        },
      ],
      after: params.after ?? undefined,
      limit: params.limit ?? HUBSPOT_SEARCH_LIMIT,
      properties: params.properties,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorMessage: sanitizeHubspotError(response.status, params.objectType),
      total: null,
      nextAfter: null,
      results: [],
    };
  }

  const payload = (await response.json().catch(() => null)) as HubspotSearchResponse | null;
  const results = Array.isArray(payload?.results)
    ? payload.results.map((item) => ({
        id: readString(item.id) ?? '',
        createdAt: readString(item.createdAt),
        updatedAt: readString(item.updatedAt),
        properties: Object.entries(item.properties ?? {}).reduce<Record<string, string | null>>((accumulator, [key, value]) => {
          accumulator[key] = readString(value);
          return accumulator;
        }, {}),
      })).filter((item) => Boolean(item.id))
    : [];

  return {
    ok: true,
    status: 200,
    errorMessage: null,
    total: typeof payload?.total === 'number' ? payload.total : null,
    nextAfter: payload?.paging?.next?.after ? String(payload.paging.next.after) : null,
    results,
  };
}

async function fetchAllHubspotObjects(params: {
  token: string;
  objectType: 'companies' | 'contacts';
  propertyName: string;
  operator: 'HAS_PROPERTY' | 'NOT_HAS_PROPERTY';
  properties: string[];
}): Promise<HubspotSearchResult> {
  const combined: HubspotSearchResult = {
    ok: true,
    status: 200,
    errorMessage: null,
    total: null,
    nextAfter: null,
    results: [],
  };

  let after: string | null = null;
  do {
    const page = await fetchHubspotSearchPage({
      token: params.token,
      objectType: params.objectType,
      after,
      propertyName: params.propertyName,
      operator: params.operator,
      properties: params.properties,
    });

    if (!page.ok) {
      return page;
    }

    if (combined.total === null) {
      combined.total = page.total;
    }
    combined.results.push(...page.results);

    after = page.nextAfter;
  } while (after);

  return combined;
}

function buildCompanyFieldCandidates(record: HubspotSearchResult['results'][number]): Record<string, string | null> {
  const domain = record.properties.domain ?? extractHostname(record.properties.website);
  const companyName = record.properties.name ?? domain ?? `Empresa ${record.id}`;
  return compactCandidates({
    nome: companyName,
    dominio: domain,
    vertical: record.properties.industry,
    segmento: null,
    porte: record.properties.numberofemployees,
    localizacao: joinLocation([record.properties.city, record.properties.state, record.properties.country]),
    ownerPrincipal: record.properties.hubspot_owner_id,
    etapa: record.properties.lifecyclestage,
  });
}

function buildContactFieldCandidates(params: {
  record: HubspotSearchResult['results'][number];
  companyByHubspotId: Map<string, { canopiId: string; name: string }>;
}): {
  fieldCandidates: Record<string, string | null>;
  conflicts: string[];
  warnings: string[];
} {
  const { record, companyByHubspotId } = params;
  const firstname = record.properties.firstname;
  const lastname = record.properties.lastname;
  const email = record.properties.email;
  const jobtitle = record.properties.jobtitle;
  const department = record.properties.department;
  const lifecycleStage = record.properties.lifecyclestage ?? record.properties.hs_lead_status;
  const associatedHubspotCompanyId = record.properties.associatedcompanyid;
  const associatedCompany = associatedHubspotCompanyId ? companyByHubspotId.get(associatedHubspotCompanyId) ?? null : null;
  const resolvedName = [firstname, lastname].filter(Boolean).join(' ').trim() || email || `Contato ${record.id}`;
  const conflicts: string[] = [];
  const warnings: string[] = [];

  if (associatedHubspotCompanyId && !associatedCompany) {
    conflicts.push('Empresa associada do HubSpot não resolvida para accountId/accountName.');
  } else if (!associatedHubspotCompanyId) {
    conflicts.push('associatedcompanyid ausente no contato.');
  }

  if (!firstname && !lastname && !email) {
    warnings.push('Nome do contato derivado de fallback para manter o snapshot executável.');
  }

  return {
    fieldCandidates: compactCandidates({
      accountId: associatedCompany?.canopiId ?? null,
      accountName: associatedCompany?.name ?? null,
      nome: resolvedName,
      cargo: jobtitle,
      area: department,
      status: lifecycleStage,
    }),
    conflicts,
    warnings,
  };
}

function buildRecordWarnings(fieldCandidates: Record<string, string | null>, allowedFields: string[], missingLabel: string): string[] {
  const warnings: string[] = [];
  for (const field of allowedFields) {
    if (!(field in fieldCandidates)) {
      continue;
    }
    if (!fieldCandidates[field]) {
      warnings.push(`${missingLabel} sem candidato para ${field}.`);
    }
  }
  return warnings;
}

function buildBlockedSnapshot(params: {
  contractId: string;
  blockers: string[];
  warnings: string[];
  summary?: HubspotIngestExecutionPlanSnapshotExecutionSummary['summary'];
}): HubspotIngestExecutionPlanSnapshotExecutionSummary {
  const createdAt = new Date().toISOString();
  return {
    version: PLAN_VERSION,
    mode: PLAN_MODE,
    provider: PROVIDER,
    contractId: params.contractId,
    planHash: null,
    createdAt,
    status: 'blocked',
    persisted: false,
    canPersist: false,
    canonicalPersisted: false,
    summary: params.summary ?? {
      accounts: {
        planned: 0,
        update: 0,
        review: 0,
        create: 0,
        skip: 0,
      },
      contacts: {
        planned: 0,
        update: 0,
        review: 0,
        create: 0,
        skip: 0,
      },
    },
    records: {
      accounts: [],
      contacts: [],
    },
    unresolved: {
      companiesOutsideCanopi: 0,
      contactsWithoutCanopiId: 0,
      ambiguousItems: 0,
    },
    outOfScope: OUT_OF_SCOPE_OBJECTS,
    guardrails: buildGuardrails(),
    blockers: params.blockers,
    warnings: params.warnings,
  };
}

function buildGuardrails(): string[] {
  return [
    'contractId obrigatório; nenhum fallback para último contrato.',
    'Contrato lido somente no servidor por id e provider hubspot.',
    'Payload bruto do CRM e chaves proibidas são rejeitados.',
    'Token não é aceito no payload e não é persistido.',
    'Nenhuma escrita em accounts ou contacts nesta etapa.',
    'Somente execution_summary é atualizado nesta rota.',
    'contract_json e status permanecem inalterados.',
    'Deals, Leads, Campaigns, Properties e Associations permanecem fora do primeiro recorte.',
    'AmbiguousItems bloqueiam a materialização do snapshot.',
    'Resposta não expõe segredo, payload bruto ou .env.local.',
    'planHash exclui timestamps e deriva apenas do snapshot determinístico.',
  ];
}

function buildSnapshotBasis(snapshot: HubspotIngestExecutionPlanSnapshotExecutionSummary): unknown {
  return {
    version: snapshot.version,
    mode: snapshot.mode,
    provider: snapshot.provider,
    contractId: snapshot.contractId,
    status: snapshot.status,
    summary: snapshot.summary,
    records: snapshot.records,
    unresolved: snapshot.unresolved,
    outOfScope: snapshot.outOfScope,
    blockers: snapshot.blockers,
    warnings: snapshot.warnings,
  };
}

function buildPlanResult(params: {
  contractId: string;
  dryRun: Awaited<ReturnType<typeof dryRunHubspotIngestExecution>>;
  companyRecords: HubspotSearchResult['results'];
  contactRecords: HubspotSearchResult['results'];
  companyWarnings: string[];
  contactWarnings: string[];
}): HubspotIngestExecutionPlanSnapshotExecutionSummary {
  const plannedCompanyCount = params.companyRecords.length;
  const plannedContactCount = params.contactRecords.length;
  const summary = {
    accounts: {
      planned: params.dryRun.plan.accounts.totalPlanned ?? plannedCompanyCount,
      update: plannedCompanyCount,
      review: params.dryRun.plan.accounts.review,
      create: 0,
      skip: 0,
    },
    contacts: {
      planned: params.dryRun.plan.contacts.totalPlanned ?? plannedContactCount,
      update: plannedContactCount,
      review: params.dryRun.plan.contacts.review,
      create: 0,
      skip: 0,
    },
  };

  const companyMap = new Map<string, { canopiId: string; name: string }>();
  for (const record of params.companyRecords) {
    const canopiId = record.properties.canopi_company_id;
    const name = record.properties.name ?? record.properties.domain ?? `Empresa ${record.id}`;
    if (canopiId) {
      companyMap.set(record.id, {
        canopiId,
        name,
      });
    }
  }

  const accounts: HubspotIngestExecutionPlanRecord[] = [];
  for (const record of params.companyRecords) {
    const canopiId = record.properties.canopi_company_id;
    if (!canopiId) continue;
    const fieldCandidates = buildCompanyFieldCandidates(record);
    const warnings = buildRecordWarnings(fieldCandidates, ACCOUNT_ALLOWED_FIELDS, `Company ${record.id}`);
    accounts.push({
      hubspotId: record.id,
      canopiId,
      action: 'update',
      allowedFields: ACCOUNT_ALLOWED_FIELDS,
      fieldCandidates,
      conflicts: [],
      warnings: warnings.slice(0, 5),
    });
  }
  accounts.sort((left, right) => normalizeSortKey(left.canopiId).localeCompare(normalizeSortKey(right.canopiId)));

  const contacts: HubspotIngestExecutionPlanRecord[] = [];
  for (const record of params.contactRecords) {
    const canopiId = record.properties.canopi_contact_id;
    if (!canopiId) continue;
    const { fieldCandidates, conflicts, warnings } = buildContactFieldCandidates({
      record,
      companyByHubspotId: companyMap,
    });
    const fieldWarnings = buildRecordWarnings(fieldCandidates, CONTACT_ALLOWED_FIELDS, `Contact ${record.id}`);
    contacts.push({
      hubspotId: record.id,
      canopiId,
      action: 'update',
      allowedFields: CONTACT_ALLOWED_FIELDS,
      fieldCandidates,
      conflicts,
      warnings: [...warnings, ...fieldWarnings].slice(0, 5),
    });
  }
  contacts.sort((left, right) => normalizeSortKey(left.canopiId).localeCompare(normalizeSortKey(right.canopiId)));

  const planSnapshot: HubspotIngestExecutionPlanSnapshotExecutionSummary = {
    version: PLAN_VERSION,
    mode: PLAN_MODE,
    provider: PROVIDER,
    contractId: params.contractId,
    planHash: null,
    createdAt: new Date().toISOString(),
    status: 'planned',
    persisted: false,
    canPersist: false,
    canonicalPersisted: false,
    summary,
    records: {
      accounts,
      contacts,
    },
    unresolved: {
      companiesOutsideCanopi: params.dryRun.unresolved.companiesOutsideCanopi,
      contactsWithoutCanopiId: params.dryRun.unresolved.contactsWithoutCanopiId,
      ambiguousItems: params.dryRun.unresolved.ambiguousItems,
    },
    outOfScope: [...OUT_OF_SCOPE_OBJECTS],
    guardrails: buildGuardrails(),
    blockers: [],
    warnings: [
      ...params.dryRun.warnings,
      ...(params.companyWarnings.length > 0 ? params.companyWarnings : []),
      ...(params.contactWarnings.length > 0 ? params.contactWarnings : []),
    ].sort((left, right) => left.localeCompare(right)),
  };

  planSnapshot.planHash = hashPlan(buildSnapshotBasis(planSnapshot));
  return planSnapshot;
}

async function fetchSnapshotRecords(params: {
  token: string;
  dryRun: Awaited<ReturnType<typeof dryRunHubspotIngestExecution>>;
}): Promise<{
  companyRecords: HubspotSearchResult['results'];
  contactRecords: HubspotSearchResult['results'];
  blockers: string[];
  companyWarnings: string[];
  contactWarnings: string[];
}> {
  const companyFetch = await fetchAllHubspotObjects({
    token: params.token,
    objectType: 'companies',
    propertyName: 'canopi_company_id',
    operator: 'HAS_PROPERTY',
    properties: ['hs_object_id', 'name', 'domain', 'website', 'industry', 'city', 'state', 'country', 'numberofemployees', 'hubspot_owner_id', 'lifecyclestage', 'canopi_company_id'],
  });

  if (!companyFetch.ok) {
    return {
      companyRecords: [],
      contactRecords: [],
      blockers: [companyFetch.errorMessage || 'Não foi possível consultar Companies no HubSpot.'],
      companyWarnings: [],
      contactWarnings: [],
    };
  }

  const contactFetch = await fetchAllHubspotObjects({
    token: params.token,
    objectType: 'contacts',
    propertyName: 'canopi_contact_id',
    operator: 'HAS_PROPERTY',
    properties: ['hs_object_id', 'email', 'firstname', 'lastname', 'jobtitle', 'department', 'lifecyclestage', 'hs_lead_status', 'associatedcompanyid', 'canopi_contact_id'],
  });

  if (!contactFetch.ok) {
    return {
      companyRecords: [],
      contactRecords: [],
      blockers: [contactFetch.errorMessage || 'Não foi possível consultar Contacts no HubSpot.'],
      companyWarnings: [],
      contactWarnings: [],
    };
  }

  const companyRecords = companyFetch.results.filter((record) => Boolean(record.properties.canopi_company_id));
  const contactRecords = contactFetch.results.filter((record) => Boolean(record.properties.canopi_contact_id));

  const blockers: string[] = [];
  if (companyFetch.total !== null && companyFetch.total !== params.dryRun.summary.companiesPlannedUpdate) {
    blockers.push(`Total de Companies com canopi_company_id divergente do dry-run (` +
      `${companyFetch.total} vs ${params.dryRun.summary.companiesPlannedUpdate}).`);
  }
  if (contactFetch.total !== null && contactFetch.total !== params.dryRun.summary.contactsPlannedUpdate) {
    blockers.push(`Total de Contacts com canopi_contact_id divergente do dry-run (` +
      `${contactFetch.total} vs ${params.dryRun.summary.contactsPlannedUpdate}).`);
  }
  if (companyRecords.length !== params.dryRun.summary.companiesPlannedUpdate) {
    blockers.push(`Quantidade materializada de Companies divergente do dry-run (${companyRecords.length} vs ${params.dryRun.summary.companiesPlannedUpdate}).`);
  }
  if (contactRecords.length !== params.dryRun.summary.contactsPlannedUpdate) {
    blockers.push(`Quantidade materializada de Contacts divergente do dry-run (${contactRecords.length} vs ${params.dryRun.summary.contactsPlannedUpdate}).`);
  }

  const companyWarnings: string[] = [];
  const contactWarnings: string[] = [];
  for (const record of companyRecords) {
    if (!record.properties.name && !record.properties.domain && !record.properties.website) {
      companyWarnings.push(`Company ${record.id} sem nome, domínio ou website. Nome será resolvido por fallback.`);
    }
  }
  for (const record of contactRecords) {
    if (!record.properties.firstname && !record.properties.lastname && !record.properties.email) {
      contactWarnings.push(`Contact ${record.id} sem nome ou e-mail. Nome será resolvido por fallback.`);
    }
  }

  return {
    companyRecords,
    contactRecords,
    blockers,
    companyWarnings: companyWarnings.sort((left, right) => left.localeCompare(right)),
    contactWarnings: contactWarnings.sort((left, right) => left.localeCompare(right)),
  };
}

export async function materializeHubspotIngestExecutionPlan(contractId: string): Promise<HubspotIngestExecutionPlanSnapshotExecutionSummary> {
  try {
    const normalizedContractId = typeof contractId === 'string' ? contractId.trim() : '';
    if (!normalizedContractId || !isUuidLike(normalizedContractId)) {
      return buildBlockedSnapshot({
        contractId: normalizedContractId,
        blockers: ['contractId deve ser uma string UUID válida.'],
        warnings: [],
      });
    }

    const dryRun = await dryRunHubspotIngestExecution(normalizedContractId);
    if (dryRun.status === 'blocked') {
      return buildBlockedSnapshot({
        contractId: normalizedContractId,
        blockers: dryRun.blockers.length > 0 ? dryRun.blockers : ['Contrato HubSpot não está pronto para materializar o snapshot.'],
        warnings: dryRun.warnings,
        summary: {
          accounts: {
            planned: dryRun.plan.accounts.totalPlanned ?? 0,
            update: dryRun.plan.accounts.update,
            review: dryRun.plan.accounts.review,
            create: dryRun.plan.accounts.create,
            skip: dryRun.plan.accounts.skip,
          },
          contacts: {
            planned: dryRun.plan.contacts.totalPlanned ?? 0,
            update: dryRun.plan.contacts.update,
            review: dryRun.plan.contacts.review,
            create: dryRun.plan.contacts.create,
            skip: dryRun.plan.contacts.skip,
          },
        },
      });
    }

    const contract = await getHubspotIngestContractById(normalizedContractId);
    if (!contract) {
      return buildBlockedSnapshot({
        contractId: normalizedContractId,
        blockers: ['Contrato HubSpot não encontrado.'],
        warnings: [],
      });
    }

    const token = readHubspotToken();
    if (!token) {
      return buildBlockedSnapshot({
        contractId: normalizedContractId,
        blockers: ['HUBSPOT_PRIVATE_APP_TOKEN não configurado no ambiente do servidor.'],
        warnings: dryRun.warnings,
        summary: {
          accounts: {
            planned: dryRun.plan.accounts.totalPlanned ?? 0,
            update: dryRun.plan.accounts.update,
            review: dryRun.plan.accounts.review,
            create: dryRun.plan.accounts.create,
            skip: dryRun.plan.accounts.skip,
          },
          contacts: {
            planned: dryRun.plan.contacts.totalPlanned ?? 0,
            update: dryRun.plan.contacts.update,
            review: dryRun.plan.contacts.review,
            create: dryRun.plan.contacts.create,
            skip: dryRun.plan.contacts.skip,
          },
        },
      });
    }

    const fetched = await fetchSnapshotRecords({
      token,
      dryRun,
    });

    if (fetched.blockers.length > 0) {
      return buildBlockedSnapshot({
        contractId: normalizedContractId,
        blockers: fetched.blockers,
        warnings: [...dryRun.warnings, ...fetched.companyWarnings, ...fetched.contactWarnings],
        summary: {
          accounts: {
            planned: dryRun.plan.accounts.totalPlanned ?? 0,
            update: dryRun.plan.accounts.update,
            review: dryRun.plan.accounts.review,
            create: dryRun.plan.accounts.create,
            skip: dryRun.plan.accounts.skip,
          },
          contacts: {
            planned: dryRun.plan.contacts.totalPlanned ?? 0,
            update: dryRun.plan.contacts.update,
            review: dryRun.plan.contacts.review,
            create: dryRun.plan.contacts.create,
            skip: dryRun.plan.contacts.skip,
          },
        },
      });
    }

    const plan = buildPlanResult({
      contractId: contract.id,
      dryRun,
      companyRecords: fetched.companyRecords,
      contactRecords: fetched.contactRecords,
      companyWarnings: fetched.companyWarnings,
      contactWarnings: fetched.contactWarnings,
    });

    await updateHubspotIngestContractExecutionSummary({
      contractId: contract.id,
      executionSummary: plan,
    });

    return plan;
  } catch {
    return buildBlockedSnapshot({
      contractId: typeof contractId === 'string' ? contractId.trim() : '',
      blockers: ['Não foi possível materializar o snapshot de execução no momento.'],
      warnings: [],
    });
  }
}
