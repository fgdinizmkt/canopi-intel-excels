import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const salesforceAdapter: AccountConnectorAdapterDefinition = {
  provider: 'salesforce',
  label: 'Salesforce',
  authType: 'oauth2_authorization_code',
  priorityObjectsForFirstTest: ['Account'],
  futureObjectsPlanned: ['Contact', 'Lead', 'Opportunity', 'User'],
  minimumExpectedFields: ['Id', 'Name', 'Website', 'OwnerId'],
  supportsCustomFields: true,
  requiredScopes: ['api', 'refresh_token'],
  optionalScopes: ['offline_access', 'id'],
  capabilities: {
    supportsRefreshToken: true,
    supportsMetadataDiscovery: true,
    supportsIncrementalSync: true,
    supportsWebhooks: true,
  },
  limitations: [
    'OAuth real ainda não implementado nesta fase.',
    'Sem callback backend para troca de código por token.',
  ],
  warning: 'Salesforce permanece em modo de setup local/simulado no C1.',
  nextRecommendedStep: 'Implementar fluxo OAuth com handler backend seguro e teste de conexão controlado.',
};
