export type IntegrationStatus = 'connected' | 'partial' | 'missing' | 'stale';

export interface CanonicalScenario {
  key: 'parcial';
  label: string;
  description: string;
  signalConfidenceDefault: number;
  dataConfidenceDefault: number;
  notes: string[];
  sourceStatuses: Record<string, IntegrationStatus>;
}

/**
 * Cenário oficial inicial do seed canônico do Canopi.
 *
 * Intenção:
 * - não parecer uma demo perfeita
 * - ativar lacunas reais de cobertura
 * - sustentar sinais, warnings e confiança variável
 */
export const CENARIO_PARCIAL: CanonicalScenario = {
  key: 'parcial',
  label: 'Cenário Parcial',
  description:
    'Operação plausível e imperfeita, com parte das fontes conectadas, parte parcial e parte ausente. É o cenário oficial inicial do seed canônico.',
  signalConfidenceDefault: 68,
  dataConfidenceDefault: 72,
  notes: [
    'A plataforma não deve parecer 100% conectada.',
    'Lacunas de cobertura precisam ser visíveis e críveis.',
    'ABM e ABX devem parecer úteis, mas não mágicos.',
    'Warnings de integração e confiança fazem parte da leitura operacional.',
  ],
  sourceStatuses: {
    hubspot: 'connected',
    salesforce: 'stale',
    google_ads: 'connected',
    meta_ads: 'partial',
    linkedin_ads: 'missing',
    ga4: 'partial',
    search_console: 'connected',
    apollo: 'partial',
    outreach: 'missing',
    salesloft: 'missing',
    rd_station: 'connected',
    marko_placeholder: 'missing',
    bigquery: 'partial',
    slack: 'partial',
  },
};

export default CENARIO_PARCIAL;
