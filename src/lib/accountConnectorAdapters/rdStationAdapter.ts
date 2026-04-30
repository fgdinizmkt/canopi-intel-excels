import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const rdStationAdapter: AccountConnectorAdapterDefinition = {
  provider: 'rd_station',
  label: 'RD Station CRM',
  surfaceKind: 'shell_preset',
  authType: 'api_token',
  priorityObjectsForFirstTest: ['organizations'],
  futureObjectsPlanned: ['contacts', 'deals'],
  minimumExpectedFields: ['id', 'name', 'website', 'user_id'],
  supportsCustomFields: true,
  requiredScopes: ['permissão/token de leitura a confirmar'],
  optionalScopes: ['escopo de escrita a confirmar', 'escopo de webhook a confirmar'],
  capabilities: {
    supportsRefreshToken: false,
    supportsMetadataDiscovery: true,
    supportsIncrementalSync: true,
    supportsWebhooks: false,
  },
  limitations: [
    'Preset local ainda sem validação contra ambiente externo.',
    'Sem política de rotação de token no frontend local.',
  ],
  warning: 'RD Station permanece como preset local nesta versão.',
  nextRecommendedStep: 'Preset local disponível nesta versão.',
};
