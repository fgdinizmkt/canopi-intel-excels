'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  type ConnectorType, 
  type FieldMapping,
  CONNECTOR_PRESETS,
  CONTA_CANONICAL_FIELDS_MINIMUM
} from '@/src/lib/contaConnectorsV2';

// --- TYPES ---

export interface AccountConfigBlocker {
  id: string;
  section: string;
  severity: 'hard' | 'soft';
  message: string;
  consequence: string;
  action: string;
}

export function getAccountConfigBlockers(state: any): AccountConfigBlocker[] {
  const { selectedConnector, baseLegal, conta, customConfig, CONTA_CANONICAL_FIELDS_MINIMUM } = state;
  const list: AccountConfigBlocker[] = [];
  const preset = selectedConnector ? CONNECTOR_PRESETS[selectedConnector] : null;

  // 1. CONECTOR_MISSING
  if (!selectedConnector) {
    list.push({
      id: 'CONECTOR_MISSING',
      section: 'Fontes',
      severity: 'hard',
      message: 'Nenhum conector selecionado',
      consequence: 'Bloqueia a ingestão de dados.',
      action: 'Selecione uma fonte nativa ou CSV.'
    });
  }

  // 2. CONNECTOR_INCOMPLETE
  if (selectedConnector && preset && selectedConnector !== 'other_crm') {
    const isMissingInfo = !preset.nativeObject || !preset.identity.nativePrimaryKey || preset.requiredFields.length === 0;
    if (!preset.isComplete || isMissingInfo) {
      list.push({
        id: 'CONNECTOR_INCOMPLETE',
        section: 'Fontes',
        severity: 'hard',
        message: 'Configuração do conector incompleta',
        consequence: 'Pode causar erro na extração de campos obrigatórios.',
        action: 'Revise os campos obrigatórios e o objeto nativo.'
      });
    }
  }

  // 3. LGPD_LEGAL_BASIS_MISSING
  const requiresLgpd = selectedConnector === 'csv_upload' || (preset?.lgpdRisk === 'high');
  if (requiresLgpd && !baseLegal) {
    list.push({
      id: 'LGPD_LEGAL_BASIS_MISSING',
      section: 'Upload e LGPD',
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
                            !customConfig.customPrimaryKey ||
                            customConfig.customSecondaryKeys === undefined ||
                            customConfig.customRequiredFields === undefined ||
                            !customConfig.customConflictPolicy ||
                            customConfig.customConfidence === undefined;
    if (isCustomMissing) {
      list.push({
        id: 'CUSTOM_CONNECTOR_INCOMPLETE',
        section: 'Fontes',
        severity: 'hard',
        message: 'Conector Customizado Incompleto',
        consequence: 'Impossível mapear campos sem as definições básicas da fonte.',
        action: 'Configure Nome, Objeto, PK, Secundárias, Obrigatórios, Confiança e Política.'
      });
    }
  }

  return list;
}

interface ContasConfigContextType {
  selectedConnector: ConnectorType | null;
  setConnector: (type: ConnectorType) => void;
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
  blockers: AccountConfigBlocker[];
  readinessScore: number;
  canPublish: boolean;
  baseLegal: string;
  setBaseLegal: (val: string) => void;
  customConfig: any;
}

const ContasConfigContext = createContext<ContasConfigContextType | undefined>(undefined);

export const ContasConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType | null>(null);
  const [baseLegal, setBaseLegal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [customConfig, setCustomConfig] = useState({
    fieldMappings: [] as FieldMapping[],
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
    customConfidence: 0
  });

  const setConnector = (type: ConnectorType) => {
    setSelectedConnector(type);
    const preset = CONNECTOR_PRESETS[type];
    setCustomConfig({
      fieldMappings: preset?.fieldMappings || [],
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
      writebackTarget: type === 'other_crm' ? '' : (preset?.writebackTargets?.[0] || '')
    });
  };

  const updateCustomConfig = (updates: any) => {
    setCustomConfig(prev => ({ ...prev, ...updates }));
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
      fieldMappings: customConfig.fieldMappings.length > 0 
        ? customConfig.fieldMappings 
        : (preset?.fieldMappings || []),
      primaryKeys: customConfig.primaryKeys.length > 0 
        ? customConfig.primaryKeys 
        : (preset?.identity ? [preset.identity.nativePrimaryKey] : []),
    };
  }, [selectedConnector, customConfig]);

  const blockers = useMemo(() => {
    return getAccountConfigBlockers({
      selectedConnector,
      baseLegal,
      conta,
      customConfig,
      CONTA_CANONICAL_FIELDS_MINIMUM
    });
  }, [selectedConnector, baseLegal, conta, customConfig]);

  const readinessScore = useMemo(() => {
    const hardBlockers = blockers.filter(b => b.severity === 'hard').length;
    if (hardBlockers > 0) return Math.max(0, 100 - (hardBlockers * 20));
    return 100;
  }, [blockers]);

  const canPublish = useMemo(() => {
    return blockers.filter(b => b.severity === 'hard').length === 0;
  }, [blockers]);

  const save = async () => {
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
      blockers,
      readinessScore,
      canPublish,
      baseLegal,
      setBaseLegal,
      customConfig
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
