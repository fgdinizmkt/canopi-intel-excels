import type { ConnectorType } from '@/src/lib/contaConnectorsV2';

export type AccountConnectorProvider = ConnectorType;

export type AccountAuthType =
  | 'oauth2_authorization_code'
  | 'private_app_token'
  | 'api_token'
  | 'bearer_token'
  | 'basic_auth'
  | 'none';

export type AccountConnectionStatus =
  | 'not_configured'
  | 'local_setup_only'
  | 'credentials_required'
  | 'ready_to_test'
  | 'testing'
  | 'connected'
  | 'token_expired'
  | 'refresh_failed'
  | 'connection_error'
  | 'disconnected';

export type AccountSyncStatus =
  | 'not_available'
  | 'not_configured'
  | 'ready'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'stale';

export type AccountMetadataStatus =
  | 'not_discovered'
  | 'ready_to_discover'
  | 'discovering'
  | 'discovered'
  | 'failed';

export type AccountCredentialStatus =
  | 'not_required'
  | 'missing'
  | 'not_collected_in_this_recorte'
  | 'valid'
  | 'expired'
  | 'refresh_available'
  | 'refresh_failed'
  | 'invalid';

export interface AccountRealConnectionContract {
  provider: AccountConnectorProvider;
  providerLabel: string;
  authType: AccountAuthType;
  connectionStatus: AccountConnectionStatus;
  credentialStatus: AccountCredentialStatus;
  metadataStatus: AccountMetadataStatus;
  syncStatus: AccountSyncStatus;
  requiredScopes: string[];
  optionalScopes: string[];
  grantedScopes: string[];
  missingScopes: string[];
  supportsRefreshToken: boolean;
  supportsMetadataDiscovery: boolean;
  supportsCustomFields: boolean;
  supportsIncrementalSync: boolean;
  supportsWebhooks: boolean;
  lastConnectionTestAt: string | null;
  lastSuccessfulRefreshAt: string | null;
  lastSyncAt: string | null;
  dataConfidence: number;
  coverage: number;
  warnings: string[];
  blockers: string[];
  nextRecommendedStep?: string;
}

export interface AccountConnectorAdapterDefinition {
  provider: AccountConnectorProvider;
  label: string;
  authType: AccountAuthType;
  priorityObjectsForFirstTest: string[];
  futureObjectsPlanned: string[];
  minimumExpectedFields: string[];
  supportsCustomFields: boolean;
  requiredScopes: string[];
  optionalScopes: string[];
  capabilities: {
    supportsRefreshToken: boolean;
    supportsMetadataDiscovery: boolean;
    supportsIncrementalSync: boolean;
    supportsWebhooks: boolean;
  };
  limitations: string[];
  warning: string;
  nextRecommendedStep: string;
}

interface BuildContractOptions {
  hasLocalSetup: boolean;
}

export function buildInitialRealConnectionContract(
  adapter: AccountConnectorAdapterDefinition,
  options: BuildContractOptions
): AccountRealConnectionContract {
  const { hasLocalSetup } = options;
  const isCsv = adapter.provider === 'csv_upload';
  const hasAuth = adapter.authType !== 'none';

  const connectionStatus: AccountConnectionStatus = hasLocalSetup
    ? (hasAuth ? 'credentials_required' : 'local_setup_only')
    : 'local_setup_only';

  const credentialStatus: AccountCredentialStatus = hasAuth
    ? (hasLocalSetup ? 'not_collected_in_this_recorte' : 'missing')
    : 'not_required';

  const metadataStatus: AccountMetadataStatus = hasLocalSetup && adapter.capabilities.supportsMetadataDiscovery
    ? 'ready_to_discover'
    : 'not_discovered';

  const syncStatus: AccountSyncStatus = isCsv
    ? 'not_available'
    : (hasLocalSetup ? 'not_configured' : 'not_configured');

  const blockers = hasAuth
    ? ['Credenciais reais ainda não configuradas neste recorte C1.']
    : [];

  return {
    provider: adapter.provider,
    providerLabel: adapter.label,
    authType: adapter.authType,
    connectionStatus,
    credentialStatus,
    metadataStatus,
    syncStatus,
    requiredScopes: adapter.requiredScopes,
    optionalScopes: adapter.optionalScopes,
    grantedScopes: [],
    missingScopes: [...adapter.requiredScopes],
    supportsRefreshToken: adapter.capabilities.supportsRefreshToken,
    supportsMetadataDiscovery: adapter.capabilities.supportsMetadataDiscovery,
    supportsCustomFields: adapter.supportsCustomFields,
    supportsIncrementalSync: adapter.capabilities.supportsIncrementalSync,
    supportsWebhooks: adapter.capabilities.supportsWebhooks,
    lastConnectionTestAt: null,
    lastSuccessfulRefreshAt: null,
    lastSyncAt: null,
    dataConfidence: hasLocalSetup ? 30 : 10,
    coverage: hasLocalSetup ? 35 : 15,
    warnings: [
      adapter.warning,
      'Modelo declarativo de arquitetura futura. Nenhuma credencial real é usada neste recorte.',
    ],
    blockers,
    nextRecommendedStep: adapter.nextRecommendedStep,
  };
}
