import type {
  AccountConnectorAdapterDefinition,
  AccountConnectorProvider,
} from '@/src/lib/accountConnectionModel';
import { csvUploadAdapter } from '@/src/lib/accountConnectorAdapters/csvUploadAdapter';
import { genericCrmAdapter } from '@/src/lib/accountConnectorAdapters/genericCrmAdapter';
import { hubspotAdapter } from '@/src/lib/accountConnectorAdapters/hubspotAdapter';
import { rdStationAdapter } from '@/src/lib/accountConnectorAdapters/rdStationAdapter';
import { salesforceAdapter } from '@/src/lib/accountConnectorAdapters/salesforceAdapter';

export const ACCOUNT_CONNECTOR_ADAPTERS: Record<AccountConnectorProvider, AccountConnectorAdapterDefinition> = {
  salesforce: salesforceAdapter,
  hubspot: hubspotAdapter,
  rd_station: rdStationAdapter,
  csv_upload: csvUploadAdapter,
  other_crm: genericCrmAdapter,
};

const ACCOUNT_CONNECTOR_PROVIDER_SET = new Set<AccountConnectorProvider>(Object.keys(ACCOUNT_CONNECTOR_ADAPTERS) as AccountConnectorProvider[]);

export function isAccountConnectorProvider(provider: unknown): provider is AccountConnectorProvider {
  return typeof provider === 'string' && ACCOUNT_CONNECTOR_PROVIDER_SET.has(provider as AccountConnectorProvider);
}

export function getAccountConnectorAdapter(provider: AccountConnectorProvider): AccountConnectorAdapterDefinition {
  return ACCOUNT_CONNECTOR_ADAPTERS[provider];
}

export function getAccountConnectorAdapterSafe(provider: unknown): AccountConnectorAdapterDefinition | null {
  if (!isAccountConnectorProvider(provider)) return null;
  return ACCOUNT_CONNECTOR_ADAPTERS[provider];
}
