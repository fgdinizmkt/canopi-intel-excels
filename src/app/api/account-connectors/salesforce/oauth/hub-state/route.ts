import { NextResponse } from 'next/server';
import { fetchAllAccountsPaginated, fetchLeadsPreview, fetchObjectsPreview, generateContactRelationshipPreview, generateOpportunityRelationshipPreview, SALESFORCE_PROVIDER } from '@/src/lib/server/salesforceOAuthService';
import { getSupabaseAdminClient } from '@/src/lib/server/supabaseAdmin';

export const dynamic = 'force-dynamic';

type SyncSummary = {
  startedAt?: string;
  finishedAt?: string;
  createdCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  errorCount?: number;
  unresolvedAccountCount?: number;
  missingRequiredFieldsCount?: number;
  existingMatchSkippedCount?: number;
  ambiguousMatchSkippedCount?: number;
  outcome?: string;
};

type ContractRow = {
  id: string;
  status: string;
  created_at: string;
  contract_json: Record<string, unknown> | null;
};

function safeCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mapAccountPreview(contractJson: Record<string, unknown> | null, createdAt: string) {
  const entities = Array.isArray(contractJson?.entities) ? contractJson.entities as Array<Record<string, unknown>> : [];
  const accountEntity = entities.find((entity) => entity.objectApiName === 'Account');
  const selectedRecords = Array.isArray(accountEntity?.selectedRecords) ? accountEntity?.selectedRecords as Array<Record<string, unknown>> : [];

  return {
    records: selectedRecords.map((record) => ({
      Id: typeof record.Id === 'string' ? record.Id : null,
      Name: typeof record.Name === 'string' ? record.Name : null,
      Website: typeof record.Website === 'string' ? record.Website : null,
      Industry: typeof record.Industry === 'string' ? record.Industry : null,
      Type: typeof record.Type === 'string' ? record.Type : null,
      OwnerId: typeof record.OwnerId === 'string' ? record.OwnerId : null,
      CreatedDate: typeof record.CreatedDate === 'string' ? record.CreatedDate : null,
      LastModifiedDate: typeof record.LastModifiedDate === 'string' ? record.LastModifiedDate : null,
    })),
    totalSize: selectedRecords.length,
    done: true,
    limit: selectedRecords.length,
    apiVersion: 'persisted',
    instanceUrl: 'persisted',
    accountLabel: 'Account',
    testedAt: createdAt,
  };
}

function buildSummary(contractJson: Record<string, unknown> | null, key: string): SyncSummary | null {
  const summary = contractJson?.[key];
  if (!summary || typeof summary !== 'object') return null;
  return {
    startedAt: typeof (summary as SyncSummary).startedAt === 'string' ? (summary as SyncSummary).startedAt : undefined,
    finishedAt: typeof (summary as SyncSummary).finishedAt === 'string' ? (summary as SyncSummary).finishedAt : undefined,
    createdCount: safeCount((summary as SyncSummary).createdCount) ?? undefined,
    updatedCount: safeCount((summary as SyncSummary).updatedCount) ?? undefined,
    skippedCount: safeCount((summary as SyncSummary).skippedCount) ?? undefined,
    errorCount: safeCount((summary as SyncSummary).errorCount) ?? undefined,
    unresolvedAccountCount: safeCount((summary as SyncSummary).unresolvedAccountCount) ?? undefined,
    missingRequiredFieldsCount: safeCount((summary as SyncSummary).missingRequiredFieldsCount) ?? undefined,
    existingMatchSkippedCount: safeCount((summary as SyncSummary).existingMatchSkippedCount) ?? undefined,
    ambiguousMatchSkippedCount: safeCount((summary as SyncSummary).ambiguousMatchSkippedCount) ?? undefined,
    outcome: typeof (summary as SyncSummary).outcome === 'string' ? (summary as SyncSummary).outcome : undefined,
  };
}

async function getLatestContractRow(objectApiName: 'Account' | 'Contact' | 'Opportunity'): Promise<ContractRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('salesforce_sync_contracts')
    .select('id, status, created_at, contract_json')
    .eq('provider', SALESFORCE_PROVIDER)
    .in('status', ['mapped', 'synced'])
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw new Error('READ_SYNC_CONTRACT_FAILED');

  const rows = (data ?? []) as ContractRow[];
  return rows.find((row) => {
    const entities = Array.isArray(row.contract_json?.entities) ? row.contract_json.entities as Array<Record<string, unknown>> : [];
    const entity = entities.find((item) => item.objectApiName === objectApiName);
    return Array.isArray(entity?.selectedRecords) && (entity?.selectedRecords as unknown[]).length > 0;
  }) ?? null;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const [accountsCountRes, contactsCountRes, opportunitiesCountRes] = await Promise.all([
      supabase.from('accounts').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('oportunidades').select('id', { count: 'exact', head: true }),
    ]);

    const [sfAccounts, sfContacts, sfOpportunities, sfLeads] = await Promise.all([
      fetchAllAccountsPaginated(),
      fetchObjectsPreview(['Contact'], 200),
      fetchObjectsPreview(['Opportunity'], 200),
      fetchLeadsPreview(),
    ]);

    const [accountContract, contactContract, opportunityContract] = await Promise.all([
      getLatestContractRow('Account'),
      getLatestContractRow('Contact'),
      getLatestContractRow('Opportunity'),
    ]);

    const accountPreview = accountContract ? mapAccountPreview(accountContract.contract_json, accountContract.created_at) : null;
    const accountSummary = buildSummary(accountContract?.contract_json ?? null, 'sync_summary_log');
    const contactSummary = buildSummary(contactContract?.contract_json ?? null, 'contact_sync_summary_log');
    const opportunitySummary = buildSummary(opportunityContract?.contract_json ?? null, 'opportunity_sync_summary_log');

    const contactPreview = contactContract ? await generateContactRelationshipPreview(contactContract.id) : null;
    const opportunityPreview = opportunityContract ? await generateOpportunityRelationshipPreview(opportunityContract.id) : null;

    return NextResponse.json({
      status: 'success',
      provider: 'salesforce',
      hydratedAt: new Date().toISOString(),
      salesforce: {
        accounts: { totalSize: sfAccounts.totalSize, recordsLoaded: sfAccounts.records.length, done: sfAccounts.done, testedAt: sfAccounts.testedAt },
        contacts: { totalSize: sfContacts[0]?.totalSize ?? 0, recordsLoaded: sfContacts[0]?.records.length ?? 0, testedAt: sfContacts[0]?.testedAt ?? null },
        opportunities: { totalSize: sfOpportunities[0]?.totalSize ?? 0, recordsLoaded: sfOpportunities[0]?.records.length ?? 0, testedAt: sfOpportunities[0]?.testedAt ?? null },
        leads: { totalSize: sfLeads.totalSize, recordsLoaded: sfLeads.records.length, done: sfLeads.done, testedAt: sfLeads.testedAt },
      },
      canopi: {
        accounts: {
          count: accountsCountRes.count ?? 0,
          latestSync: accountSummary,
          contractId: accountContract?.id ?? null,
          preview: accountPreview,
        },
        contacts: {
          count: contactsCountRes.count ?? 0,
          latestSync: contactSummary,
          contractId: contactContract?.id ?? null,
          preview: contactPreview,
        },
        opportunities: {
          count: opportunitiesCountRes.count ?? 0,
          latestSync: opportunitySummary,
          contractId: opportunityContract?.id ?? null,
          preview: opportunityPreview,
        },
      },
      configurationCompleted:
        Boolean(accountContract?.id) &&
        Boolean(contactContract?.id) &&
        Boolean(opportunityContract?.id) &&
        accountContract?.status === 'synced' &&
        contactContract?.status === 'synced' &&
        opportunityContract?.status === 'synced',
      leadLoadState: {
        phase: 'idle',
        message: 'não carregados · sync pendente',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    return NextResponse.json(
      { status: 'error', provider: 'salesforce', error: message },
      { status: 500 },
    );
  }
}
