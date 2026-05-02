import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type SalesforceField = {
  name: string;
  label: string;
  type: string;
  isRequired: boolean;
  isUpdateable: boolean;
  isCreateable?: boolean;
  isCustom?: boolean;
};

type SalesforceDescribeResponse = {
  name?: string;
  label?: string;
  fields?: Array<{
    name?: string;
    label?: string;
    type?: string;
    nillable?: boolean;
    updateable?: boolean;
    createable?: boolean;
    custom?: boolean;
  }>;
};

const PRIORITY_FIELDS = [
  'Id', 'Name', 'Type', 'Industry', 'Website', 'Phone', 'OwnerId',
  'CreatedDate', 'LastModifiedDate', 'BillingCity', 'BillingState', 'BillingCountry',
];

function sanitizeSalesforceError(status: number): string {
  if (status === 400) return 'Informe a URL da instância Salesforce e o token temporário para testar a conexão.';
  if (status === 401 || status === 403) return 'URL da instância ou token inválidos, revogados ou sem acesso à API do Salesforce.';
  if (status === 404) return 'Salesforce não retornou Account para esta instância.';
  if (status === 429) return 'Salesforce atingiu limite temporário. Tente novamente em alguns instantes.';
  if (status >= 500) return 'Salesforce indisponível no momento.';
  return 'Não foi possível validar a conexão Salesforce.';
}

function normalizeInstanceUrl(rawValue: unknown): string {
  if (typeof rawValue !== 'string') return '';
  const trimmed = rawValue.trim();
  if (!trimmed) return '';
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    if (!host.endsWith('salesforce.com') && !host.endsWith('force.com')) return '';
    return url.origin;
  } catch {
    return '';
  }
}

function normalizeToken(rawValue: unknown): string {
  return typeof rawValue === 'string' ? rawValue.trim() : '';
}

function normalizeApiVersion(rawValue: unknown): string {
  if (typeof rawValue !== 'string') return 'v66.0';
  const trimmed = rawValue.trim();
  return /^v\d+\.\d+$/.test(trimmed) ? trimmed : 'v66.0';
}

function extractSalesforceFields(payload: SalesforceDescribeResponse | null): SalesforceField[] {
  if (!Array.isArray(payload?.fields) || payload.fields.length === 0) {
    return [];
  }

  const fields = payload.fields.map((field) => ({
    name: field.name || '',
    label: field.label || '',
    type: field.type || 'unknown',
    isRequired: field.nillable === false,
    isUpdateable: field.updateable === true,
    isCreateable: field.createable === true,
    isCustom: field.custom === true,
  })).filter((f) => f.name);

  // Reorder: priority fields first, then the rest
  const priorityFields = fields.filter((f) => PRIORITY_FIELDS.includes(f.name));
  const otherFields = fields.filter((f) => !PRIORITY_FIELDS.includes(f.name));
  const combined = [...priorityFields, ...otherFields];

  // Return max 50 fields
  return combined.slice(0, 50);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    instanceUrl?: unknown;
    token?: unknown;
    apiVersion?: unknown;
  };

  const instanceUrl = normalizeInstanceUrl(body.instanceUrl);
  const token = normalizeToken(body.token);
  const apiVersion = normalizeApiVersion(body.apiVersion);

  if (!instanceUrl || !token) {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'salesforce',
        error: 'Informe a URL da instância Salesforce e o token temporário para testar a conexão.',
      },
      { status: 400 }
    );
  }

  try {
    const describeResponse = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Account/describe`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!describeResponse.ok) {
      return NextResponse.json(
        {
          status: 'error',
          provider: 'salesforce',
          error: sanitizeSalesforceError(describeResponse.status),
        },
        { status: describeResponse.status >= 500 ? 502 : describeResponse.status }
      );
    }

    const payload = (await describeResponse.json().catch(() => null)) as SalesforceDescribeResponse | null;
    const fieldsCount = Array.isArray(payload?.fields) ? payload.fields.length : 0;
    const accountFields = extractSalesforceFields(payload);

    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      testedAt: new Date().toISOString(),
      instanceUrl,
      apiVersion,
      accountLabel: payload?.label || 'Account',
      accountFieldsCount: fieldsCount,
      readAccessConfirmed: true,
      accountFields,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        provider: 'salesforce',
        error: 'Não foi possível alcançar a instância Salesforce informada.',
      },
      { status: 503 }
    );
  }
}
