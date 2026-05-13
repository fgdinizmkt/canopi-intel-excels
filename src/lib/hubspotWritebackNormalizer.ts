import type {
  HubspotWritebackAssociationConfidence,
  HubspotWritebackCompanyRecord,
  HubspotWritebackContactRecord,
  HubspotWritebackDryRunResult,
  HubspotWritebackDryRunSummary,
  HubspotWritebackPreviewAssociation,
} from '@/src/lib/hubspotWritebackTypes';

export interface HubspotWritebackNormalizeOptions {
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'mixed';
  headers: string[];
  mixedRows?: Record<string, string>[];
  companiesRows?: Record<string, string>[];
  contactsRows?: Record<string, string>[];
}

type HubspotWritebackRowSourceKind = 'company' | 'contact' | 'mixed';

interface HubspotWritebackInputRow {
  row: Record<string, string>;
  sourceRowIndex: number;
  sourceKind: HubspotWritebackRowSourceKind;
  sourceLabel: string;
}

const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'mail.com',
]);

const COMPANY_NAME_ALIASES = [
  'company_name',
  'account_name',
  'organization_name',
  'organization',
  'empresa',
  'razao_social',
  'razão_social',
  'company',
];

const COMPANY_DOMAIN_ALIASES = [
  'domain',
  'website',
  'site',
  'dominio',
  'domínio',
  'company_domain',
  'account_domain',
];

const COMPANY_LOCATION_ALIASES = {
  city: ['city', 'cidade'],
  state: ['state', 'state_code', 'estado'],
  country: ['country', 'country_code', 'pais', 'país'],
  industry: ['industry', 'segmento', 'setor'],
};

const CONTACT_FIRSTNAME_ALIASES = ['firstname', 'first_name', 'nome', 'first'];
const CONTACT_LASTNAME_ALIASES = ['lastname', 'last_name', 'sobrenome', 'last'];
const CONTACT_EMAIL_ALIASES = ['email', 'e-mail', 'mail', 'contact_email'];
const CONTACT_PHONE_ALIASES = ['phone', 'mobile', 'telephone', 'telefone', 'contact_phone'];
const CONTACT_JOBTITLE_ALIASES = ['jobtitle', 'job_title', 'title', 'cargo', 'position'];
const EXPLICIT_ASSOCIATION_NAME_ALIASES = [
  'associated_company_name',
  'company_name',
  'account_name',
  'company',
  'empresa',
  'razao_social',
  'razão_social',
];
const EXPLICIT_ASSOCIATION_DOMAIN_ALIASES = [
  'associated_company_domain',
  'company_domain',
  'account_domain',
  'domain',
  'website',
  'site',
];
const EXPLICIT_ASSOCIATION_ID_ALIASES = [
  'associated_canopi_company_id',
  'canopi_company_id',
  'company_id',
];

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeValue(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildLookup(row: Record<string, string>) {
  const lookup = new Map<string, string>();
  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = normalizeKey(key);
    const normalizedValue = normalizeValue(value);
    if (!normalizedKey || !normalizedValue) return;
    lookup.set(normalizedKey, normalizedValue);
  });
  return lookup;
}

function pickValue(lookup: Map<string, string>, aliases: string[]): string | null {
  for (const alias of aliases) {
    const value = lookup.get(normalizeKey(alias));
    if (value) return value;
  }
  return null;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stableHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function extractHostname(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    const cleaned = trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split(/[/?#]/)[0]
      .trim()
      .toLowerCase();
    return cleaned.length > 0 ? cleaned : null;
  }
}

function getEmailDomain(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) return null;
  const domain = trimmed.slice(atIndex + 1).trim();
  return domain.length > 0 ? domain : null;
}

function isPersonalEmailDomain(domain: string | null): boolean {
  if (!domain) return false;
  return PERSONAL_EMAIL_DOMAINS.has(domain.toLowerCase());
}

function splitFullName(value: string | null): { firstname: string | null; lastname: string | null } {
  if (!value) return { firstname: null, lastname: null };
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstname: null, lastname: null };
  if (parts.length === 1) return { firstname: parts[0], lastname: null };
  return { firstname: parts[0], lastname: parts.slice(1).join(' ') };
}

function createCompanyId(name: string, domain: string | null, website: string | null): string {
  const base = `${normalizeSlug(name)}|${normalizeSlug(domain || '')}|${normalizeSlug(website || '')}`;
  return `cpco_${stableHash(base)}`;
}

function createContactId(
  contact: ContactCandidate,
  associatedCompanyId: string | null,
  sourceRowIndex: number
): string {
  const associatedKey = normalizeSlug(associatedCompanyId || '');
  const emailKey = normalizeSlug(contact.email || '');
  const phoneKey = normalizeSlug(contact.phone || '');
  const nameKey = normalizeSlug([contact.firstname, contact.lastname].filter(Boolean).join(' ') || contact.fullNameSource || '');
  const sourceColumnsKey = normalizeSlug([...contact.sourceColumns].sort().join('|'));
  const sourceKey = `${contact.sourceLabel}|${sourceRowIndex}`;

  if (emailKey) {
    return `cpct_${stableHash([emailKey, associatedKey].join('|'))}`;
  }

  if (phoneKey) {
    return `cpct_${stableHash([nameKey || sourceColumnsKey || 'contato', phoneKey, associatedKey].join('|'))}`;
  }

  if (nameKey || sourceColumnsKey) {
    return `cpct_${stableHash([nameKey || sourceColumnsKey, associatedKey].join('|'))}`;
  }

  return `cpct_${stableHash([sourceKey, associatedKey].join('|'))}`;
}

function detectCompanySignals(lookup: Map<string, string>): boolean {
  return Boolean(
    pickValue(lookup, COMPANY_NAME_ALIASES) ||
    pickValue(lookup, COMPANY_DOMAIN_ALIASES) ||
    pickValue(lookup, COMPANY_LOCATION_ALIASES.city) ||
    pickValue(lookup, COMPANY_LOCATION_ALIASES.state) ||
    pickValue(lookup, COMPANY_LOCATION_ALIASES.country) ||
    pickValue(lookup, COMPANY_LOCATION_ALIASES.industry)
  );
}

function detectContactSignals(lookup: Map<string, string>): boolean {
  return Boolean(
    pickValue(lookup, CONTACT_FIRSTNAME_ALIASES) ||
    pickValue(lookup, CONTACT_LASTNAME_ALIASES) ||
    pickValue(lookup, CONTACT_EMAIL_ALIASES) ||
    pickValue(lookup, CONTACT_PHONE_ALIASES) ||
    pickValue(lookup, CONTACT_JOBTITLE_ALIASES) ||
    pickValue(lookup, ['name'])
  );
}

interface CompanyCandidate {
  canopi_company_id: string;
  name: string;
  domain: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  industry: string | null;
  sourceColumns: string[];
  simulatedFields: string[];
  sourceRowIndex: number;
  isStandaloneCompanyRow: boolean;
}

interface ContactCandidate {
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  jobtitle: string | null;
  sourceColumns: string[];
  sourceRowIndex: number;
  sourceLabel: string;
  fullNameSource: string | null;
}

function buildCompanyCandidate(
  row: Record<string, string>,
  index: number,
  sourceKind: HubspotWritebackRowSourceKind
): CompanyCandidate | null {
  if (sourceKind === 'contact') return null;
  const lookup = buildLookup(row);
  const companyName = pickValue(lookup, COMPANY_NAME_ALIASES);
  const companyDomain = pickValue(lookup, COMPANY_DOMAIN_ALIASES);
  const companyWebsite = pickValue(lookup, ['website', 'site']);
  const city = pickValue(lookup, COMPANY_LOCATION_ALIASES.city);
  const state = pickValue(lookup, COMPANY_LOCATION_ALIASES.state);
  const country = pickValue(lookup, COMPANY_LOCATION_ALIASES.country);
  const industry = pickValue(lookup, COMPANY_LOCATION_ALIASES.industry);

  const contactSignals = detectContactSignals(lookup);
  const resolvedName = companyName || (!contactSignals ? pickValue(lookup, ['name']) : null);
  const resolvedDomain = companyDomain || (companyWebsite ? extractHostname(companyWebsite) : null);

  if (!resolvedName && !resolvedDomain && !city && !state && !country && !industry) {
    return null;
  }

  const name = resolvedName || resolvedDomain || `Empresa ${index + 1}`;
  const canopi_company_id = createCompanyId(name, resolvedDomain, companyWebsite);
  const sourceColumns = Object.keys(row).filter((key) => normalizeValue(row[key]));
  const simulatedFields = ['canopi_company_id'];
  if (!companyName && resolvedDomain) simulatedFields.push('name');
  if (companyWebsite && !resolvedDomain) simulatedFields.push('domain');

  return {
    canopi_company_id,
    name,
    domain: resolvedDomain,
    website: companyWebsite,
    city,
    state,
    country,
    industry,
    sourceColumns,
    simulatedFields,
    sourceRowIndex: index,
    isStandaloneCompanyRow: !contactSignals,
  };
}

function buildContactCandidate(
  row: Record<string, string>,
  index: number,
  sourceKind: HubspotWritebackRowSourceKind,
  sourceLabel: string
): ContactCandidate | null {
  if (sourceKind === 'company') return null;
  const lookup = buildLookup(row);
  const firstName = pickValue(lookup, CONTACT_FIRSTNAME_ALIASES);
  const lastName = pickValue(lookup, CONTACT_LASTNAME_ALIASES);
  const email = pickValue(lookup, CONTACT_EMAIL_ALIASES);
  const phone = pickValue(lookup, CONTACT_PHONE_ALIASES);
  const jobtitle = pickValue(lookup, CONTACT_JOBTITLE_ALIASES);
  const fullName = !firstName && !lastName ? pickValue(lookup, ['name', 'full_name']) : null;
  const explicitContactSignals = Boolean(firstName || lastName || email || phone || jobtitle);

  if (sourceKind !== 'contact' && !explicitContactSignals) return null;
  if (!explicitContactSignals && !fullName) return null;

  let resolvedFirstName = firstName;
  let resolvedLastName = lastName;
  if ((!resolvedFirstName || !resolvedLastName) && fullName) {
    const split = splitFullName(fullName);
    resolvedFirstName = resolvedFirstName || split.firstname;
    resolvedLastName = resolvedLastName || split.lastname;
  }

  return {
    firstname: resolvedFirstName,
    lastname: resolvedLastName,
    email,
    phone,
    jobtitle,
    sourceColumns: Object.keys(row).filter((key) => normalizeValue(row[key])),
    sourceRowIndex: index,
    sourceLabel,
    fullNameSource: fullName,
  };
}

function getRowCompanySignals(lookup: Map<string, string>) {
  const companyName = pickValue(lookup, COMPANY_NAME_ALIASES);
  const domain = pickValue(lookup, COMPANY_DOMAIN_ALIASES) || pickValue(lookup, ['website', 'site']);
  return { companyName, domain: domain ? extractHostname(domain) ?? domain : null };
}

function findCompanyByDomain(
  companyIndex: Map<string, CompanyCandidate>,
  targetDomain: string | null
): CompanyCandidate | null {
  if (!targetDomain) return null;
  const normalizedTarget = normalizeSlug(targetDomain);
  const match = [...companyIndex.values()].find((company) => normalizeSlug(company.domain || '') === normalizedTarget);
  return match || null;
}

function findCompanyByName(
  companyIndex: Map<string, CompanyCandidate>,
  targetName: string | null
): { company: CompanyCandidate | null; ambiguous: boolean } {
  if (!targetName) return { company: null, ambiguous: false };
  const normalizedTarget = normalizeSlug(targetName);
  const matches = [...companyIndex.values()].filter((company) => normalizeSlug(company.name) === normalizedTarget);
  if (matches.length === 1) return { company: matches[0], ambiguous: false };
  return { company: matches[0] || null, ambiguous: matches.length > 1 };
}

function buildContactAssociation(
  contact: ContactCandidate,
  companyIndex: Map<string, CompanyCandidate>,
  row: Record<string, string>
): {
  associatedCompany: CompanyCandidate | null;
  associationSource: string | null;
  associationConfidence: HubspotWritebackAssociationConfidence;
  blockedReason: string | null;
  simulatedFields: string[];
} {
  const lookup = buildLookup(row);
  const explicitCompanyId = pickValue(lookup, EXPLICIT_ASSOCIATION_ID_ALIASES);
  const explicitCompanyName = pickValue(lookup, EXPLICIT_ASSOCIATION_NAME_ALIASES);
  const explicitCompanyDomain = pickValue(lookup, EXPLICIT_ASSOCIATION_DOMAIN_ALIASES);
  const rowCompanySignals = getRowCompanySignals(lookup);
  const emailDomain = getEmailDomain(contact.email);

  if (explicitCompanyId) {
    const byId = companyIndex.get(explicitCompanyId);
    if (byId) {
      return {
        associatedCompany: byId,
        associationSource: 'ID explícito da base',
        associationConfidence: isPersonalEmailDomain(emailDomain) ? 'medium' : 'high',
        blockedReason: null,
        simulatedFields: ['canopi_contact_id', 'associated_canopi_company_id', 'association_source', 'association_confidence'],
      };
    }
  }

  const rowCompanyCandidate = rowCompanySignals.companyName || rowCompanySignals.domain
    ? findCompanyByDomain(companyIndex, rowCompanySignals.domain) || findCompanyByName(companyIndex, rowCompanySignals.companyName).company
    : null;

  if (rowCompanyCandidate) {
    const emailIsPersonal = isPersonalEmailDomain(emailDomain);
    const associationConfidence: HubspotWritebackAssociationConfidence = emailIsPersonal
      ? 'medium'
      : rowCompanySignals.domain && emailDomain && normalizeSlug(rowCompanySignals.domain) === normalizeSlug(emailDomain)
        ? 'high'
        : 'high';
    return {
      associatedCompany: rowCompanyCandidate,
      associationSource: rowCompanySignals.domain ? 'domínio da base' : 'vínculo explícito da base',
      associationConfidence,
      blockedReason: null,
      simulatedFields: ['canopi_contact_id', 'associated_canopi_company_id', 'association_source', 'association_confidence'],
    };
  }

  if (explicitCompanyDomain) {
    const byDomain = findCompanyByDomain(companyIndex, explicitCompanyDomain);
    if (byDomain) {
      return {
        associatedCompany: byDomain,
        associationSource: 'domínio explícito na base',
        associationConfidence: isPersonalEmailDomain(emailDomain) ? 'medium' : 'high',
        blockedReason: null,
        simulatedFields: ['canopi_contact_id', 'associated_canopi_company_id', 'association_source', 'association_confidence'],
      };
    }
  }

  if (explicitCompanyName) {
    const { company, ambiguous } = findCompanyByName(companyIndex, explicitCompanyName);
    if (company) {
      return {
        associatedCompany: company,
        associationSource: ambiguous ? 'nome da empresa ambíguo' : 'nome da empresa explícito',
        associationConfidence: ambiguous ? 'low' : (isPersonalEmailDomain(emailDomain) ? 'medium' : 'high'),
        blockedReason: null,
        simulatedFields: ['canopi_contact_id', 'associated_canopi_company_id', 'association_source', 'association_confidence'],
      };
    }
  }

  if (companyIndex.size === 1) {
    const onlyCompany = [...companyIndex.values()][0];
    return {
      associatedCompany: onlyCompany,
      associationSource: 'empresa única na base',
      associationConfidence: 'low',
      blockedReason: null,
      simulatedFields: ['canopi_contact_id', 'associated_canopi_company_id', 'association_source', 'association_confidence'],
    };
  }

  if (emailDomain) {
    const byDomain = findCompanyByDomain(companyIndex, emailDomain);
    if (byDomain) {
      return {
        associatedCompany: byDomain,
        associationSource: 'domínio do e-mail',
        associationConfidence: isPersonalEmailDomain(emailDomain) ? 'medium' : 'high',
        blockedReason: null,
        simulatedFields: ['canopi_contact_id', 'associated_canopi_company_id', 'association_source', 'association_confidence'],
      };
    }
  }

  return {
    associatedCompany: null,
    associationSource: null,
    associationConfidence: 'blocked',
    blockedReason: 'Nenhuma empresa associada foi identificada na base.',
    simulatedFields: ['canopi_contact_id'],
  };
}

function buildCompanyReviewRow(company: CompanyCandidate, isDuplicate: boolean): HubspotWritebackCompanyRecord {
  return {
    sourceRowIndex: company.sourceRowIndex,
    canopi_company_id: company.canopi_company_id,
    name: company.name,
    domain: company.domain,
    website: company.website,
    city: company.city,
    state: company.state,
    country: company.country,
    industry: company.industry,
    sourceColumns: company.sourceColumns,
    simulatedFields: company.simulatedFields,
    isDuplicate,
  };
}

function buildContactReviewRow(
  contact: ContactCandidate,
  association: ReturnType<typeof buildContactAssociation>,
  isDuplicate: boolean
): HubspotWritebackContactRecord {
  const associatedCompany = association.associatedCompany;
  return {
    sourceRowIndex: contact.sourceRowIndex,
    canopi_contact_id: createContactId(contact, associatedCompany?.canopi_company_id || null, contact.sourceRowIndex),
    firstname: contact.firstname,
    lastname: contact.lastname,
    email: contact.email,
    phone: contact.phone,
    jobtitle: contact.jobtitle,
    associated_canopi_company_id: associatedCompany?.canopi_company_id || null,
    associated_company_name: associatedCompany?.name || null,
    associated_company_domain: associatedCompany?.domain || null,
    association_source: association.associationSource,
    association_confidence: association.associationConfidence,
    blocked_reason: association.blockedReason,
    sourceColumns: contact.sourceColumns,
    simulatedFields: association.simulatedFields,
    isDuplicate,
  };
}

function mergeCompanyCandidate(existing: CompanyCandidate, incoming: CompanyCandidate): CompanyCandidate {
  return {
    ...existing,
    name: existing.name || incoming.name,
    domain: existing.domain || incoming.domain,
    website: existing.website || incoming.website,
    city: existing.city || incoming.city,
    state: existing.state || incoming.state,
    country: existing.country || incoming.country,
    industry: existing.industry || incoming.industry,
    sourceColumns: [...new Set([...existing.sourceColumns, ...incoming.sourceColumns])],
    simulatedFields: [...new Set([...existing.simulatedFields, ...incoming.simulatedFields])],
    sourceRowIndex: Math.min(existing.sourceRowIndex, incoming.sourceRowIndex),
    isStandaloneCompanyRow: existing.isStandaloneCompanyRow || incoming.isStandaloneCompanyRow,
  };
}

function buildNormalizedResult(
  fileName: string,
  fileType: 'csv' | 'xlsx' | 'mixed',
  headers: string[],
  inputRows: HubspotWritebackInputRow[]
): HubspotWritebackDryRunResult {
  const companyCandidatesRaw: CompanyCandidate[] = [];
  const contactCandidates: ContactCandidate[] = [];
  const rowLookup = new Map<string, Record<string, string>>();

  inputRows.forEach(({ row, sourceKind, sourceLabel, sourceRowIndex }) => {
    rowLookup.set(`${sourceLabel}|${sourceRowIndex}`, row);

    const lookup = buildLookup(row);
    const companyCandidate = buildCompanyCandidate(row, sourceRowIndex, sourceKind);
    if (companyCandidate) companyCandidatesRaw.push(companyCandidate);

    const contactCandidate = buildContactCandidate(row, sourceRowIndex, sourceKind, sourceLabel);
    if (contactCandidate) contactCandidates.push(contactCandidate);

    if (sourceKind !== 'company' && !contactCandidate && detectCompanySignals(lookup) && !companyCandidate) {
      const fallbackCompany = buildCompanyCandidate(row, sourceRowIndex, sourceKind);
      if (fallbackCompany) companyCandidatesRaw.push(fallbackCompany);
    }
  });

  const companyById = new Map<string, CompanyCandidate>();
  const standaloneCompanyCountById = new Map<string, number>();

  companyCandidatesRaw.forEach((company) => {
    const current = companyById.get(company.canopi_company_id);
    if (current) {
      companyById.set(company.canopi_company_id, mergeCompanyCandidate(current, company));
    } else {
      companyById.set(company.canopi_company_id, company);
    }

    if (company.isStandaloneCompanyRow) {
      standaloneCompanyCountById.set(company.canopi_company_id, (standaloneCompanyCountById.get(company.canopi_company_id) || 0) + 1);
    }
  });

  const normalizedCompanies = [...companyById.values()].map((company) =>
    buildCompanyReviewRow(company, (standaloneCompanyCountById.get(company.canopi_company_id) || 0) > 1)
  );

  const contactCandidatesWithAssociation = contactCandidates.map((contact) => {
    const row = rowLookup.get(`${contact.sourceLabel}|${contact.sourceRowIndex}`) || {};
    const association = buildContactAssociation(contact, companyById, row);
    return { contact, association };
  });

  const contactCountById = new Map<string, number>();
  contactCandidatesWithAssociation.forEach(({ contact, association }) => {
    const contactId = createContactId(contact, association.associatedCompany?.canopi_company_id || null, contact.sourceRowIndex);
    contactCountById.set(contactId, (contactCountById.get(contactId) || 0) + 1);
  });

  const normalizedContacts = contactCandidatesWithAssociation.map(({ contact, association }) => {
    const contactId = createContactId(contact, association.associatedCompany?.canopi_company_id || null, contact.sourceRowIndex);
    return buildContactReviewRow(contact, association, (contactCountById.get(contactId) || 0) > 1);
  });

  const previewCompanies = normalizedCompanies.slice(0, 5);
  const previewContacts = normalizedContacts.slice(0, 5);
  const previewAssociations: HubspotWritebackPreviewAssociation[] = normalizedContacts
    .filter((contact) => contact.associated_canopi_company_id && contact.blocked_reason === null)
    .slice(0, 5)
    .map((contact) => ({
      contactName: [contact.firstname, contact.lastname].filter(Boolean).join(' ').trim() || contact.email || `Contato ${contact.sourceRowIndex + 1}`,
      contactEmail: contact.email,
      companyName: contact.associated_company_name || '—',
      companyDomain: contact.associated_company_domain,
      association_source: contact.association_source,
      association_confidence: contact.association_confidence,
    }));

  const contactsAssociated = normalizedContacts.filter((contact) => contact.associated_canopi_company_id && contact.blocked_reason === null).length;
  const contactsWithWeakAssociation = normalizedContacts.filter((contact) => contact.association_confidence === 'low').length;
  const blockedContacts = normalizedContacts.filter((contact) => contact.blocked_reason !== null).length;
  const duplicateCompanies = [...standaloneCompanyCountById.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
  const duplicateContacts = normalizedContacts.filter((contact) => contact.isDuplicate).length;
  const simulatedFieldsCount = [
    ...normalizedCompanies.map((company) => company.simulatedFields.length),
    ...normalizedContacts.map((contact) => contact.simulatedFields.length),
  ].reduce((sum, value) => sum + value, 0);

  const readyForSendCompanies = normalizedCompanies.filter((company) => !company.isDuplicate).length;
  const readyForSendContacts = normalizedContacts.filter(
    (contact) => contact.blocked_reason === null && contact.association_confidence !== 'low' && !contact.isDuplicate
  ).length;

  const blockers: string[] = [];
  if (blockedContacts > 0) blockers.push(`${blockedContacts} contato(s) sem empresa associada.`);
  if (duplicateCompanies > 0) blockers.push(`${duplicateCompanies} empresa(s) duplicada(s) na base.`);
  if (duplicateContacts > 0) blockers.push(`${duplicateContacts} contato(s) duplicado(s) na base.`);

  const warnings: string[] = [];
  if (contactsWithWeakAssociation > 0) warnings.push(`${contactsWithWeakAssociation} contato(s) com associação fraca precisam de revisão.`);
  if (normalizedCompanies.length === 0) warnings.push('Nenhuma empresa identificada na base enviada.');
  if (normalizedContacts.length === 0) warnings.push('Nenhum contato identificado na base enviada.');
  if (normalizedContacts.some((contact) => contact.email && isPersonalEmailDomain(getEmailDomain(contact.email)))) {
    warnings.push('Contatos com e-mail pessoal foram associados pelo vínculo da base, não pelo domínio do e-mail.');
  }

  const summary: HubspotWritebackDryRunSummary = {
    totalRows: inputRows.length,
    companiesIdentified: normalizedCompanies.length,
    contactsIdentified: normalizedContacts.length,
    contactsAssociated,
    contactsWithWeakAssociation,
    readyForSendCompanies,
    readyForSendContacts,
    reviewCount: contactsWithWeakAssociation + duplicateCompanies + duplicateContacts,
    duplicateCompanies,
    duplicateContacts,
    blockedContacts,
    simulatedFieldsCount,
  };

  return {
    status: 'success',
    fileName,
    fileType,
    analyzedAt: new Date().toISOString(),
    headers,
    summary,
    warnings,
    blockers,
    companies: normalizedCompanies,
    contacts: normalizedContacts,
    previewCompanies,
    previewContacts,
    previewAssociations,
  };
}

export function normalizeHubspotWritebackFiles(options: HubspotWritebackNormalizeOptions): HubspotWritebackDryRunResult {
  const { fileName, fileType, headers, mixedRows = [], companiesRows = [], contactsRows = [] } = options;
  const inputRows: HubspotWritebackInputRow[] = [];

  companiesRows.forEach((row, index) => {
    inputRows.push({ row, sourceRowIndex: index, sourceKind: 'company', sourceLabel: 'companies' });
  });

  contactsRows.forEach((row, index) => {
    inputRows.push({ row, sourceRowIndex: index, sourceKind: 'contact', sourceLabel: 'contacts' });
  });

  mixedRows.forEach((row, index) => {
    inputRows.push({ row, sourceRowIndex: index, sourceKind: 'mixed', sourceLabel: 'mixed' });
  });

  return buildNormalizedResult(fileName, fileType, headers, inputRows);
}

export function normalizeHubspotWritebackRows(options: HubspotWritebackNormalizeOptions): HubspotWritebackDryRunResult {
  return normalizeHubspotWritebackFiles({
    fileName: options.fileName,
    fileType: options.fileType,
    headers: options.headers,
    mixedRows: options.mixedRows,
    companiesRows: options.companiesRows,
    contactsRows: options.contactsRows,
  });
}
