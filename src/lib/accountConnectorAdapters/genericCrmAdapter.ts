import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const genericCrmAdapter: AccountConnectorAdapterDefinition = {
  provider: 'other_crm',
  label: 'Outro CRM',
  surfaceKind: 'shell_preset',
  authType: 'bearer_token',
  priorityObjectsForFirstTest: ['accounts_or_organizations'],
  futureObjectsPlanned: ['contacts', 'deals'],
  minimumExpectedFields: ['id', 'name'],
  supportsCustomFields: true,
  requiredScopes: ['accounts.read'],
  optionalScopes: ['accounts.write', 'metadata.read', 'webhooks.manage'],
  capabilities: {
    supportsRefreshToken: false,
    supportsMetadataDiscovery: true,
    supportsIncrementalSync: true,
    supportsWebhooks: true,
  },
  limitations: [
    'Depende de endpoint, paginação e autenticação definidos por provedor.',
    'Sem contrato externo validado nesta versão.',
  ],
  warning: 'Outro CRM permanece como preset local nesta versão.',
  nextRecommendedStep: 'Preset local disponível nesta versão.',
};
