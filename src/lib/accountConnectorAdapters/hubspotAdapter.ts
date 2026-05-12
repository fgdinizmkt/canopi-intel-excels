import type { AccountConnectorAdapterDefinition } from '@/src/lib/accountConnectionModel';

export const hubspotAdapter: AccountConnectorAdapterDefinition = {
  provider: 'hubspot',
  label: 'HubSpot',
  surfaceKind: 'functional_real',
  authType: 'private_app_token',
  priorityObjectsForFirstTest: ['companies'],
  futureObjectsPlanned: ['contacts', 'deals', 'owners', 'pipelines', 'properties'],
  minimumExpectedFields: ['hs_object_id', 'name', 'domain', 'hubspot_owner_id'],
  supportsCustomFields: true,
  requiredScopes: ['crm.objects.companies.read'],
  optionalScopes: ['crm.schemas.companies.read'],
  capabilities: {
    supportsRefreshToken: false,
    supportsMetadataDiscovery: true,
    supportsIncrementalSync: false,
    supportsWebhooks: false,
  },
  limitations: [
    'Token real ainda não solicitado ou armazenado nesta versão.',
    'Sem teste real de escopos e limites de API nesta versão.',
  ],
  warning: 'HubSpot nesta versão já expõe conexão real mínima, preview read-only e schema discovery.',
  nextRecommendedStep: 'Conexão real mínima, preview read-only e schema discovery disponíveis nesta versão.',
};
