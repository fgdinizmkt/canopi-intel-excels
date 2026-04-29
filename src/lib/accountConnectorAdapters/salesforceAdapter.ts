import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const salesforceAdapter: AccountConnectorAdapterDefinition = {
  provider: 'salesforce',
  label: 'Salesforce',
  surfaceKind: 'functional_real',
  authType: 'bearer_token',
  priorityObjectsForFirstTest: ['Account'],
  futureObjectsPlanned: ['Contact', 'Lead', 'Opportunity', 'User'],
  minimumExpectedFields: ['Id', 'Name', 'Website', 'OwnerId'],
  supportsCustomFields: true,
  requiredScopes: [],
  optionalScopes: [],
  capabilities: {
    supportsRefreshToken: false,
    supportsMetadataDiscovery: true,
    supportsIncrementalSync: false,
    supportsWebhooks: false,
  },
  limitations: [
    'Teste real mínimo disponível com token temporário e URL da instância.',
    'Sem OAuth completo permanente, sync ou writeback nesta etapa.',
  ],
  warning: 'Salesforce já aceita teste real mínimo, sem persistência durável de credenciais.',
  nextRecommendedStep: 'Evoluir o fluxo seguro para OAuth completo após o teste mínimo.',
};
