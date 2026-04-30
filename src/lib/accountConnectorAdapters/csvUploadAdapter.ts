import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const csvUploadAdapter: AccountConnectorAdapterDefinition = {
  provider: 'csv_upload',
  label: 'CSV local',
  surfaceKind: 'functional_real',
  authType: 'none',
  priorityObjectsForFirstTest: ['batch_record'],
  futureObjectsPlanned: [],
  minimumExpectedFields: ['row_index', 'account_name', 'domain', 'base_legal'],
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
    'Ingestão manual/local sem sincronização incremental nesta versão.',
  ],
  warning: 'CSV é um método local de entrada nesta versão.',
  nextRecommendedStep: 'Carga local disponível nesta versão.',
};
