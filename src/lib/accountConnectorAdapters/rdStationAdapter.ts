import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const rdStationAdapter: AccountConnectorAdapterDefinition = {
  provider: 'rd_station',
  label: 'RD Station CRM',
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
    'Token real ainda não validado contra ambiente externo.',
    'Sem política de rotação de token no frontend local.',
  ],
  warning: 'RD Station segue como contrato de conexão futura sem autenticação real.',
  nextRecommendedStep: 'Definir adapter de token, endpoint de teste e política de erro/expiração.',
};
