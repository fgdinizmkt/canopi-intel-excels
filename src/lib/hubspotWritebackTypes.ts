export type HubspotWritebackRecordType = 'company' | 'contact';

export type HubspotWritebackAssociationConfidence = 'high' | 'medium' | 'low' | 'blocked';

export interface HubspotWritebackCompanyRecord {
  sourceRowIndex: number;
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
  isDuplicate: boolean;
}

export interface HubspotWritebackContactRecord {
  sourceRowIndex: number;
  canopi_contact_id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  jobtitle: string | null;
  associated_canopi_company_id: string | null;
  associated_company_name: string | null;
  associated_company_domain: string | null;
  association_source: string | null;
  association_confidence: HubspotWritebackAssociationConfidence;
  blocked_reason: string | null;
  sourceColumns: string[];
  simulatedFields: string[];
  isDuplicate: boolean;
}

export interface HubspotWritebackDryRunSummary {
  totalRows: number;
  companiesIdentified: number;
  contactsIdentified: number;
  contactsAssociated: number;
  contactsWithWeakAssociation: number;
  readyForSendCompanies: number;
  readyForSendContacts: number;
  reviewCount: number;
  duplicateCompanies: number;
  duplicateContacts: number;
  blockedContacts: number;
  simulatedFieldsCount: number;
}

export interface HubspotWritebackPreviewAssociation {
  contactName: string;
  contactEmail: string | null;
  companyName: string;
  companyDomain: string | null;
  association_source: string | null;
  association_confidence: HubspotWritebackAssociationConfidence;
}

export interface HubspotWritebackDryRunResult {
  status: 'success';
  fileName: string;
  fileType: 'csv' | 'xlsx' | 'mixed';
  analyzedAt: string;
  headers: string[];
  summary: HubspotWritebackDryRunSummary;
  warnings: string[];
  blockers: string[];
  companies: HubspotWritebackCompanyRecord[];
  contacts: HubspotWritebackContactRecord[];
  previewCompanies: HubspotWritebackCompanyRecord[];
  previewContacts: HubspotWritebackContactRecord[];
  previewAssociations: HubspotWritebackPreviewAssociation[];
}

export interface HubspotWritebackDryRunError {
  status: 'error';
  error: string;
  details?: string;
}
