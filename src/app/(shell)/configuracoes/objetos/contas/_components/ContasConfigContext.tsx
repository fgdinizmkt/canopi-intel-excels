'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { 
  type ConnectorType, 
  type FieldMapping,
  CONNECTOR_PRESETS,
  CONTA_CANONICAL_FIELDS_MINIMUM
} from '@/src/lib/contaConnectorsV2';
import {
  type AccountRealConnectionContract,
  buildInitialRealConnectionContract,
} from '@/src/lib/accountConnectionModel';
import { getAccountConnectorAdapter } from '@/src/lib/accountConnectorAdapters';
import type { CsvUploadMeta } from '@/src/lib/parseCsvLocal';

// --- SESSION PERSISTENCE ---

const SESSION_KEY = 'canopi_contas_v2_config';

function loadSession(): { selectedConnector: ConnectorType | null; customConfig: Record<string, any> } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- TYPES ---

export interface AccountConfigBlocker {
  id: string;
  section: string;
  sectionSlug: string;
  severity: 'hard' | 'soft';
  message: string;
  consequence: string;
  action: string;
}

export interface ContasConfigStepStatus {
  slug: string;
  label: string;
  href: string;
  status: 'locked' | 'pending' | 'configured' | 'blocked' | 'optional';
  prerequisite: string;
  impact: string;
  blockers: AccountConfigBlocker[];
}

export function getAccountConfigBlockers(state: any): AccountConfigBlocker[] {
  const { selectedConnector, baseLegal, conta, customConfig, CONTA_CANONICAL_FIELDS_MINIMUM } = state;
  const list: AccountConfigBlocker[] = [];
  const preset = selectedConnector ? CONNECTOR_PRESETS[selectedConnector] : null;
  const rawInputMethod = selectedConnector ? customConfig.inputMethodByProvider?.[selectedConnector] ?? null : null;
  const selectedInputMethod = selectedConnector === 'hubspot'
    ? (rawInputMethod && rawInputMethod !== 'not_selected' ? rawInputMethod : null)
    : (rawInputMethod ?? 'csv_upload');
  const isHubspotMethodPending = selectedConnector === 'hubspot' && !selectedInputMethod;
  const isHubspotApiInput = selectedConnector === 'hubspot' && selectedInputMethod === 'private_app_token';
  const hubspotConnectionTestStatus = selectedConnector ? customConfig.connectionTestStatusByProvider?.[selectedConnector] ?? 'idle' : 'idle';

  // 1. CONECTOR_MISSING
  if (!selectedConnector) {
      list.push({
        id: 'CONECTOR_MISSING',
        section: 'Fontes',
        sectionSlug: 'fontes-conectores',
        severity: 'hard',
        message: 'Nenhum conector selecionado',
        consequence: 'Bloqueia a ingestão de dados.',
      action: 'Selecione uma fonte nativa ou CSV.'
    });
  }

  // 1b. SOURCE_CONFIG_NOT_VALIDATED
  if (selectedConnector && !isHubspotMethodPending && (
    (isHubspotApiInput && hubspotConnectionTestStatus !== 'success') ||
    (!isHubspotApiInput && !state.connectorLocalValidated)
  )) {
    list.push({
      id: 'SOURCE_CONFIG_NOT_VALIDATED',
      section: 'Fontes e Conectores',
      sectionSlug: 'fontes-conectores',
      severity: 'hard',
      message: 'Contrato local de leitura não validado',
      consequence: 'Fonte selecionada mas sem validação do contrato de ingestão nesta sessão.',
      action: 'Selecione uma fonte e valide o contrato local de leitura antes de publicar.'
    });
  }

  // 2. CONNECTOR_INCOMPLETE
  if (selectedConnector && preset && selectedConnector !== 'other_crm') {
    const isMissingInfo = !preset.nativeObject || !preset.identity.nativePrimaryKey || preset.requiredFields.length === 0;
    if (!preset.isComplete || isMissingInfo) {
      list.push({
        id: 'CONNECTOR_INCOMPLETE',
        section: 'Fontes',
        sectionSlug: 'fontes-conectores',
        severity: 'hard',
        message: 'Configuração do conector incompleta',
        consequence: 'Pode causar erro na extração de campos obrigatórios.',
        action: 'Revise os campos obrigatórios e o objeto nativo.'
      });
    }
  }

  // 3. LGPD_LEGAL_BASIS_MISSING
  const requiresLgpd = (selectedConnector
    ? customConfig.inputMethodByProvider?.[selectedConnector] === 'csv_upload'
    : false) || (preset?.lgpdRisk === 'high');
  if (requiresLgpd && !baseLegal) {
      list.push({
        id: 'LGPD_LEGAL_BASIS_MISSING',
        section: 'Upload e LGPD',
        sectionSlug: 'upload-lgpd',
        severity: 'hard',
        message: 'Base legal não definida',
        consequence: 'Risco de desconformidade jurídica (LGPD).',
      action: 'Declare a base legal na seção de LGPD.'
    });
  }

  // 4. IDENTITY_CONFLICT
  const pk = conta.primaryKeys || [];
  if (selectedConnector && (pk.length === 0 || !pk[0])) {
      list.push({
        id: 'IDENTITY_CONFLICT',
        section: 'Identidade',
        sectionSlug: 'identidade-dedupe',
        severity: 'hard',
        message: 'Nenhuma chave primária ativa',
        consequence: 'Causará duplicidade crítica na base Alpha.',
      action: 'Selecione ao menos um campo de identidade nativo.'
    });
  }

  // 5. CANONICAL_MAPPING_INCOMPLETE
  if (selectedConnector) {
    const mappedCanonicalFields = conta.fieldMappings.map((m: any) => m.canonicalField);
    const missingFields = CONTA_CANONICAL_FIELDS_MINIMUM.filter((f: string) => !mappedCanonicalFields.includes(f));
    
    if (missingFields.length > 0) {
      list.push({
        id: 'CANONICAL_MAPPING_INCOMPLETE',
        section: 'Camada Canônica',
        sectionSlug: 'camada-canonica',
        severity: 'hard',
        message: `Mapeamento canônico incompleto: ${missingFields.length} campos faltantes`,
        consequence: 'Dutos de inteligência (ABM/ABX) ficarão offline.',
        action: `Mapeie: ${missingFields.join(', ')}`
      });
    }
  }

  // 6. WRITEBACK_UNSAFE
  if (customConfig.writebackEnabled) {
    const hasSafePolicy = ['append', 'manual_review'].includes(conta.conflictPolicy);
    if (!conta.writebackTarget || !hasSafePolicy) {
      list.push({
        id: 'WRITEBACK_UNSAFE',
        section: 'Writeback',
        sectionSlug: 'writeback',
        severity: 'hard',
        message: 'Configuração de Writeback insegura',
        consequence: 'Risco de corrupção de dados no CRM de origem.',
        action: 'Defina política Append-only ou Manual Review.'
      });
    }
  }

  // 7. CUSTOM_CONNECTOR_INCOMPLETE
  if (selectedConnector === 'other_crm') {
    const isCustomMissing = !customConfig.customName ||
                            !customConfig.customNativeObject ||
                            !customConfig.customPrimaryKey;
    if (isCustomMissing) {
      list.push({
        id: 'CUSTOM_CONNECTOR_INCOMPLETE',
        section: 'Fontes',
        sectionSlug: 'fontes-conectores',
        severity: 'hard',
        message: 'Conector customizado incompleto',
        consequence: 'Impossível iniciar o setup sem nome da ferramenta, objeto de contas e chave primária.',
        action: 'Informe: Nome da ferramenta, Objeto/entidade de contas e Chave primária nativa.'
      });
    }
  }

  return list;
}

interface ContasConfigContextType {
  selectedConnector: ConnectorType | null;
  setConnector: (type: ConnectorType | null) => void;
  conta: {
    connectorType: ConnectorType | null;
    nativeObject: string;
    primaryKey: string;
    secondaryKeys: string[];
    requiredFields: string[];
    conflictPolicy: string;
    supportsWriteback: boolean;
    writebackTarget: string;
    confidenceScore: number;
    customName?: string;
    fieldMappings: FieldMapping[];
    primaryKeys: string[];
  };
  updateCustomConfig: (updates: any) => void;
  isSaving: boolean;
  save: () => Promise<void>;
  registerLocalSourceSaveHandler: (handler: (() => void) | null) => void;
  canSaveLocalSourceSetup: boolean;
  setCanSaveLocalSourceSetup: (val: boolean) => void;
  canConcludeLocalSetup: boolean;
  accountSourcesStepCompleted: boolean;
  setAccountSourcesStepCompleted: (val: boolean) => void;
  hubspotConnectionStepCompleted: boolean;
  setHubspotConnectionStepCompleted: (val: boolean) => void;
  completeLocalSetup: () => void;
  blockers: AccountConfigBlocker[];
  stepStatus: ContasConfigStepStatus[];
  readinessScore: number;
  canPublish: boolean;
  baseLegal: string;
  setBaseLegal: (val: string) => void;
  customConfig: any;
  connectorLocalValidated: boolean;
  setConnectorLocalValidated: (val: boolean) => void;
  csvUploadMeta: CsvUploadMeta | null;
  inputMethodDraftByProvider: Record<string, string | null>;
  setInputMethodDraftForProvider: (provider: ConnectorType, method: string | null) => void;
  canonicalMapping: FieldMapping[];
  canonicalMappingReviewed: boolean;
  updateCanonicalMappingField: (canonicalField: string, updates: Partial<FieldMapping>) => void;
  setCanonicalMappingReviewed: (val: boolean) => void;
  resetCanonicalMappingToPreset: () => void;
  realConnectionContract: AccountRealConnectionContract | null;
}

const ContasConfigContext = createContext<ContasConfigContextType | undefined>(undefined);

export const ContasConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType | null>(() => {
    return (loadSession()?.selectedConnector ?? null) as ConnectorType | null;
  });
  const [baseLegal, setBaseLegal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [inputMethodDraftByProvider, setInputMethodDraftByProvider] = useState<Record<string, string | null>>({});

  const DEFAULT_CUSTOM_CONFIG = {
    fieldMappings: [] as FieldMapping[],
    canonicalMapping: [] as FieldMapping[],
    canonicalMappingReviewed: false,
    primaryKeys: [] as string[],
    writebackEnabled: false,
    writebackTarget: '',
    customName: '',
    customNativeObject: '',
    customPrimaryKey: '',
    customSecondaryKeys: [] as string[],
    customRequiredFields: [] as string[],
    customConflictPolicy: 'manual_review',
    customSupportsWriteback: false,
    customWritebackTargets: [] as string[],
    customConfidence: 0,
    connectorLocalValidated: false,
    accountSourcesStepCompleted: false,
    hubspotConnectionStepCompleted: false,
    localSourceSavedAt: null as string | null,
    localContractValidatedAt: null as string | null,
    accountSourcesStepCompletedAt: null as string | null,
    hubspotConnectionStepCompletedAt: null as string | null,
    localSourceConfig: undefined as Record<string, unknown> | undefined,
    localSourceConfigByProvider: {} as Record<string, unknown>,
    inputMethodByProvider: {} as Record<string, string>,
    csvUploadMeta: null as CsvUploadMeta | null,
    csvUploadMetaByProvider: {} as Record<string, CsvUploadMeta | null>,
    connectionTestStatusByProvider: {} as Record<string, 'idle' | 'testing' | 'success' | 'error'>,
    connectionTestMetaByProvider: {} as Record<string, {
      provider: string;
      testedAt: string;
      hubId: string | null;
      scopes: string[];
      readAccessConfirmed: boolean;
    } | null>,
    connectionTestErrorByProvider: {} as Record<string, string | null>,
    lastConnectionTestAtByProvider: {} as Record<string, string | null>,
    connectorLocalValidatedByProvider: {} as Record<string, boolean>,
    accountSourcesStepCompletedByProvider: {} as Record<string, boolean>,
    hubspotConnectionStepCompletedByProvider: {} as Record<string, boolean>,
    localSourceSavedAtByProvider: {} as Record<string, string | null>,
    localContractValidatedAtByProvider: {} as Record<string, string | null>,
    accountSourcesStepCompletedAtByProvider: {} as Record<string, string | null>,
    hubspotConnectionStepCompletedAtByProvider: {} as Record<string, string | null>,
  };

  const [customConfig, setCustomConfig] = useState(() => {
    const session = loadSession();
    const initialConfig = session?.customConfig ? { ...DEFAULT_CUSTOM_CONFIG, ...session.customConfig } : DEFAULT_CUSTOM_CONFIG;
    const initialHubspotMethod = initialConfig.inputMethodByProvider?.hubspot;
    const hasHubspotCompletion =
      Boolean(initialConfig.hubspotConnectionStepCompletedByProvider?.hubspot)
      || initialConfig.connectionTestStatusByProvider?.hubspot === 'success';

    if (initialHubspotMethod === 'private_app_token' && !hasHubspotCompletion) {
      return {
        ...initialConfig,
        inputMethodByProvider: {
          ...(initialConfig.inputMethodByProvider || {}),
          hubspot: 'not_selected',
        },
      };
    }

    return initialConfig;
  });
  const [localSourceSaveHandler, setLocalSourceSaveHandler] = useState<(() => void) | null>(null);
  const [canSaveLocalSourceSetup, setCanSaveLocalSourceSetup] = useState(false);

  const setConnector = (type: ConnectorType | null) => {
    setSelectedConnector(type);
    if (!type) {
      setInputMethodDraftByProvider({});
    } else {
      setInputMethodDraftByProvider((prev) => ({
        ...prev,
        [type]: null,
      }));
    }
    if (!type) {
      setCustomConfig((prev: any) => ({
        ...prev,
        csvUploadMeta: null,
        accountSourcesStepCompleted: false,
        hubspotConnectionStepCompleted: false,
        localSourceSavedAt: null,
        localContractValidatedAt: null,
        accountSourcesStepCompletedAt: null,
        hubspotConnectionStepCompletedAt: null,
        connectorLocalValidated: false,
      }));
      return;
    }

    const preset = CONNECTOR_PRESETS[type];
    setCustomConfig((prev: any) => {
      const inputMethodByProvider = {
        ...(prev.inputMethodByProvider || {}),
        [type]: prev.inputMethodByProvider?.[type] || (type === 'hubspot' ? 'not_selected' : 'csv_upload'),
      };
      const connectorLocalValidatedByProvider = {
        ...(prev.connectorLocalValidatedByProvider || {}),
        [type]: prev.connectorLocalValidatedByProvider?.[type] ?? false,
      };
      const accountSourcesStepCompletedByProvider = {
        ...(prev.accountSourcesStepCompletedByProvider || {}),
        [type]: prev.accountSourcesStepCompletedByProvider?.[type] ?? false,
      };
      const hubspotConnectionStepCompletedByProvider = {
        ...(prev.hubspotConnectionStepCompletedByProvider || {}),
        [type]: prev.hubspotConnectionStepCompletedByProvider?.[type] ?? false,
      };
      const localSourceSavedAtByProvider = {
        ...(prev.localSourceSavedAtByProvider || {}),
        [type]: prev.localSourceSavedAtByProvider?.[type] ?? null,
      };
      const localContractValidatedAtByProvider = {
        ...(prev.localContractValidatedAtByProvider || {}),
        [type]: prev.localContractValidatedAtByProvider?.[type] ?? null,
      };
      const accountSourcesStepCompletedAtByProvider = {
        ...(prev.accountSourcesStepCompletedAtByProvider || {}),
        [type]: prev.accountSourcesStepCompletedAtByProvider?.[type] ?? null,
      };
      const hubspotConnectionStepCompletedAtByProvider = {
        ...(prev.hubspotConnectionStepCompletedAtByProvider || {}),
        [type]: prev.hubspotConnectionStepCompletedAtByProvider?.[type] ?? null,
      };
      const csvUploadMetaByProvider = {
        ...(prev.csvUploadMetaByProvider || {}),
        [type]: prev.csvUploadMetaByProvider?.[type] ?? null,
      };
      return {
        ...prev,
        inputMethodByProvider,
        csvUploadMetaByProvider,
        connectorLocalValidatedByProvider,
        accountSourcesStepCompletedByProvider,
        hubspotConnectionStepCompletedByProvider,
        localSourceSavedAtByProvider,
        localContractValidatedAtByProvider,
        accountSourcesStepCompletedAtByProvider,
        hubspotConnectionStepCompletedAtByProvider,
        csvUploadMeta: csvUploadMetaByProvider[type] ?? null,
        accountSourcesStepCompleted: accountSourcesStepCompletedByProvider[type] ?? false,
        hubspotConnectionStepCompleted: hubspotConnectionStepCompletedByProvider[type] ?? false,
        localSourceSavedAt: localSourceSavedAtByProvider[type] ?? null,
        localContractValidatedAt: localContractValidatedAtByProvider[type] ?? null,
        accountSourcesStepCompletedAt: accountSourcesStepCompletedAtByProvider[type] ?? null,
        hubspotConnectionStepCompletedAt: hubspotConnectionStepCompletedAtByProvider[type] ?? null,
        fieldMappings: preset?.fieldMappings || [],
        canonicalMapping: preset?.fieldMappings || [],
        canonicalMappingReviewed: false,
        primaryKeys: preset?.identity ? [preset.identity.nativePrimaryKey] : [],
        customName: type === 'other_crm' ? '' : (preset?.name || ''),
        customNativeObject: type === 'other_crm' ? '' : (preset?.nativeObject || ''),
        customPrimaryKey: type === 'other_crm' ? '' : (preset?.identity.nativePrimaryKey || ''),
        customSecondaryKeys: type === 'other_crm' ? [] : (preset?.identity.nativeSecondaryKeys || []),
        customRequiredFields: type === 'other_crm' ? [] : (preset?.requiredFields || []),
        customConflictPolicy: type === 'other_crm' ? 'manual_review' : (preset?.conflictPolicy || 'manual_review'),
        customSupportsWriteback: type === 'other_crm' ? false : (preset?.supportsWriteback || false),
        customWritebackTargets: type === 'other_crm' ? [] : (preset?.writebackTargets || []),
        customConfidence: type === 'other_crm' ? 0 : (preset?.identity.confidenceScore || 0),
        writebackEnabled: false,
        writebackTarget: type === 'other_crm' ? '' : (preset?.writebackTargets?.[0] || ''),
        connectorLocalValidated: connectorLocalValidatedByProvider[type] ?? false,
      };
    });
  };

  const updateCustomConfig = useCallback((updates: any) => {
    setCustomConfig(prev => (typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }));
  }, []);

  const registerLocalSourceSaveHandler = useCallback((handler: (() => void) | null) => {
    setLocalSourceSaveHandler(() => handler);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ selectedConnector, customConfig }));
    } catch {}
  }, [selectedConnector, customConfig]);

  const connectorLocalValidated = customConfig.connectorLocalValidated ?? false;
  const setConnectorLocalValidated = (val: boolean) => {
    updateCustomConfig((prev: any) => ({
      ...prev,
      connectorLocalValidated: val,
      connectorLocalValidatedByProvider: selectedConnector
        ? {
            ...(prev.connectorLocalValidatedByProvider || {}),
            [selectedConnector]: val,
          }
        : prev.connectorLocalValidatedByProvider,
    }));
  };
  const accountSourcesStepCompleted = customConfig.accountSourcesStepCompleted ?? false;
  const setAccountSourcesStepCompleted = (val: boolean) => {
    updateCustomConfig((prev: any) => ({
      ...prev,
      accountSourcesStepCompleted: val,
      accountSourcesStepCompletedByProvider: selectedConnector
        ? {
            ...(prev.accountSourcesStepCompletedByProvider || {}),
            [selectedConnector]: val,
          }
        : prev.accountSourcesStepCompletedByProvider,
    }));
  };
  const hubspotConnectionStepCompleted = customConfig.hubspotConnectionStepCompleted ?? false;
  const setInputMethodDraftForProvider = (provider: ConnectorType, method: string | null) => {
    setInputMethodDraftByProvider((prev) => ({
      ...prev,
      [provider]: method,
    }));
  };
  const setHubspotConnectionStepCompleted = (val: boolean) => {
    updateCustomConfig((prev: any) => ({
      ...prev,
      hubspotConnectionStepCompleted: val,
      hubspotConnectionStepCompletedByProvider: selectedConnector
        ? {
            ...(prev.hubspotConnectionStepCompletedByProvider || {}),
            [selectedConnector]: val,
          }
        : prev.hubspotConnectionStepCompletedByProvider,
    }));
  };
  const completeLocalSetup = useCallback(() => {
    const now = new Date().toISOString();
    const selectedInputMethod = selectedConnector ? customConfig.inputMethodByProvider?.[selectedConnector] ?? 'csv_upload' : 'csv_upload';
    const isHubspotApiInput = selectedConnector === 'hubspot' && selectedInputMethod === 'private_app_token';
    updateCustomConfig((prev: any) => ({
      ...prev,
      ...(isHubspotApiInput
        ? {
            hubspotConnectionStepCompleted: true,
            hubspotConnectionStepCompletedAt: now,
            hubspotConnectionStepCompletedByProvider: selectedConnector
              ? {
                  ...(prev.hubspotConnectionStepCompletedByProvider || {}),
                  [selectedConnector]: true,
                }
              : prev.hubspotConnectionStepCompletedByProvider,
            hubspotConnectionStepCompletedAtByProvider: selectedConnector
              ? {
                  ...(prev.hubspotConnectionStepCompletedAtByProvider || {}),
                  [selectedConnector]: now,
                }
              : prev.hubspotConnectionStepCompletedAtByProvider,
          }
        : {
            accountSourcesStepCompleted: true,
            accountSourcesStepCompletedAt: now,
            accountSourcesStepCompletedByProvider: selectedConnector
              ? {
                  ...(prev.accountSourcesStepCompletedByProvider || {}),
                  [selectedConnector]: true,
                }
              : prev.accountSourcesStepCompletedByProvider,
            accountSourcesStepCompletedAtByProvider: selectedConnector
              ? {
                  ...(prev.accountSourcesStepCompletedAtByProvider || {}),
                  [selectedConnector]: now,
                }
              : prev.accountSourcesStepCompletedAtByProvider,
          }),
    }));
  }, [customConfig.inputMethodByProvider, selectedConnector, updateCustomConfig]);

  useEffect(() => {
    if (!selectedConnector) return;
    updateCustomConfig((prev: any) => ({
      ...prev,
      connectorLocalValidated: prev.connectorLocalValidatedByProvider?.[selectedConnector] ?? false,
      accountSourcesStepCompleted: prev.accountSourcesStepCompletedByProvider?.[selectedConnector] ?? false,
      hubspotConnectionStepCompleted: prev.hubspotConnectionStepCompletedByProvider?.[selectedConnector] ?? false,
      localSourceSavedAt: prev.localSourceSavedAtByProvider?.[selectedConnector] ?? null,
      localContractValidatedAt: prev.localContractValidatedAtByProvider?.[selectedConnector] ?? null,
      accountSourcesStepCompletedAt: prev.accountSourcesStepCompletedAtByProvider?.[selectedConnector] ?? null,
      hubspotConnectionStepCompletedAt: prev.hubspotConnectionStepCompletedAtByProvider?.[selectedConnector] ?? null,
      csvUploadMeta: prev.csvUploadMetaByProvider?.[selectedConnector] ?? null,
    }));
  }, [selectedConnector, updateCustomConfig]);

  const resolvedCanonicalMapping = useMemo(() => {
    const presetMappings = selectedConnector ? (CONNECTOR_PRESETS[selectedConnector]?.fieldMappings || []) : [];
    if (customConfig.canonicalMapping.length > 0) return customConfig.canonicalMapping;
    if (customConfig.fieldMappings.length > 0) return customConfig.fieldMappings;
    return presetMappings;
  }, [customConfig.canonicalMapping, customConfig.fieldMappings, selectedConnector]);

  const canonicalMappingReviewed = customConfig.canonicalMappingReviewed ?? false;

  const updateCanonicalMappingField = (canonicalField: string, updates: Partial<FieldMapping>) => {
    const nextMappings = resolvedCanonicalMapping.map((mapping: FieldMapping) =>
      mapping.canonicalField === canonicalField ? { ...mapping, ...updates } : mapping
    );
    updateCustomConfig({
      canonicalMapping: nextMappings,
      fieldMappings: nextMappings,
      canonicalMappingReviewed: false,
    });
  };

  const setCanonicalMappingReviewed = (val: boolean) => {
    updateCustomConfig({ canonicalMappingReviewed: val });
  };

  const resetCanonicalMappingToPreset = () => {
    if (!selectedConnector) return;
    const presetMappings = CONNECTOR_PRESETS[selectedConnector]?.fieldMappings || [];
    updateCustomConfig({
      canonicalMapping: presetMappings,
      fieldMappings: presetMappings,
      canonicalMappingReviewed: false,
    });
  };

  const conta = useMemo(() => {
    const preset = selectedConnector ? CONNECTOR_PRESETS[selectedConnector] : null;
    
    return {
      connectorType: selectedConnector,
      nativeObject: selectedConnector === 'other_crm' ? customConfig.customNativeObject : (preset?.nativeObject || ''),
      primaryKey: selectedConnector === 'other_crm' ? customConfig.customPrimaryKey : (preset?.identity.nativePrimaryKey || ''),
      secondaryKeys: selectedConnector === 'other_crm' ? customConfig.customSecondaryKeys : (preset?.identity.nativeSecondaryKeys || []),
      requiredFields: selectedConnector === 'other_crm' ? customConfig.customRequiredFields : (preset?.requiredFields || []),
      conflictPolicy: selectedConnector === 'other_crm' ? customConfig.customConflictPolicy : (preset?.conflictPolicy || 'manual_review'),
      supportsWriteback: selectedConnector === 'other_crm' ? customConfig.customSupportsWriteback : (preset?.supportsWriteback || false),
      writebackTarget: customConfig.writebackTarget,
      confidenceScore: selectedConnector === 'other_crm' ? customConfig.customConfidence : (preset?.identity.confidenceScore || 0),
      customName: customConfig.customName || preset?.name || '',
      fieldMappings: resolvedCanonicalMapping,
      primaryKeys: customConfig.primaryKeys.length > 0 
        ? customConfig.primaryKeys 
        : (preset?.identity ? [preset.identity.nativePrimaryKey] : []),
    };
  }, [selectedConnector, customConfig, resolvedCanonicalMapping]);

  const blockers = useMemo(() => {
    return getAccountConfigBlockers({
      selectedConnector,
      baseLegal,
      conta,
      customConfig,
      CONTA_CANONICAL_FIELDS_MINIMUM,
      connectorLocalValidated,
      canonicalMappingReviewed,
    });
  }, [selectedConnector, baseLegal, conta, customConfig, connectorLocalValidated, canonicalMappingReviewed]);

  const readinessScore = useMemo(() => {
    const hardBlockers = blockers.filter(b => b.severity === 'hard').length;
    if (hardBlockers > 0) return Math.max(0, 100 - (hardBlockers * 20));
    return 100;
  }, [blockers]);

  const canPublish = useMemo(() => {
    return blockers.filter(b => b.severity === 'hard').length === 0;
  }, [blockers]);
  const canConcludeLocalSetup = useMemo(() => {
    if (!selectedConnector) return false;
  const selectedInputMethod = selectedConnector === 'hubspot'
    ? (customConfig.inputMethodByProvider?.[selectedConnector] && customConfig.inputMethodByProvider?.[selectedConnector] !== 'not_selected'
      ? customConfig.inputMethodByProvider?.[selectedConnector]
      : null)
    : (customConfig.inputMethodByProvider?.[selectedConnector] ?? 'csv_upload');
  const isHubspotApiInput = selectedConnector === 'hubspot' && selectedInputMethod === 'private_app_token';
  const isHubspotMethodPending = selectedConnector === 'hubspot' && !selectedInputMethod;
    if (isHubspotApiInput) {
      return customConfig.connectionTestStatusByProvider?.[selectedConnector] === 'success'
        && !hubspotConnectionStepCompleted;
    }
    if (isHubspotMethodPending) {
      return false;
    }
    if (selectedInputMethod === 'csv_upload') {
      return connectorLocalValidated
        && customConfig.csvUploadMeta?.validationResult?.isValid === true
        && !accountSourcesStepCompleted;
    }
    return connectorLocalValidated && !accountSourcesStepCompleted;
  }, [
    accountSourcesStepCompleted,
    connectorLocalValidated,
    customConfig.connectionTestStatusByProvider,
    customConfig.csvUploadMeta,
    customConfig.inputMethodByProvider,
    hubspotConnectionStepCompleted,
    selectedConnector,
  ]);

  const stepStatus = useMemo<ContasConfigStepStatus[]>(() => {
    const blockerMap = new Map<string, AccountConfigBlocker[]>();

    blockers.forEach((blocker) => {
      const stepSlug = blocker.sectionSlug || 'validacao-publicacao';
      const current = blockerMap.get(stepSlug) || [];
      blockerMap.set(stepSlug, [...current, blocker]);
    });

    const hasConnector = Boolean(selectedConnector);
    const activePrimaryKeys = (conta.primaryKeys || []).filter((key) => key.trim().length > 0);
    const hasIdentity = hasConnector && activePrimaryKeys.length > 0;
    const mappedCanonicalFields = conta.fieldMappings.map((mapping) => mapping.canonicalField);
    const providerKey = selectedConnector;
    const hasCanonicalMinimum =
      hasConnector &&
      CONTA_CANONICAL_FIELDS_MINIMUM.every((field) => mappedCanonicalFields.includes(field));
    const selectedInputMethod = providerKey === 'hubspot'
      ? (providerKey && customConfig.inputMethodByProvider?.[providerKey] && customConfig.inputMethodByProvider?.[providerKey] !== 'not_selected'
        ? customConfig.inputMethodByProvider?.[providerKey]
        : null)
      : (providerKey ? (customConfig.inputMethodByProvider?.[providerKey] ?? 'csv_upload') : 'csv_upload');
    const requiresLgpd = (providerKey ? CONNECTOR_PRESETS[providerKey]?.lgpdRisk === 'high' : false)
      || (selectedInputMethod === 'csv_upload');
    const hasClassifiableMappings = hasCanonicalMinimum && conta.fieldMappings.some((mapping) => mapping.isClassification);
    const canReviewWriteback = hasCanonicalMinimum && hasClassifiableMappings;

    const getStepBlockers = (slug: string) => blockerMap.get(slug) || [];

    return [
      {
        slug: 'visao-geral',
        label: '1. Visão Geral',
        href: '/configuracoes/objetos/contas/visao-geral',
        status: 'configured',
        prerequisite: 'Entrada livre',
        impact: 'Contextualiza o papel do objeto Contas antes da configuração.',
        blockers: [],
      },
      {
        slug: 'fontes-conectores',
        label: '2. Fontes e Conectores',
        href: '/configuracoes/objetos/contas/fontes-conectores',
        status: !hasConnector
          ? 'pending'
          : (selectedConnector === 'hubspot' && !selectedInputMethod)
            ? 'pending'
            : getStepBlockers('fontes-conectores').length > 0 ? 'blocked' : 'configured',
        prerequisite: 'Primeira etapa operacional.',
        impact: 'Define a fonte de verdade e desbloqueia o restante do setup.',
        blockers: getStepBlockers('fontes-conectores'),
      },
      {
        slug: 'identidade-dedupe',
        label: '3. Identidade e Dedupe',
        href: '/configuracoes/objetos/contas/identidade-dedupe',
        status: !hasConnector
          ? 'locked'
          : getStepBlockers('identidade-dedupe').length > 0
            ? 'blocked'
            : hasIdentity
              ? 'configured'
              : 'pending',
        prerequisite: 'Conector definido em Fontes e Conectores.',
        impact: 'Ativa chaves de identidade e evita duplicidade crítica.',
        blockers: getStepBlockers('identidade-dedupe'),
      },
      {
        slug: 'camada-canonica',
        label: '4. Camada Canônica',
        href: '/configuracoes/objetos/contas/camada-canonica',
        status: !hasIdentity
          ? 'locked'
          : getStepBlockers('camada-canonica').length > 0
            ? 'blocked'
            : hasCanonicalMinimum
              ? 'configured'
              : 'pending',
        prerequisite: 'Definir identidade mínima para validar o schema.',
        impact: 'Consolida os campos canônicos necessários para ABM/ABX.',
        blockers: getStepBlockers('camada-canonica'),
      },
      {
        slug: 'classificacao-abm-abx',
        label: '5. Classificação ABM / ABX',
        href: '/configuracoes/objetos/contas/classificacao-abm-abx',
        status: !hasCanonicalMinimum ? 'locked' : 'pending',
        prerequisite: 'Completar a Camada Canônica mínima para revisar os campos de classificação.',
        impact: hasClassifiableMappings
          ? 'Os campos classificatórios já existem no schema, mas esta etapa ainda depende de configuração funcional futura.'
          : 'Revisará os campos classificatórios que governam a inteligência da conta.',
        blockers: [],
      },
      {
        slug: 'writeback',
        label: '6. Writeback',
        href: '/configuracoes/objetos/contas/writeback',
        status: !canReviewWriteback
          ? 'locked'
          : getStepBlockers('writeback').length > 0
            ? 'blocked'
            : conta.supportsWriteback
              ? 'configured'
              : 'optional',
        prerequisite: 'Classificação disponível para revisão de retorno ao CRM.',
        impact: 'Revisa o retorno de campos Canopi para a fonte quando aplicável.',
        blockers: getStepBlockers('writeback'),
      },
      {
        slug: 'upload-lgpd',
        label: '7. Upload e LGPD',
        href: '/configuracoes/objetos/contas/upload-lgpd',
        status: !requiresLgpd
          ? 'optional'
          : getStepBlockers('upload-lgpd').length > 0
            ? 'blocked'
            : baseLegal
              ? 'configured'
              : 'pending',
        prerequisite: requiresLgpd ? 'Obrigatório quando a origem exigir base legal.' : 'Só se aplica a fluxos com risco LGPD elevado.',
        impact: 'Garante conformidade legal para cargas sensíveis ou upload controlado.',
        blockers: getStepBlockers('upload-lgpd'),
      },
      {
        slug: 'governanca-mapeamento',
        label: '8. Governança de Mapeamento',
        href: '/configuracoes/objetos/contas/governanca-mapeamento',
        status: 'optional',
        prerequisite: 'Etapa de revisão read-only após as configurações operacionais.',
        impact: 'Consolida a leitura de auditoria e o histórico do setup sem desbloquear etapas adicionais.',
        blockers: [],
      },
      {
        slug: 'validacao-publicacao',
        label: '9. Validação Local',
        href: '/configuracoes/objetos/contas/validacao-publicacao',
        status: blockers.length > 0 ? 'blocked' : hasConnector ? 'configured' : 'pending',
        prerequisite: 'Concluir as etapas aplicáveis e resolver bloqueadores críticos.',
        impact: 'Consolida readiness, blockers e o próximo passo seguro.',
        blockers,
      },
    ];
    }, [baseLegal, blockers, conta.fieldMappings, conta.primaryKeys, conta.supportsWriteback, customConfig.inputMethodByProvider, selectedConnector]);

  const realConnectionContract = useMemo<AccountRealConnectionContract | null>(() => {
    if (!selectedConnector) return null;

    const adapter = getAccountConnectorAdapter(selectedConnector);
    return buildInitialRealConnectionContract(adapter, {
      hasLocalSetup: connectorLocalValidated,
    });
  }, [selectedConnector, connectorLocalValidated]);

  const save = async () => {
    if (localSourceSaveHandler) {
      setIsSaving(true);
      try {
        localSourceSaveHandler();
      } finally {
        setIsSaving(false);
      }
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  return (
    <ContasConfigContext.Provider value={{
      selectedConnector,
      setConnector,
      conta,
      updateCustomConfig,
      isSaving,
      save,
      registerLocalSourceSaveHandler,
      canSaveLocalSourceSetup,
      setCanSaveLocalSourceSetup,
      canConcludeLocalSetup,
      accountSourcesStepCompleted,
      hubspotConnectionStepCompleted,
      setAccountSourcesStepCompleted,
      setHubspotConnectionStepCompleted,
      completeLocalSetup,
      blockers,
      stepStatus,
      readinessScore,
      canPublish,
      baseLegal,
      setBaseLegal,
      customConfig,
      connectorLocalValidated,
      setConnectorLocalValidated,
      csvUploadMeta: (customConfig.csvUploadMeta ?? null) as CsvUploadMeta | null,
      inputMethodDraftByProvider,
      setInputMethodDraftForProvider,
      canonicalMapping: resolvedCanonicalMapping,
      canonicalMappingReviewed,
      updateCanonicalMappingField,
      setCanonicalMappingReviewed,
      resetCanonicalMappingToPreset,
      realConnectionContract,
    }}>
      {children}
    </ContasConfigContext.Provider>
  );
};

export const useContasConfig = () => {
  const context = useContext(ContasConfigContext);
  if (!context) throw new Error('useContasConfig must be used within ContasConfigProvider');
  return context;
};
