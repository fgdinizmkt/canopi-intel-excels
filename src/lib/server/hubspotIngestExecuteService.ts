import { getHubspotIngestContractById } from './hubspotIngestContractService';
import type {
  HubspotIngestContract,
  HubspotIngestExecutionOutOfScopeItem,
  HubspotIngestExecutionPlanSection,
  HubspotIngestExecutionResult,
  HubspotIngestObjectSelection,
} from '../hubspotIngestTypes';

const PROVIDER = 'hubspot';
const CANONICAL_OBJECTS = new Set(['companies', 'contacts']);
const OUT_OF_SCOPE_OBJECTS = ['deals', 'leads', 'campaigns', 'properties', 'associations'] as const;
const ACCOUNT_FIELDS = ['nome', 'dominio', 'vertical', 'segmento', 'porte', 'localizacao', 'ownerPrincipal', 'etapa'];
const CONTACT_FIELDS = ['id', 'accountId', 'accountName', 'nome', 'cargo', 'area', 'status'];

function asCount(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeObjectSelection(selection: HubspotIngestObjectSelection[]): HubspotIngestObjectSelection[] {
  return Array.isArray(selection) ? selection : [];
}

function buildOutOfScopeItem(reason: string): HubspotIngestExecutionOutOfScopeItem {
  return {
    included: false,
    action: 'skip',
    reason,
  };
}

function buildPlanSection(params: {
  totalPlanned: number | null;
  create: number;
  update: number;
  skip: number;
  review: number;
  allowedFields: string[];
  notes: string;
}): HubspotIngestExecutionPlanSection {
  return {
    totalPlanned: params.totalPlanned,
    create: params.create,
    update: params.update,
    skip: params.skip,
    review: params.review,
    allowedFields: params.allowedFields,
    notes: params.notes,
  };
}

function buildBlockers(contract: HubspotIngestContract): string[] {
  const blockers: string[] = [];
  const contractJson = contract.contractJson;
  const selectedObjects = normalizeObjectSelection(contractJson.selectedObjects);

  if (contract.provider !== PROVIDER) {
    blockers.push('Contrato não pertence ao provider hubspot.');
  }

  if (contract.status !== 'ready') {
    blockers.push(`Contrato não está pronto para execução dry-run (status atual: ${contract.status}).`);
  }

  if (contractJson.canonicalTargets?.companies !== 'accounts' || contractJson.canonicalTargets?.contacts !== 'contacts') {
    blockers.push('canonicalTargets precisa apontar para accounts e contacts.');
  }

  const selectedCanonical = selectedObjects.filter((item) => item.selected);
  const selectedObjectTypes = new Set(selectedCanonical.map((item) => item.objectType));
  if (!selectedObjectTypes.has('companies') || !selectedObjectTypes.has('contacts')) {
    blockers.push('Companies e Contacts precisam estar selecionados como alvos canônicos.');
  }

  const selectedOutsideCanonical = selectedCanonical.filter((item) => !CANONICAL_OBJECTS.has(item.objectType));
  if (selectedOutsideCanonical.length > 0) {
    blockers.push('O contrato não pode incluir Deals, Leads, Campaigns, Properties ou Associations como alvo de escrita.');
  }

  if (contractJson.ambiguousItems.length > 0) {
    blockers.push('Há ambiguousItems no contrato e nenhuma política de resolução foi declarada para esta execução.');
  }

  const selectedObjectsValid = selectedObjects.length > 0 && selectedObjects.every((item) => item.objectType);
  if (!selectedObjectsValid) {
    blockers.push('selectedObjects inválido ou ausente.');
  }

  return blockers;
}

function buildWarnings(contract: HubspotIngestContract): string[] {
  const warnings: string[] = [];
  const contractJson = contract.contractJson;
  const dryRunSummary = contract.dryRunSummary;

  if (dryRunSummary.warnings.length > 0) {
    warnings.push(...dryRunSummary.warnings);
  }

  if (contractJson.unresolvedItems.length > 0) {
    warnings.push(`${contractJson.unresolvedItems.length} item(ns) unresolved mantidos para revisão.`);
  }

  if (dryRunSummary.companiesWithoutCanopiId && dryRunSummary.companiesWithoutCanopiId > 0) {
    warnings.push(`${dryRunSummary.companiesWithoutCanopiId} Companies fora da Canopi permanecem em revisão.`);
  }

  if (dryRunSummary.contactsWithoutCanopiId && dryRunSummary.contactsWithoutCanopiId > 0) {
    warnings.push(`${dryRunSummary.contactsWithoutCanopiId} Contacts sem canopi_contact_id permanecem em backlog.`);
  }

  return warnings;
}

function buildPlan(contract: HubspotIngestContract) {
  const summary = contract.dryRunSummary;
  const resolvedCompanies = contract.contractJson.resolvedItems.find((item) => item.objectType === 'companies');
  const resolvedContacts = contract.contractJson.resolvedItems.find((item) => item.objectType === 'contacts');

  const companyTotal = asCount(resolvedCompanies?.totalHubspotCount ?? summary.companiesHubspotCount);
  const companyUpdate = asCount(resolvedCompanies?.canopiTaggedCount ?? summary.companiesCanopiCount);
  const companyReview = asCount(resolvedCompanies?.outsideCanopiCount ?? summary.companiesWithoutCanopiId);
  const contactTotal = asCount(resolvedContacts?.totalHubspotCount ?? summary.contactsHubspotCount);
  const contactUpdate = asCount(resolvedContacts?.canopiTaggedCount ?? summary.contactsCanopiCount);
  const contactReview = asCount(resolvedContacts?.outsideCanopiCount ?? summary.contactsWithoutCanopiId);

  return {
    accounts: buildPlanSection({
      totalPlanned: companyTotal,
      create: 0,
      update: companyUpdate,
      skip: 0,
      review: companyReview,
      allowedFields: ACCOUNT_FIELDS,
      notes: 'Somente Companies/tagged entram como candidatos a atualização canônica; Companies fora da Canopi seguem para revisão.',
    }),
    contacts: buildPlanSection({
      totalPlanned: contactTotal,
      create: 0,
      update: contactUpdate,
      skip: 0,
      review: contactReview,
      allowedFields: CONTACT_FIELDS,
      notes: 'Somente Contacts/tagged entram como candidatos a atualização canônica; Contacts sem canopi_contact_id seguem para revisão.',
    }),
  };
}

function buildOutOfScope(): HubspotIngestExecutionResult['outOfScope'] {
  const item = (reason: string) => buildOutOfScopeItem(reason);
  return {
    deals: item('Fora do primeiro recorte canônico.'),
    leads: item('Fora do primeiro recorte canônico.'),
    campaigns: item('Fora do primeiro recorte canônico.'),
    properties: item('Fora do primeiro recorte canônico.'),
    associations: item('Fora do primeiro recorte canônico.'),
  };
}

function buildGuardrails(): string[] {
  return [
    'contractId obrigatório; nenhum fallback para último contrato.',
    'Contrato lido somente no servidor por id e provider hubspot.',
    'Payload bruto do CRM não é aceito nesta rota.',
    'Token não é aceito no payload e não é persistido.',
    'Nenhuma escrita em accounts ou contacts nesta etapa.',
    'Deals, Leads, Campaigns, Properties e Associations permanecem fora do primeiro recorte.',
    'AmbiguousItems bloqueiam execução até existir política explícita de resolução.',
    'Resposta é determinística e não expõe segredo, payload bruto ou .env.local.',
    'canPersist permanece false neste sub-recorte.',
  ];
}

function buildSummary(contract: HubspotIngestContract): HubspotIngestExecutionResult['summary'] {
  return {
    companiesTotal: contract.dryRunSummary.companiesHubspotCount,
    contactsTotal: contract.dryRunSummary.contactsHubspotCount,
    companiesPlannedUpdate: asCount(contract.dryRunSummary.companiesCanopiCount),
    contactsPlannedUpdate: asCount(contract.dryRunSummary.contactsCanopiCount),
    unresolvedCompanies: contract.dryRunSummary.companiesWithoutCanopiId,
    unresolvedContacts: contract.dryRunSummary.contactsWithoutCanopiId,
    persisted: false,
    dryRunOnly: true,
    contractStatus: contract.status,
  };
}

export async function dryRunHubspotIngestExecution(contractId: string): Promise<HubspotIngestExecutionResult> {
  const contract = await getHubspotIngestContractById(contractId);
  if (!contract) {
    return {
      status: 'blocked',
      mode: 'dry_run',
      provider: PROVIDER,
      contractId,
      canPersist: false,
      blockers: ['Contrato HubSpot não encontrado.'],
      warnings: [],
      plan: {
        accounts: buildPlanSection({
          totalPlanned: 0,
          create: 0,
          update: 0,
          skip: 0,
          review: 0,
          allowedFields: ACCOUNT_FIELDS,
          notes: 'Sem contrato salvo não há plano executável.',
        }),
        contacts: buildPlanSection({
          totalPlanned: 0,
          create: 0,
          update: 0,
          skip: 0,
          review: 0,
          allowedFields: CONTACT_FIELDS,
          notes: 'Sem contrato salvo não há plano executável.',
        }),
      },
      outOfScope: buildOutOfScope(),
      unresolved: {
        companiesOutsideCanopi: 0,
        contactsWithoutCanopiId: 0,
        ambiguousItems: 0,
      },
      guardrails: buildGuardrails(),
      summary: {
        companiesTotal: 0,
        contactsTotal: 0,
        companiesPlannedUpdate: 0,
        contactsPlannedUpdate: 0,
        unresolvedCompanies: 0,
        unresolvedContacts: 0,
        persisted: false,
        dryRunOnly: true,
        contractStatus: 'failed',
      },
    };
  }

  const blockers = buildBlockers(contract);
  const warnings = buildWarnings(contract);
  const plan = buildPlan(contract);

  return {
    status: blockers.length > 0 ? 'blocked' : 'success',
    mode: 'dry_run',
    provider: PROVIDER,
    contractId: contract.id,
    canPersist: false,
    blockers,
    warnings,
    plan,
    outOfScope: buildOutOfScope(),
    unresolved: {
      companiesOutsideCanopi: contract.dryRunSummary.companiesWithoutCanopiId,
      contactsWithoutCanopiId: contract.dryRunSummary.contactsWithoutCanopiId,
      ambiguousItems: contract.contractJson.ambiguousItems.length,
    },
    guardrails: buildGuardrails(),
    summary: buildSummary(contract),
  };
}
