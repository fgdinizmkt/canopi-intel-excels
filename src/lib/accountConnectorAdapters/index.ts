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

export function getAccountConnectorAdapter(provider: AccountConnectorProvider): AccountConnectorAdapterDefinition {
  return ACCOUNT_CONNECTOR_ADAPTERS[provider];
}
