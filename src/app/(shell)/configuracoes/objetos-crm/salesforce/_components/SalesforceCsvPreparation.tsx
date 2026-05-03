'use client';

import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CrmEntity = 'Account' | 'Contact' | 'Opportunity' | 'Lead' | 'Campaign';
type ColumnRecognitionType = 'salesforce' | 'alternative' | 'unrecognized';
type ColumnAction = 'suggest' | 'override' | 'ignore';

interface CsvColumnReading {
  header: string;
  recognitionType: ColumnRecognitionType;
  canopiLabel: string;
  observation: string;
  exampleValues: string[];
}

interface ColumnAdjustment {
  action: ColumnAction;
  overrideField: string;
}

interface CsvAnalysis {
  fileName: string;
  fileSizeBytes: number;
  headers: string[];
  previewRows: Record<string, string>[];
  rowCount: number;
  delimiter: string;
  columnReadings: CsvColumnReading[];
  warnings: string[];
  compatibility: 'alta' | 'parcial' | 'baixa';
  recognizedCount: number;
  alternativeCount: number;
  unrecognizedCount: number;
}

interface EntityConfig {
  label: string;
  sfFields: Record<string, string>;
  altFields: Record<string, string>;
  requiredGroupA: { title: string; fields: string[] };
  requiredGroupB: { title: string; fields: string[] };
  targetFieldGroups: { group: string; fields: string[] }[];
  recommendedLabels: string[];
  primaryIdKey: string;
  primaryNameKey: string;
  altNameKey?: string;
  exampleCsv: string;
  filename: string;
}

// ─── Entity Configs ───────────────────────────────────────────────────────────

const ENTITY_CONFIGS: Record<CrmEntity, EntityConfig> = {
  Account: {
    label: 'Account',
    sfFields: {
      id: 'Account Id',
      name: 'Account Name',
      type: 'Account Type',
      industry: 'Industry',
      website: 'Website',
      phone: 'Phone',
      ownerid: 'Owner',
      createddate: 'Created Date',
      lastmodifieddate: 'Last Modified Date',
      billingcity: 'Billing City',
      billingstate: 'Billing State',
      billingcountry: 'Billing Country',
    },
    altFields: {
      account_name: 'Nome da conta para preview',
      domain: 'Domínio',
      owner_name: 'Owner local',
      lifecycle_stage: 'Estágio local',
      cnpj: 'Documento local',
      segment: 'Segmento local',
      company_size: 'Tamanho da empresa',
      annual_revenue_brl: 'Receita estimada local',
      country: 'País',
      region: 'Região',
    },
    requiredGroupA: {
      title: 'Nome da conta',
      fields: ['Account Name', 'Nome da conta para preview'],
    },
    requiredGroupB: {
      title: 'Identificação ou desambiguação',
      fields: ['Account Id', 'Domínio', 'Website', 'Documento local'],
    },
    targetFieldGroups: [
      {
        group: 'Salesforce Account',
        fields: ['Account Id', 'Account Name', 'Account Type', 'Industry', 'Website', 'Phone', 'Owner', 'Created Date', 'Last Modified Date', 'Billing City', 'Billing State', 'Billing Country'],
      },
      {
        group: 'Canopi local',
        fields: ['Nome da conta para preview', 'Domínio', 'Owner local', 'Estágio local', 'Documento local', 'Segmento local', 'Tamanho da empresa', 'Receita estimada local', 'País', 'Região'],
      },
    ],
    recommendedLabels: ['Industry', 'Owner', 'Account Type', 'Billing City', 'Billing State', 'Billing Country', 'Segmento local', 'Estágio local', 'Receita estimada local'],
    primaryIdKey: 'id',
    primaryNameKey: 'name',
    altNameKey: 'account_name',
    exampleCsv: [
      'Id,Name,Type,Industry,Website,Phone,OwnerId,CreatedDate,LastModifiedDate,BillingCity,BillingState,BillingCountry',
      '001Axxxxxxxxxxxxxxxxx,Acme Corp,Customer,Technology,https://acmecorp.com,+55 11 90000-0001,005Axxxxxxxxxxxxxxxxx,2024-01-15T10:00:00Z,2024-03-22T14:30:00Z,São Paulo,SP,Brazil',
      '001Bxxxxxxxxxxxxxxxxx,Global Industries,Prospect,Manufacturing,https://globalind.com,+55 11 90000-0002,005Bxxxxxxxxxxxxxxxxx,2024-02-01T09:00:00Z,2024-04-10T11:00:00Z,Rio de Janeiro,RJ,Brazil',
      '001Cxxxxxxxxxxxxxxxxx,TechStart Ltda,Partner,Software,https://techstart.com.br,+55 11 90000-0003,005Cxxxxxxxxxxxxxxxxx,2024-03-05T08:00:00Z,2024-04-30T16:00:00Z,Curitiba,PR,Brazil',
    ].join('\n'),
    filename: 'canopi_salesforce_account_exemplo.csv',
  },
  Contact: {
    label: 'Contact',
    sfFields: {
      id: 'Contact Id',
      firstname: 'First Name',
      lastname: 'Last Name',
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      title: 'Title',
      department: 'Department',
      accountid: 'Account Id',
      ownerid: 'Owner',
      createddate: 'Created Date',
      lastmodifieddate: 'Last Modified Date',
    },
    altFields: {
      contact_email: 'Email local',
      contact_name: 'Nome local',
    },
    requiredGroupA: {
      title: 'Nome do contato',
      fields: ['Full Name', 'Last Name', 'Nome local'],
    },
    requiredGroupB: {
      title: 'Identificação',
      fields: ['Contact Id', 'Email', 'Email local'],
    },
    targetFieldGroups: [
      {
        group: 'Salesforce Contact',
        fields: ['Contact Id', 'First Name', 'Last Name', 'Full Name', 'Email', 'Phone', 'Title', 'Department', 'Account Id', 'Owner', 'Created Date', 'Last Modified Date'],
      },
      { group: 'Canopi local', fields: ['Email local', 'Nome local'] },
    ],
    recommendedLabels: ['Email', 'Phone', 'Title', 'Account Id'],
    primaryIdKey: 'id',
    primaryNameKey: 'name',
    altNameKey: 'lastname',
    exampleCsv: [
      'Id,FirstName,LastName,Email,Phone,Title,Department,AccountId,OwnerId,CreatedDate,LastModifiedDate',
      '003Axxxxxxxxxxxxxxxxx,João,Silva,joao.silva@acmecorp.com,+55 11 90000-0001,CEO,Executive,001Axxxxxxxxxxxxxxxxx,005Axxxxxxxxxxxxxxxxx,2024-01-15T10:00:00Z,2024-03-22T14:30:00Z',
      '003Bxxxxxxxxxxxxxxxxx,Maria,Santos,maria.santos@globalind.com,+55 21 90000-0002,Diretora,Sales,001Bxxxxxxxxxxxxxxxxx,005Bxxxxxxxxxxxxxxxxx,2024-02-01T09:00:00Z,2024-04-10T11:00:00Z',
      '003Cxxxxxxxxxxxxxxxxx,Pedro,Lima,pedro.lima@techstart.com.br,+55 41 90000-0003,CTO,Engineering,001Cxxxxxxxxxxxxxxxxx,005Cxxxxxxxxxxxxxxxxx,2024-03-05T08:00:00Z,2024-04-30T16:00:00Z',
    ].join('\n'),
    filename: 'canopi_salesforce_contact_exemplo.csv',
  },
  Opportunity: {
    label: 'Opportunity',
    sfFields: {
      id: 'Opportunity Id',
      name: 'Opportunity Name',
      accountid: 'Account Id',
      stagename: 'Stage',
      amount: 'Amount',
      closedate: 'Close Date',
      probability: 'Probability',
      type: 'Type',
      ownerid: 'Owner',
      createddate: 'Created Date',
      lastmodifieddate: 'Last Modified Date',
    },
    altFields: {},
    requiredGroupA: {
      title: 'Nome da oportunidade',
      fields: ['Opportunity Name'],
    },
    requiredGroupB: {
      title: 'Identificação',
      fields: ['Opportunity Id', 'Account Id'],
    },
    targetFieldGroups: [
      {
        group: 'Salesforce Opportunity',
        fields: ['Opportunity Id', 'Opportunity Name', 'Account Id', 'Stage', 'Amount', 'Close Date', 'Probability', 'Type', 'Owner', 'Created Date', 'Last Modified Date'],
      },
    ],
    recommendedLabels: ['Stage', 'Amount', 'Close Date', 'Account Id', 'Probability'],
    primaryIdKey: 'id',
    primaryNameKey: 'name',
    exampleCsv: [
      'Id,Name,AccountId,StageName,Amount,CloseDate,Probability,Type,OwnerId,CreatedDate,LastModifiedDate',
      '006Axxxxxxxxxxxxxxxxx,Renovação Acme 2025,001Axxxxxxxxxxxxxxxxx,Negotiation/Review,150000,2025-06-30,70,Existing Business,005Axxxxxxxxxxxxxxxxx,2024-11-01T09:00:00Z,2025-01-15T14:00:00Z',
      '006Bxxxxxxxxxxxxxxxxx,Expansão Global Industries,001Bxxxxxxxxxxxxxxxxx,Proposal/Price Quote,80000,2025-05-31,40,New Business,005Bxxxxxxxxxxxxxxxxx,2024-12-01T10:00:00Z,2025-02-20T11:00:00Z',
      '006Cxxxxxxxxxxxxxxxxx,TechStart Plataforma,001Cxxxxxxxxxxxxxxxxx,Value Proposition,45000,2025-04-30,60,New Business,005Cxxxxxxxxxxxxxxxxx,2025-01-10T08:00:00Z,2025-03-05T09:00:00Z',
    ].join('\n'),
    filename: 'canopi_salesforce_opportunity_exemplo.csv',
  },
  Lead: {
    label: 'Lead',
    sfFields: {
      id: 'Lead Id',
      firstname: 'First Name',
      lastname: 'Last Name',
      name: 'Full Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      title: 'Title',
      status: 'Status',
      leadsource: 'Lead Source',
      ownerid: 'Owner',
      createddate: 'Created Date',
      lastmodifieddate: 'Last Modified Date',
    },
    altFields: {},
    requiredGroupA: {
      title: 'Nome ou empresa',
      fields: ['Full Name', 'Last Name', 'Company'],
    },
    requiredGroupB: {
      title: 'Identificação',
      fields: ['Lead Id', 'Email'],
    },
    targetFieldGroups: [
      {
        group: 'Salesforce Lead',
        fields: ['Lead Id', 'First Name', 'Last Name', 'Full Name', 'Company', 'Email', 'Phone', 'Title', 'Status', 'Lead Source', 'Owner', 'Created Date', 'Last Modified Date'],
      },
    ],
    recommendedLabels: ['Company', 'Email', 'Status', 'Lead Source', 'Phone'],
    primaryIdKey: 'id',
    primaryNameKey: 'name',
    altNameKey: 'company',
    exampleCsv: [
      'Id,FirstName,LastName,Company,Email,Phone,Title,Status,LeadSource,OwnerId,CreatedDate,LastModifiedDate',
      '00QAxxxxxxxxxxxxxxxxx,Maria,Santos,Global Industries,maria.santos@globalind.com,+55 21 90000-0001,Diretora,Working,Web,005Axxxxxxxxxxxxxxxxx,2024-02-10T08:00:00Z,2024-04-15T10:00:00Z',
      '00QBxxxxxxxxxxxxxxxxx,Carlos,Pereira,TechStart Ltda,carlos.pereira@techstart.com.br,+55 41 90000-0002,CTO,New,Phone,005Bxxxxxxxxxxxxxxxxx,2024-03-01T09:00:00Z,2024-05-20T14:00:00Z',
      '00QCxxxxxxxxxxxxxxxxx,Ana,Lima,Inovação SA,ana.lima@inovacao.com.br,+55 11 90000-0003,VP Sales,Contacted,Email,005Cxxxxxxxxxxxxxxxxx,2024-03-15T10:00:00Z,2024-06-01T11:00:00Z',
    ].join('\n'),
    filename: 'canopi_salesforce_lead_exemplo.csv',
  },
  Campaign: {
    label: 'Campaign',
    sfFields: {
      id: 'Campaign Id',
      name: 'Campaign Name',
      type: 'Type',
      status: 'Status',
      startdate: 'Start Date',
      enddate: 'End Date',
      budgetedcost: 'Budgeted Cost',
      actualcost: 'Actual Cost',
      expectedrevenue: 'Expected Revenue',
      isactive: 'Is Active',
      ownerid: 'Owner',
      createddate: 'Created Date',
      lastmodifieddate: 'Last Modified Date',
    },
    altFields: {},
    requiredGroupA: {
      title: 'Nome da campanha',
      fields: ['Campaign Name'],
    },
    requiredGroupB: {
      title: 'Identificação',
      fields: ['Campaign Id'],
    },
    targetFieldGroups: [
      {
        group: 'Salesforce Campaign',
        fields: ['Campaign Id', 'Campaign Name', 'Type', 'Status', 'Start Date', 'End Date', 'Budgeted Cost', 'Actual Cost', 'Expected Revenue', 'Is Active', 'Owner', 'Created Date', 'Last Modified Date'],
      },
    ],
    recommendedLabels: ['Type', 'Status', 'Start Date', 'End Date', 'Is Active'],
    primaryIdKey: 'id',
    primaryNameKey: 'name',
    exampleCsv: [
      'Id,Name,Type,Status,StartDate,EndDate,BudgetedCost,ActualCost,ExpectedRevenue,IsActive,OwnerId,CreatedDate,LastModifiedDate',
      '701Axxxxxxxxxxxxxxxxx,Q1 2025 Outbound,Email,Active,2025-01-01,2025-03-31,50000,35000,120000,true,005Axxxxxxxxxxxxxxxxx,2024-12-15T10:00:00Z,2025-03-31T18:00:00Z',
      '701Bxxxxxxxxxxxxxxxxx,Webinar Produto Março,Webinar,Completed,2025-03-10,2025-03-10,8000,7500,25000,false,005Bxxxxxxxxxxxxxxxxx,2025-01-20T09:00:00Z,2025-04-01T10:00:00Z',
      '701Cxxxxxxxxxxxxxxxxx,Newsletter Abril,Email,Active,2025-04-01,2025-04-30,5000,1200,15000,true,005Cxxxxxxxxxxxxxxxxx,2025-03-01T08:00:00Z,2025-04-15T14:00:00Z',
    ].join('\n'),
    filename: 'canopi_salesforce_campaign_exemplo.csv',
  },
};

const ENTITIES: CrmEntity[] = ['Account', 'Contact', 'Opportunity', 'Lead', 'Campaign'];
const STEPS = ['Requisitos', 'Upload', 'Leitura', 'Confirmar'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectDelimiter(line: string): { char: string; label: string } {
  const counts = {
    ',': (line.match(/,/g) ?? []).length,
    ';': (line.match(/;/g) ?? []).length,
    '\t': (line.match(/\t/g) ?? []).length,
  };
  const max = Math.max(...Object.values(counts));
  if (max === 0) return { char: ',', label: 'vírgula' };
  if (counts[';'] === max) return { char: ';', label: 'ponto e vírgula' };
  if (counts['\t'] === max) return { char: '\t', label: 'tabulação' };
  return { char: ',', label: 'vírgula' };
}

function splitCsvField(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (line.slice(i, i + delimiter.length) === delimiter) {
        fields.push(current.trim()); current = ''; i += delimiter.length - 1;
      } else current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function classifyColumn(
  header: string,
  entityConfig: EntityConfig,
): { recognitionType: ColumnRecognitionType; canopiLabel: string; observation: string } {
  const key = header.toLowerCase().trim();
  if (entityConfig.sfFields[key]) {
    const observation =
      key === entityConfig.primaryIdKey
        ? `Chave padrão do Salesforce ${entityConfig.label}.`
        : key === entityConfig.primaryNameKey
        ? `Nome padrão do ${entityConfig.label} Salesforce.`
        : `Campo padrão do Salesforce ${entityConfig.label}.`;
    return { recognitionType: 'salesforce', canopiLabel: entityConfig.sfFields[key], observation };
  }
  if (entityConfig.altFields[key]) {
    return {
      recognitionType: 'alternative',
      canopiLabel: entityConfig.altFields[key],
      observation: 'Campo local aceito para preview.',
    };
  }
  return {
    recognitionType: 'unrecognized',
    canopiLabel: '—',
    observation: 'Coluna mantida apenas no preview desta sessão.',
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function parseCsvAndAnalyze(
  text: string,
  fileSizeBytes: number,
  fileName: string,
  entityConfig: EntityConfig,
): { analysis: CsvAnalysis | null; blockingErrors: string[] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const nonEmpty = lines.filter((l) => l.trim() !== '');
  if (nonEmpty.length === 0) return { analysis: null, blockingErrors: ['O arquivo está vazio.'] };

  const { char: delim, label: delimLabel } = detectDelimiter(nonEmpty[0]);
  const headers = splitCsvField(nonEmpty[0], delim).map((h) => h.trim());

  const blockingErrors: string[] = [];
  if (headers.length === 0) blockingErrors.push('Nenhum cabeçalho detectado no arquivo.');

  const seen = new Set<string>();
  const duplicates: string[] = [];
  headers.forEach((h) => { if (seen.has(h)) duplicates.push(h); else seen.add(h); });
  if (duplicates.length > 0) blockingErrors.push(`Colunas duplicadas: ${duplicates.join(', ')}.`);
  if (blockingErrors.length > 0) return { analysis: null, blockingErrors };

  const dataLines = nonEmpty.slice(1);
  const rowCount = dataLines.length;
  let inconsistentRows = 0;
  const previewRows: Record<string, string>[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const values = splitCsvField(dataLines[i], delim);
    if (values.length !== headers.length) inconsistentRows++;
    if (i < 5) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx]?.trim() ?? ''; });
      previewRows.push(row);
    }
  }

  const columnReadings: CsvColumnReading[] = headers.map((header) => {
    const classification = classifyColumn(header, entityConfig);
    const exampleValues = previewRows
      .map((row) => row[header] ?? '')
      .filter((v) => v.trim() !== '')
      .slice(0, 2);
    return { header, ...classification, exampleValues };
  });

  const lowerHeaders = headers.map((h) => h.toLowerCase());
  const hasId = lowerHeaders.includes(entityConfig.primaryIdKey);
  const hasName = lowerHeaders.includes(entityConfig.primaryNameKey);
  const hasAltName = entityConfig.altNameKey ? lowerHeaders.includes(entityConfig.altNameKey) : false;
  const compatibility: CsvAnalysis['compatibility'] =
    hasId && hasName ? 'alta' : hasId || hasName || hasAltName ? 'parcial' : 'baixa';

  const warnings: string[] = [];
  if (!hasId && !hasName) {
    warnings.push(`CSV lido, mas não parece seguir o formato padrão de exportação ${entityConfig.label} do Salesforce.`);
  } else {
    if (!hasId)
      warnings.push(`Coluna de ID não encontrada. O identificador único é necessário para distinguir registros ${entityConfig.label}.`);
    if (!hasName && !hasAltName)
      warnings.push(`Coluna de nome não encontrada. O nome do ${entityConfig.label} não estará visível no preview.`);
  }
  if (inconsistentRows > 0)
    warnings.push(`${inconsistentRows} linha(s) com número de colunas diferente do cabeçalho.`);
  if (rowCount === 0) warnings.push('Nenhuma linha de dados encontrada após o cabeçalho.');

  const recognizedCount = columnReadings.filter((c) => c.recognitionType === 'salesforce').length;
  const alternativeCount = columnReadings.filter((c) => c.recognitionType === 'alternative').length;
  const unrecognizedCount = columnReadings.filter((c) => c.recognitionType === 'unrecognized').length;

  return {
    blockingErrors: [],
    analysis: {
      fileName, fileSizeBytes, headers, previewRows, rowCount, delimiter: delimLabel,
      columnReadings, warnings, compatibility, recognizedCount, alternativeCount, unrecognizedCount,
    },
  };
}

function getEffectiveLabel(col: CsvColumnReading, adj: ColumnAdjustment): string {
  if (adj.action === 'ignore') return '—';
  if (adj.action === 'override') return adj.overrideField;
  return col.canopiLabel;
}

function getEffectiveType(
  col: CsvColumnReading,
  adj: ColumnAdjustment,
  sfFieldLabelSet: Set<string>,
  altFieldLabelSet: Set<string>,
): ColumnRecognitionType | 'ignored' {
  if (adj.action === 'ignore') return 'ignored';
  if (adj.action === 'override') {
    if (!adj.overrideField) return 'unrecognized';
    if (sfFieldLabelSet.has(adj.overrideField)) return 'salesforce';
    if (altFieldLabelSet.has(adj.overrideField)) return 'alternative';
    return 'unrecognized';
  }
  return col.recognitionType;
}

function buildInitialAdjustments(columnReadings: CsvColumnReading[]): Record<string, ColumnAdjustment> {
  const adj: Record<string, ColumnAdjustment> = {};
  for (const col of columnReadings) {
    adj[col.header] = { action: 'suggest', overrideField: '' };
  }
  return adj;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SalesforceCsvPreparation() {
  const [entity, setEntity] = useState<CrmEntity>('Account');
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null);
  const [blockingErrors, setBlockingErrors] = useState<string[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, ColumnAdjustment>>({});
  const [confirmed, setConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const entityConfig = ENTITY_CONFIGS[entity];
  const sfFieldLabelSet = React.useMemo(
    () => new Set(Object.values(entityConfig.sfFields)),
    [entityConfig],
  );
  const altFieldLabelSet = React.useMemo(
    () => new Set(Object.values(entityConfig.altFields)),
    [entityConfig],
  );
  const allRequiredLabels = React.useMemo(
    () => new Set([...entityConfig.requiredGroupA.fields, ...entityConfig.requiredGroupB.fields]),
    [entityConfig],
  );

  function handleEntityChange(newEntity: CrmEntity) {
    setEntity(newEntity);
    setAnalysis(null);
    setBlockingErrors([]);
    setConfirmed(false);
    setAdjustments({});
    if (inputRef.current) inputRef.current.value = '';
  }

  const derivedCounters = React.useMemo(() => {
    if (!analysis) return { recognized: 0, alternative: 0, unrecognized: 0, ignored: 0 };
    let recognized = 0, alternative = 0, unrecognized = 0, ignored = 0;
    for (const col of analysis.columnReadings) {
      const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
      const eff = getEffectiveType(col, adj, sfFieldLabelSet, altFieldLabelSet);
      if (eff === 'salesforce') recognized++;
      else if (eff === 'alternative') alternative++;
      else if (eff === 'unrecognized') unrecognized++;
      else ignored++;
    }
    return { recognized, alternative, unrecognized, ignored };
  }, [analysis, adjustments, sfFieldLabelSet, altFieldLabelSet]);

  const requiredGroups = React.useMemo(() => {
    if (!analysis) return { groupA: false, groupB: false, allMet: false };
    const groupASet = new Set(entityConfig.requiredGroupA.fields);
    const groupBSet = new Set(entityConfig.requiredGroupB.fields);
    let groupA = false;
    let groupB = false;
    for (const col of analysis.columnReadings) {
      const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
      const label = getEffectiveLabel(col, adj);
      if (groupASet.has(label)) groupA = true;
      if (groupBSet.has(label)) groupB = true;
    }
    return { groupA, groupB, allMet: groupA && groupB };
  }, [analysis, adjustments, entityConfig]);

  const confirmationSummary = React.useMemo(() => {
    if (!analysis) return null;
    const used: string[] = [];
    const ignored: string[] = [];
    for (const col of analysis.columnReadings) {
      const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
      if (adj.action === 'ignore') {
        ignored.push(col.header);
      } else {
        const label = getEffectiveLabel(col, adj);
        used.push(label !== '—' ? `${col.header} → ${label}` : col.header);
      }
    }
    return { used, ignored };
  }, [analysis, adjustments]);

  const phase = confirmed ? 4 : analysis ? 3 : 2;
  const canConfirm = requiredGroups.allMet && blockingErrors.length === 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setAnalysis(null);
    setBlockingErrors([]);
    setConfirmed(false);
    setAdjustments({});
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setBlockingErrors(['O arquivo deve ter extensão .csv.']);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBlockingErrors(['O arquivo excede 5 MB. Reduza o tamanho antes de continuar.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text.trim()) { setBlockingErrors(['O arquivo está vazio.']); return; }
        const result = parseCsvAndAnalyze(text, file.size, file.name, entityConfig);
        if (result.blockingErrors.length > 0) { setBlockingErrors(result.blockingErrors); return; }
        if (result.analysis) {
          setAnalysis(result.analysis);
          setAdjustments(buildInitialAdjustments(result.analysis.columnReadings));
        }
      } catch {
        setBlockingErrors(['Erro inesperado ao processar o arquivo CSV.']);
      }
    };
    reader.readAsText(file);
  }

  function handleClear() {
    setAnalysis(null);
    setBlockingErrors([]);
    setConfirmed(false);
    setAdjustments({});
    if (inputRef.current) inputRef.current.value = '';
  }

  function updateAdjustment(header: string, patch: Partial<ColumnAdjustment>) {
    setAdjustments((prev) => ({ ...prev, [header]: { ...prev[header], ...patch } }));
  }

  function downloadExample() {
    const blob = new Blob([entityConfig.exampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entityConfig.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-5 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-black text-slate-900">CSV por entidade</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
          CSV é entrada local. Não consulta o Salesforce ao vivo. Use uma entidade por vez para preparar colunas e revisar requisitos antes da sincronização.
        </p>
      </div>

      {/* ── Seletor de entidade ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">1. Escolher entidade</p>
          <p className="mt-1 text-sm font-black text-slate-900">Selecione uma entidade por vez</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ENTITIES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => handleEntityChange(e)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                entity === e
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-800'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <p className="text-xs font-medium text-slate-500">
          Requisitos, CSV exemplo e validações mudam conforme a entidade selecionada.
        </p>
      </div>

      {/* ── Stepper ── */}
      <div className="flex items-center">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const done = stepNum < phase;
          const current = stepNum === phase;
          return (
            <React.Fragment key={label}>
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
                  done ? 'bg-emerald-600 text-white' :
                  current ? 'bg-slate-900 text-white' :
                  'border border-slate-300 bg-white text-slate-400'
                }`}>
                  {done ? '✓' : stepNum}
                </div>
                <span className={`whitespace-nowrap text-[10px] font-bold ${
                  done ? 'text-emerald-700' : current ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`mb-4 mx-2 flex-1 border-t ${done ? 'border-emerald-400' : 'border-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── BLOCO 1: Requisitos ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <p className="text-sm font-black text-slate-900">
          Requisitos do CSV Salesforce {entityConfig.label}
        </p>

        {/* Obrigatórios */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Obrigatórios para confirmação local
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-black text-slate-800">{entityConfig.requiredGroupA.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {entityConfig.requiredGroupA.fields.map((f) => (
                  <span key={f} className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Pelo menos um desses campos deve estar presente e não ignorado.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-black text-slate-800">{entityConfig.requiredGroupB.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {entityConfig.requiredGroupB.fields.map((f) => (
                  <span key={f} className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-bold text-violet-700">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Pelo menos um desses campos garante identificação na leitura local.
              </p>
            </div>
          </div>
        </div>

        {/* Recomendados */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Recomendados para melhor leitura
          </p>
          <div className="flex flex-wrap gap-1.5">
            {entityConfig.recommendedLabels.map((f) => (
              <span key={f} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
                {f}
              </span>
            ))}
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-slate-500">
            Campos adicionais enriquecem a leitura local sem serem obrigatórios para confirmar.
          </p>
        </div>
      </div>

      {/* ── BLOCO 2: Upload ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Arquivo CSV</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100">
            <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            Selecionar CSV
          </label>
          <button
            type="button"
            onClick={downloadExample}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar CSV exemplo ({entityConfig.label})
          </button>
          <span className="text-[11px] text-slate-500">Apenas .csv · Máximo 5 MB · leitura local para preview</span>
        </div>
      </div>

      {/* ── Erros bloqueantes ── */}
      {blockingErrors.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm font-black text-red-900">Arquivo não pode ser processado</p>
          </div>
          <ul className="space-y-1 pl-6">
            {blockingErrors.map((err) => (
              <li key={err} className="text-sm font-medium text-red-800">• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Estado: arquivo carregado ── */}
      {analysis && (
        <div className="space-y-5">

          {/* BLOCO 3: Resumo do arquivo */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <p className="text-sm font-black text-slate-900">Arquivo analisado localmente</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                  {([
                    ['Arquivo', analysis.fileName],
                    ['Tamanho', formatFileSize(analysis.fileSizeBytes)],
                    ['Colunas', String(analysis.headers.length)],
                    ['Linhas de dados', String(analysis.rowCount)],
                    ['Delimitador', analysis.delimiter],
                    ['Preview exibido', `${analysis.previewRows.length} linha(s)`],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${
                    analysis.compatibility === 'alta' ? 'bg-emerald-100' :
                    analysis.compatibility === 'parcial' ? 'bg-amber-100' : 'bg-red-100'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                      Compatibilidade:
                    </span>
                    <span className={`text-sm font-black ${
                      analysis.compatibility === 'alta' ? 'text-emerald-800' :
                      analysis.compatibility === 'parcial' ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {analysis.compatibility}
                    </span>
                  </div>
                  {requiredGroups.allMet ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-2 text-[10px] font-black text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Campos obrigatórios atendidos
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-[10px] font-black text-amber-800">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Campos obrigatórios pendentes
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600"
                title="Limpar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Avisos */}
          {analysis.warnings.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 text-sm font-black text-amber-900">Avisos</p>
              <ul className="space-y-1">
                {analysis.warnings.map((w) => (
                  <li key={w} className="text-sm font-medium text-amber-800">• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* BLOCO 4: Leitura das colunas — editável */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900">Ajuste local de leitura</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  Preparação local · não cria campos · não salva configuração
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {derivedCounters.recognized > 0 && (
                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                    {derivedCounters.recognized} reconhecida{derivedCounters.recognized !== 1 ? 's' : ''}
                  </span>
                )}
                {derivedCounters.alternative > 0 && (
                  <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">
                    {derivedCounters.alternative} alternativa{derivedCounters.alternative !== 1 ? 's' : ''} local{derivedCounters.alternative !== 1 ? 'ais' : ''}
                  </span>
                )}
                {derivedCounters.unrecognized > 0 && (
                  <span className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                    {derivedCounters.unrecognized} não reconhecida{derivedCounters.unrecognized !== 1 ? 's' : ''}
                  </span>
                )}
                {derivedCounters.ignored > 0 && (
                  <span className="rounded-lg border border-slate-300 bg-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-500">
                    {derivedCounters.ignored} ignorada{derivedCounters.ignored !== 1 ? 's' : ''}
                  </span>
                )}
                {analysis.warnings.length > 0 && (
                  <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                    {analysis.warnings.length} aviso{analysis.warnings.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Coluna do arquivo', 'Exemplos', 'Campo sugerido', 'Ação', 'Status', 'Observação'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.columnReadings.map((col, idx) => {
                    const adj = adjustments[col.header] ?? { action: 'suggest', overrideField: '' };
                    const effType = getEffectiveType(col, adj, sfFieldLabelSet, altFieldLabelSet);
                    const effLabel = getEffectiveLabel(col, adj);
                    const isIgnored = adj.action === 'ignore';
                    const isRequired = !isIgnored && allRequiredLabels.has(effLabel);

                    return (
                      <tr
                        key={col.header}
                        className={`border-b border-slate-100 ${isIgnored ? 'opacity-50' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        {/* Coluna do arquivo */}
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs font-bold text-slate-900">
                          {col.header}
                        </td>
                        {/* Exemplos */}
                        <td className="px-3 py-2.5 text-xs">
                          {col.exampleValues.length > 0
                            ? col.exampleValues.map((v, i) => (
                                <span key={i} className="mr-1 inline-block max-w-[90px] truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700">
                                  {v}
                                </span>
                              ))
                            : <span className="text-slate-400">—</span>}
                        </td>
                        {/* Campo sugerido / override select */}
                        <td className="min-w-[170px] px-3 py-2.5">
                          {adj.action === 'override' ? (
                            <select
                              value={adj.overrideField}
                              onChange={(e) => updateAdjustment(col.header, { overrideField: e.target.value })}
                              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                            >
                              <option value="">Selecionar campo...</option>
                              {entityConfig.targetFieldGroups.map((group) => (
                                <optgroup key={group.group} label={group.group}>
                                  {group.fields.map((field) => (
                                    <option key={field} value={field}>{field}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-xs ${isIgnored ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {col.canopiLabel}
                            </span>
                          )}
                        </td>
                        {/* Ação */}
                        <td className="min-w-[145px] px-3 py-2.5">
                          <select
                            value={adj.action}
                            onChange={(e) => {
                              const newAction = e.target.value as ColumnAction;
                              updateAdjustment(col.header, {
                                action: newAction,
                                overrideField: newAction === 'override' ? adj.overrideField : '',
                              });
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                          >
                            <option value="suggest">Usar sugestão</option>
                            <option value="override">Trocar campo</option>
                            <option value="ignore">Ignorar coluna</option>
                          </select>
                        </td>
                        {/* Status */}
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <div className="flex flex-col gap-1">
                            {effType === 'ignored' ? (
                              <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-500">
                                Ignorada
                              </span>
                            ) : effType === 'salesforce' ? (
                              <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                Reconhecida
                              </span>
                            ) : effType === 'alternative' ? (
                              <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                                Alternativa local
                              </span>
                            ) : (
                              <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600">
                                Não reconhecida
                              </span>
                            )}
                            {isRequired && (
                              <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">
                                Obrigatório
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Observação */}
                        <td className="max-w-[200px] px-3 py-2.5 text-[11px] text-slate-500">
                          {isIgnored
                            ? 'Coluna ignorada nesta preparação local. Não será considerada.'
                            : adj.action === 'override' && !adj.overrideField
                              ? 'Selecione um campo de destino acima.'
                              : adj.action === 'override'
                                ? `Ajuste local de leitura para "${effLabel}". Não cria campos.`
                                : col.observation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOCO 5: Preview das primeiras linhas */}
          {analysis.previewRows.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <p className="text-sm font-black text-slate-900">Primeiras linhas do arquivo</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100">
                      {analysis.headers.slice(0, 8).map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider text-slate-700">
                          {h}
                        </th>
                      ))}
                      {analysis.headers.length > 8 && (
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          +{analysis.headers.length - 8} col.
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.previewRows.map((row, idx) => (
                      <tr key={idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        {analysis.headers.slice(0, 8).map((h) => (
                          <td key={h} className="max-w-[140px] truncate px-3 py-2 text-xs text-slate-700">
                            {row[h] || '—'}
                          </td>
                        ))}
                        {analysis.headers.length > 8 && (
                          <td className="px-3 py-2 text-xs text-slate-400">…</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Preview local: {analysis.previewRows.length} de {analysis.rowCount} linha(s). Sem persistência: leitura e ajuste local apenas nesta sessão.
              </p>
            </div>
          )}

          {/* BLOCO 6: Gate de campos obrigatórios + botão confirmar */}
          {!confirmed && (
            <div className="space-y-3">
              {!requiredGroups.allMet && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-black text-amber-900">
                        Antes de confirmar, ajuste os campos obrigatórios
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-amber-800">
                        Para confirmar a preparação local, a Canopi precisa identificar pelo menos o {entityConfig.requiredGroupA.title.toLowerCase()} e a {entityConfig.requiredGroupB.title.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {([
                      {
                        key: 'groupA',
                        label: entityConfig.requiredGroupA.title,
                        met: requiredGroups.groupA,
                        resolve: `Selecione uma coluna como ${entityConfig.requiredGroupA.fields.slice(0, 2).join(' ou ')}.`,
                      },
                      {
                        key: 'groupB',
                        label: entityConfig.requiredGroupB.title,
                        met: requiredGroups.groupB,
                        resolve: `Selecione uma coluna como ${entityConfig.requiredGroupB.fields.slice(0, 2).join(', ')} ou similar.`,
                      },
                    ] as { key: string; label: string; met: boolean; resolve: string }[]).map(({ key, label, met, resolve }) => (
                      <div
                        key={key}
                        className={`rounded-xl border px-4 py-3 ${met ? 'border-emerald-200 bg-white' : 'border-amber-200 bg-white'}`}
                      >
                        <div className="flex items-center gap-2">
                          {met ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                          )}
                          <p className={`text-sm font-black ${met ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {label}
                          </p>
                          <span className={`ml-auto text-[10px] font-black uppercase tracking-widest ${met ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {met ? 'Atendido' : 'Pendente'}
                          </span>
                        </div>
                        {!met && (
                          <p className="mt-1.5 pl-6 text-[11px] font-medium text-amber-800">
                            {resolve}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setConfirmed(true)}
                disabled={!canConfirm}
                title={!canConfirm ? 'Ajuste os campos obrigatórios para confirmar' : undefined}
                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmar CSV para esta sessão
              </button>

              {!canConfirm && (
                <p className="text-center text-[11px] font-medium text-slate-500">
                  Confirmação bloqueada até os campos obrigatórios serem atendidos.
                </p>
              )}
            </div>
          )}

          {/* BLOCO 7: Resumo pós-confirmação */}
          {confirmed && confirmationSummary && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-emerald-900">CSV confirmado para esta sessão</p>
                  <p className="text-[11px] font-medium leading-relaxed text-emerald-800">
                    Preparação local concluída para {entityConfig.label}. Sem persistência e sem atualização no Salesforce.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-emerald-200 pt-4 sm:grid-cols-4">
                {([
                  ['Entidade', entityConfig.label],
                  ['Arquivo', analysis.fileName],
                  ['Linhas', String(analysis.rowCount)],
                  ['Compatibilidade', analysis.compatibility],
                  ['Colunas usadas', String(confirmationSummary.used.length)],
                  ['Colunas ignoradas', String(confirmationSummary.ignored.length)],
                  ['Reconhecidas', String(derivedCounters.recognized)],
                  ...(derivedCounters.alternative > 0 ? ([['Alternativas locais', String(derivedCounters.alternative)]] as [string, string][]) : []),
                  ...(derivedCounters.unrecognized > 0 ? ([['Não reconhecidas', String(derivedCounters.unrecognized)]] as [string, string][]) : []),
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">{label}</p>
                    <p className="mt-0.5 truncate text-sm font-bold text-emerald-900">{value}</p>
                  </div>
                ))}
              </div>
              {confirmationSummary.ignored.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-white/60 px-4 py-3">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                    Colunas ignoradas nesta preparação
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {confirmationSummary.ignored.map((col) => (
                      <span key={col} className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
