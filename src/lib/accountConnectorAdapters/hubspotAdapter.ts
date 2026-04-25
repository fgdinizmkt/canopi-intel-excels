import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const hubspotAdapter: AccountConnectorAdapterDefinition = {
  provider: 'hubspot',
  label: 'HubSpot',
  authType: 'private_app_token',
  priorityObjectsForFirstTest: ['companies'],
  futureObjectsPlanned: ['contacts', 'deals', 'owners', 'pipelines', 'properties'],
  minimumExpectedFields: ['hs_object_id', 'name', 'domain', 'hubspot_owner_id'],
  supportsCustomFields: true,
  requiredScopes: ['crm.objects.companies.read'],
  optionalScopes: ['crm.objects.companies.write', 'crm.schemas.companies.read'],
  capabilities: {
    supportsRefreshToken: false,
    supportsMetadataDiscovery: true,
    supportsIncrementalSync: true,
    supportsWebhooks: true,
  },
  limitations: [
    'Token real ainda não solicitado ou armazenado.',
    'Sem teste real de escopos e limites de API neste recorte.',
  ],
  warning: 'HubSpot no C1 usa apenas contrato declarativo de conexão futura.',
  nextRecommendedStep: 'Definir fluxo seguro de token e teste de acesso mínimo por escopo.',
};
