import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const csvUploadAdapter: AccountConnectorAdapterDefinition = {
  provider: 'csv_upload',
  label: 'Upload CSV (Batch)',
  authType: 'none',
  priorityObjectsForFirstTest: ['batch_record'],
  futureObjectsPlanned: [],
  minimumExpectedFields: ['row_index', 'empresa', 'website', 'base_legal'],
  supportsCustomFields: true,
  requiredScopes: [],
  optionalScopes: [],
  capabilities: {
    supportsRefreshToken: false,
    supportsMetadataDiscovery: false,
    supportsIncrementalSync: false,
    supportsWebhooks: false,
  },
  limitations: [
    'Sem conexão contínua com CRM externo.',
    'Ingestão manual/local sem sincronização incremental real.',
  ],
  warning: 'CSV permanece como caminho local/manual de ingestão, sem conexão real.',
  nextRecommendedStep: 'Manter CSV como fallback e priorizar conector nativo para conexão real futura.',
};
