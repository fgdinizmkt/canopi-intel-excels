/**
 * Campaign Canonical Dictionary
 *
 * Formaliza o contrato transitório entre:
 * - Campos ATUAIS do Bloco C (técnicos, misturados)
 * - Campos CANÔNICOS do produto (semântica correta per Docs 13-15-17-19)
 *
 * Este arquivo é a FONTE DE VERDADE para interpretação semântica de campanhas.
 * Não afirma que o Bloco C atual é final — apenas documenta como traduzi-lo.
 *
 * Campos Canônicos Obrigatórios:
 * - campanha: nome descritivo da iniciativa
 * - tipoCampanha: conteúdo | captação | nutrição | prospecção | conversão | relacionamento | reativação | expansão | co-marketing | prova social (per Doc 15)
 * - formato: webinar | workshop digital | podcast | vídeocast | sequência outreach | nurture | landing page | conteúdo rico | campanha paga | ação com parceiro | evento de mercado | evento próprio | workshop presencial (per Doc 15)
 * - origem: orgânico | pago | prospecção ativa | parceria | base existente | indicação | direto (per Doc 15)
 * - canalPrincipal: email | website | call | outro (per Doc 17: webinar/workshop/podcast/vídeocast/evento são formato, NÃO canal)
 * - handRaiser: pessoa/função que liderou (se identificável)
 * - audience: segmento alvo
 * - objective: meta da campanha
 * - usoPrincipal: ABM | ABX | híbrido | operacional_geral
 * - escala: 1:1 | 1:few | 1:many
 */

import type { Campaign, Interaction } from '../../scripts/seed/buildBlockCSeed';

// ============================================================================
// TIPOS CANÔNICOS (Per Doc 15: Dicionário Operacional)
// ============================================================================

/**
 * TipoCampanha: Natureza estratégica da campanha
 * Per Doc 15: Define PARA QUÊ a campanha existe
 */
export type TipoCampanhaCanônico =
  | 'conteúdo'              // Educação, thought leadership
  | 'captação'              // Lead generation, growth
  | 'nutrição'              // Lead nurturing, engagement
  | 'prospecção'            // Active prospecting, outreach
  | 'conversão'             // Closing, deal acceleration
  | 'relacionamento'        // Account management, relationship building
  | 'reativação'            // Win-back, re-engagement
  | 'expansão'              // Cross-sell, upsell
  | 'co-marketing'          // Partnership initiatives
  | 'prova social';         // Case studies, testimonials, social proof

/**
 * Formato: Modo tático de execução
 * Per Doc 15 + Errata 17: Define COMO a campanha é entregue
 * IMPORTANTE: Webinar, workshop, podcast, vídeocast, eventos SÃO FORMATO, NÃO CANAL
 */
export type FormatoCanônico =
  | 'webinar'                    // Virtual event, live or recorded
  | 'workshop digital'           // Hands-on digital workshop
  | 'podcast'                    // Audio series
  | 'vídeocast'                  // Video series
  | 'sequência outreach'         // Email sequence, outbound cadence
  | 'nurture'                    // Automated nurture campaign
  | 'landing page'               // Landing page + offer
  | 'conteúdo rico'              // Whitepaper, ebook, guide
  | 'campanha paga'              // Paid ads (Google, Meta, LinkedIn, etc)
  | 'ação com parceiro'          // Co-op, co-marketing initiative
  | 'evento de mercado'          // Third-party event, conference
  | 'evento próprio'             // Hosted event (virtual or physical)
  | 'workshop presencial';       // In-person workshop

/**
 * CanalPrincipal: Meio de distribuição/contato
 * Per Doc 17 Errata: Webinar, workshop, podcast, vídeocast, evento SÃO FORMATO, não canal
 * IMPORTANTE: event deve ser removido de canalPrincipal
 */
export type CanalPrincipalCanônico =
  | 'email'                      // Email distribution
  | 'website'                    // Web-based (landing page, content hub)
  | 'call'                       // Phone, video call, direct contact
  | 'outro';                     // Other (fallback)

/**
 * Origem: Fonte/iniciativa da campanha
 * Per Doc 15: Define DE ONDE veio a oportunidade
 * Aliases internos (cold_outreach, partnership, referência, ganhada) são APENAS mapeamento transitório
 * NUNCA devem ser contrato principal
 */
export type OrigemCanônica =
  | 'orgânico'                   // Organic search, inbound, natural interest
  | 'pago'                       // Paid media, ads
  | 'prospecção ativa'           // Active outreach, cold email, cold calls
  | 'parceria'                   // Partnership initiative
  | 'base existente'             // Existing customer, installed base
  | 'indicação'                  // Referral, warm introduction
  | 'direto';                    // Direct (sales team, events, direct contact)

export type UsoPrincipalCanônico = 'ABM' | 'ABX' | 'híbrido' | 'operacional_geral';
export type EscalaCanônica = '1:1' | '1:few' | '1:many';

export interface CampaignCanonical {
  // Identificação
  campaignaId: string;
  campanha: string;

  // Tipologia Canônica (Per Doc 15)
  tipoCampanha: TipoCampanhaCanônico;       // O QUÊ (natureza estratégica)
  formato: FormatoCanônico;                  // COMO (modo de execução)
  origem: OrigemCanônica;                    // DE ONDE (fonte da campanha)
  canalPrincipal: CanalPrincipalCanônico;   // ONDE (meio de distribuição)

  // Contexto Operacional
  handRaiser?: string;                       // Quem liderou (se detectável)
  audience: string;                          // Segmento alvo
  objective: string;                         // Meta da campanha
  usoPrincipal: UsoPrincipalCanônico;        // ABM/ABX/híbrido
  escala: EscalaCanônica;                    // 1:1/1:few/1:many

  // Metadados de Mapeamento (para auditoria e debug)
  // IMPORTANTE: Estes campos preservam valores do Bloco C atual para rastreabilidade
  _origem_type: Campaign['type'];            // Valor Bloco C atual (type)
  _origem_channel: string;                   // Valor Bloco C atual (channel)
  _origem_source: string;                    // Valor Bloco C atual (source)
  _inferência_segura: boolean;               // Se interpretação foi 100% determinística ou heurística
  _notas_mapeamento?: string;                // Documentação das decisões de normalização
}

export interface InteractionCanonical {
  // Identificação
  interactionId: string;
  accountId: string;
  campaignaId?: string;

  // Tipos Canônicos
  canalInteracao: CanalPrincipalCanônico; // Como aconteceu
  tipoEngajamento: 'visit' | 'download' | 'submission' | 'outro'; // O que o usuário fez
  tipoContato?: 'email' | 'call' | 'demo' | 'meeting' | 'outro'; // Se foi contato direto
  formato?: string; // Formato se aplicável (webinar, podcast, etc)

  // Semântica
  direction: 'inbound' | 'outbound';
  initiator: 'conta' | 'empresa';

  // Contexto
  date: string;
  timestamp: string;
  description: string;
  relevance: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  source: string;
  confidence: number;

  // Metadados de Mapeamento
  _origem_interactionType: Interaction['interactionType'];
  _origem_channel: string;
  _inferência_segura: boolean;
  _notas_mapeamento?: string;
}

// ============================================================================
// MAPA DE TRADUÇÃO: Bloco C Atual → Canônico
// ============================================================================

/**
 * Inferir TipoCampanha (natureza estratégica per Doc 15)
 * Baseado em: type (inbound/outbound/earned/partnership), channel, source, name
 *
 * TipoCampanha responde: PARA QUÊ a campanha existe?
 * - conteúdo: educação, thought leadership
 * - captação: lead generation, growth
 * - nutrição: lead nurturing, engagement
 * - prospecção: active prospecting, outreach
 * - conversão: closing, deal acceleration
 * - relacionamento: account management, relationship building
 * - reativação: win-back, re-engagement
 * - expansão: cross-sell, upsell
 * - co-marketing: partnership initiatives
 * - prova social: case studies, testimonials
 */
function inferTipoCampanha(
  type: Campaign['type'],
  source: string,
  channel: string,
  name: string
): TipoCampanhaCanônico {
  const nameLower = name.toLowerCase();
  const channelLower = channel.toLowerCase();
  const sourceLower = source.toLowerCase();

  // Pistas textuais explícitas no name (precedência alta)
  if (nameLower.includes('webinar') || nameLower.includes('workshop')) return 'conteúdo';
  if (nameLower.includes('whitepaper') || nameLower.includes('case study') || nameLower.includes('guide')) return 'conteúdo';
  if (nameLower.includes('nurture') || nameLower.includes('série')) return 'nutrição';
  if (nameLower.includes('reativ')) return 'reativação';
  if (nameLower.includes('win-back')) return 'reativação';
  if (nameLower.includes('expansion') || nameLower.includes('upsell') || nameLower.includes('cross-sell')) return 'expansão';
  if (nameLower.includes('partnership') || nameLower.includes('partner')) return 'co-marketing';

  // Lógica por source/type/channel
  // Conteúdo: GA4/Search inbound
  if ((sourceLower === 'ga4' || sourceLower === 'search_console') && type === 'inbound') {
    return 'conteúdo';
  }

  // Captação: RD Station, HubSpot inbound (lead gen)
  if ((sourceLower === 'rd_station' || sourceLower === 'hubspot') && type === 'inbound') {
    return 'captação';
  }

  // Nutrição: Email nurture campaigns
  if (channelLower === 'email' && type === 'inbound') {
    return 'nutrição';
  }

  // Prospecção: Outbound email, outreach tools (Apollo, Outreach)
  if (type === 'outbound' && (channelLower === 'email' || sourceLower === 'apollo' || sourceLower === 'outreach')) {
    return 'prospecção';
  }

  // Conversão: Salesforce, close-stage activities
  if (sourceLower === 'salesforce' && (nameLower.includes('proposal') || nameLower.includes('negotiation'))) {
    return 'conversão';
  }

  // Relacionamento: Customer success, check-in calls
  if (nameLower.includes('success') || nameLower.includes('check-in')) {
    return 'relacionamento';
  }

  // Prova social: Case studies, testimonials, earned
  if (type === 'earned' || nameLower.includes('case study')) {
    return 'prova social';
  }

  // Fallback: assume 'outro' ou 'conteúdo' genérico
  return 'conteúdo';
}

/**
 * Inferir Formato (modo tático de execução per Doc 15 + Errata 17)
 * Baseado em: channel, source, name
 *
 * Formato responde: COMO a campanha é entregue?
 * IMPORTANTE: Webinar, workshop, podcast, vídeocast, evento SÃO FORMATO, NÃO CANAL (per Errata 17)
 */
function inferFormato(
  channel: string,
  source: string,
  name: string
): FormatoCanônico {
  const nameLower = name.toLowerCase();
  const channelLower = channel.toLowerCase();
  const sourceLower = source.toLowerCase();

  // Detecção por name (precedência alta)
  if (nameLower.includes('webinar')) return 'webinar';
  if (nameLower.includes('workshop') && nameLower.includes('presencial')) return 'workshop presencial';
  if (nameLower.includes('workshop') && (nameLower.includes('digital') || nameLower.includes('online'))) return 'workshop digital';
  if (nameLower.includes('workshop')) return 'workshop digital'; // default workshop = digital
  if (nameLower.includes('podcast')) return 'podcast';
  if (nameLower.includes('vídeocast') || nameLower.includes('videocast')) return 'vídeocast';
  if (nameLower.includes('summit') || nameLower.includes('conference') || nameLower.includes('evento')) return 'evento de mercado';
  if (nameLower.includes('event') && nameLower.includes('próprio')) return 'evento próprio';

  // Detecção por channel
  if (channelLower === 'event') {
    // event em channel = evento, precisa distinguir próprio vs mercado
    if (nameLower.includes('summit') || nameLower.includes('conference')) return 'evento de mercado';
    return 'evento próprio'; // fallback
  }

  if (channelLower === 'email') {
    // Email pode ser sequência, nurture, ou landing page
    if (nameLower.includes('sequência') || nameLower.includes('sequence') || nameLower.includes('outreach')) return 'sequência outreach';
    if (nameLower.includes('nurture') || nameLower.includes('série')) return 'nurture';
    return 'sequência outreach'; // fallback email outbound
  }

  if (channelLower === 'content') {
    // Conteúdo pode ser rico ou landing page
    if (nameLower.includes('whitepaper') || nameLower.includes('ebook') || nameLower.includes('guide')) return 'conteúdo rico';
    if (nameLower.includes('landing')) return 'landing page';
    return 'conteúdo rico'; // fallback
  }

  if (channelLower === 'paid') {
    return 'campanha paga';
  }

  if (channelLower === 'call') {
    // Call pode ser demo, meeting, outreach
    if (nameLower.includes('demo')) return 'conteúdo rico'; // Demo like webinar/content
    return 'ação com parceiro'; // fallback call = partnership/direct outreach
  }

  // Detecção por source
  if (sourceLower === 'google_ads' || sourceLower === 'meta_ads' || sourceLower === 'linkedin_ads') {
    return 'campanha paga';
  }

  // Fallback
  return 'conteúdo rico';
}

/**
 * Inferir Origem (fonte/iniciativa da campanha per Doc 15)
 * Responde: DE ONDE veio a oportunidade?
 *
 * Valores canônicos (PRINCIPAIS - nunca aliases):
 * - orgânico: organic search, inbound, natural interest
 * - pago: paid media, ads
 * - prospecção ativa: active outreach, cold email/calls
 * - parceria: partnership initiative
 * - base existente: existing customer, installed base
 * - indicação: referral, warm introduction
 * - direto: direct sales team contact, events, direct outreach
 *
 * Aliases APENAS para mapeamento transitório (NUNCA retornar):
 * - cold_outreach → prospecção ativa
 * - partnership → parceria
 * - referência → indicação
 * - ganhada → (não existe em canônico; mapear para 'orgânico' ou 'indicação')
 */
function inferOrigemCanônica(
  type: Campaign['type'],
  source: string,
  channel: string
): OrigemCanônica {
  const sourceLower = source.toLowerCase();
  const channelLower = channel.toLowerCase();

  // Pago: sempre explícito
  if (sourceLower === 'google_ads' || sourceLower === 'meta_ads' || sourceLower === 'linkedin_ads') {
    return 'pago';
  }
  if (channelLower === 'paid') {
    return 'pago';
  }

  // Orgânico: GA4, Search Console, natural inbound
  if (sourceLower === 'ga4' || sourceLower === 'search_console') {
    return 'orgânico';
  }

  // Prospecção Ativa: Apollo, Outreach, SalesForce outbound
  if (sourceLower === 'apollo' || sourceLower === 'outreach') {
    return 'prospecção ativa';
  }
  if (sourceLower === 'salesforce' && type === 'outbound') {
    return 'prospecção ativa';
  }

  // Parceria: type=partnership ou nome sugere parceria
  if (type === 'partnership') {
    return 'parceria';
  }

  // Base Existente: CRM inbound (customer success, check-in)
  if (sourceLower === 'hubspot' && type === 'outbound') {
    // HubSpot outbound pode ser check-in com cliente existente ou nurture
    // Sem mais contexto, assume base existente se for CS-like
    return 'base existente'; // Heurística: HubSpot outbound = customer
  }

  // Indicação: type=earned (menção, PR, referral)
  if (type === 'earned') {
    return 'indicação'; // earned = ganho através de terceiros = indicação
  }

  // Direto: RD Station, HubSpot inbound (direto ao time)
  if ((sourceLower === 'rd_station' || sourceLower === 'hubspot') && type === 'inbound') {
    return 'direto'; // Inbound direto a time
  }

  // Fallback por type
  if (type === 'inbound') {
    return 'orgânico'; // inbound = organic
  }
  if (type === 'outbound') {
    return 'prospecção ativa'; // outbound = active prospecting
  }

  // Ultimate fallback
  return 'direto';
}

/**
 * Inferir CanalPrincipal (meio de distribuição/contato per Doc 17 Errata)
 * Responde: ONDE acontece o contato/distribuição?
 *
 * IMPORTANTE (Errata 17): Webinar, workshop, podcast, vídeocast, evento SÃO FORMATO, NÃO CANAL
 * CanalPrincipal valores: email | website | call | outro
 * Eventos, webinars, etc vão para formato, não para canalPrincipal
 */
function inferCanalPrincipal(channel: string): CanalPrincipalCanônico {
  const channelLower = channel.toLowerCase();

  if (channelLower === 'email') return 'email';
  if (channelLower === 'call') return 'call';
  if (channelLower === 'website' || channelLower === 'content') return 'website';
  if (channelLower === 'paid') return 'website'; // Ads dirige para website
  if (channelLower === 'event') return 'outro'; // Event é FORMATO, não canal → map para 'outro' ou 'website'

  return 'outro';
}

/**
 * Heurística para inferir escala a partir de accountsReached e type
 */
function inferEscala(accountsReached: number, type: Campaign['type']): EscalaCanônica {
  // Outbound direto (email, call) para poucos
  if (type === 'outbound' && accountsReached <= 15) return '1:few';

  // Broadcast (email nurture, ads)
  if (accountsReached >= 20) return '1:many';

  // ABM 1:1 high-touch (call center, demos)
  if (accountsReached <= 10 && type === 'outbound') return '1:1';

  // Default
  return '1:many';
}

/**
 * Heurística para inferir usoPrincipal a partir de type + channel + name
 * Nota: Não é totalmente seguro sem contexto de play/ABM/ABX
 */
function inferUsoPrincipal(
  type: Campaign['type'],
  channel: string,
  name: string
): UsoPrincipalCanônico {
  const nameLower = name.toLowerCase();

  // Pistas textuais explícitas
  if (
    nameLower.includes('abm') ||
    nameLower.includes('prospecting') ||
    nameLower.includes('entry') ||
    nameLower.includes('webinar')
  ) {
    return 'ABM';
  }

  if (
    nameLower.includes('abx') ||
    nameLower.includes('expansion') ||
    nameLower.includes('upsell') ||
    nameLower.includes('cross-sell') ||
    nameLower.includes('retention') ||
    nameLower.includes('success')
  ) {
    return 'ABX';
  }

  if (nameLower.includes('hybrid') || nameLower.includes('híbrido')) {
    return 'híbrido';
  }

  // Heurística por channel
  if (channel.toLowerCase() === 'call' && type === 'outbound') {
    return 'ABX'; // Check-in calls são geralmente ABX
  }

  // Fallback
  return 'operacional_geral';
}

// ============================================================================
// NORMALIZADOR: Campaign → CampaignCanonical
// ============================================================================

export function normalizeCampaignToCanonical(campaign: Campaign): CampaignCanonical {
  // Inferências (em ordem de precedência)
  const tipoCampanha = inferTipoCampanha(campaign.type, campaign.source, campaign.channel, campaign.name);
  const formato = inferFormato(campaign.channel, campaign.source, campaign.name);
  const origem = inferOrigemCanônica(campaign.type, campaign.source, campaign.channel);
  const canalPrincipal = inferCanalPrincipal(campaign.channel);
  const escala = inferEscala(campaign.accountsReached, campaign.type);
  const usoPrincipal = inferUsoPrincipal(campaign.type, campaign.channel, campaign.name);

  // Marcar segurança da inferência
  // Inferência é 100% segura quando:
  // - source é pago (google_ads, meta_ads, linkedin_ads) OU
  // - source é orgânico (ga4, search_console) E type é inbound OU
  // - type é partnership OU
  // - channel é explícito (email, call, website)
  const paidSources = ['google_ads', 'meta_ads', 'linkedin_ads'];
  const organicSources = ['ga4', 'search_console'];
  const sourceLower = campaign.source.toLowerCase();

  const inferênciaSegura =
    paidSources.includes(sourceLower) ||
    (organicSources.includes(sourceLower) && campaign.type === 'inbound') ||
    campaign.type === 'partnership' ||
    campaign.type === 'earned' ||
    campaign.channel.toLowerCase() === 'email';

  // Documentar decisões e gaps
  const notas: string[] = [];

  // Gap 1: tipo/channel ambíguo no Bloco C atual
  if (!inferênciaSegura) {
    notas.push(`Bloco C atual mistura tipo/origem/canal; interpretação é heurística (source='${campaign.source}', type='${campaign.type}', channel='${campaign.channel}')`);
  }

  // Gap 2: formato precisa ser refinar (hoje = name fallback)
  if (formato === 'conteúdo rico' || formato === 'sequência outreach') {
    notas.push(`Formato inferido do name '${campaign.name}'; pode não ser 100% preciso sem enum explícito no Bloco C`);
  }

  // Gap 3: handRaiser não detectável
  notas.push('handRaiser não detectável no Bloco C atual (Bloco C não captura quem liderou)');

  return {
    campaignaId: campaign.id,
    campanha: campaign.name,
    tipoCampanha,
    formato,
    origem,
    canalPrincipal,
    audience: campaign.targetAudience || 'Não especificado',
    objective: campaign.objective,
    usoPrincipal,
    escala,
    handRaiser: undefined, // Não é detectável no Bloco C atual
    _origem_type: campaign.type,
    _origem_channel: campaign.channel,
    _origem_source: campaign.source,
    _inferência_segura: inferênciaSegura,
    _notas_mapeamento: notas.length > 0 ? notas.join(' | ') : undefined,
  };
}

// ============================================================================
// NORMALIZADOR: Interaction → InteractionCanonical
// ============================================================================

export function normalizeInteractionToCanonical(interaction: Interaction): InteractionCanonical {
  // Inferir tipos canônicos a partir de interactionType
  let tipoEngajamento: 'visit' | 'download' | 'submission' | 'outro' = 'outro';
  let tipoContato: 'email' | 'call' | 'demo' | 'meeting' | 'outro' | undefined;
  let formato: string | undefined;

  switch (interaction.interactionType) {
    case 'visit':
    case 'download':
    case 'submission':
      tipoEngajamento = interaction.interactionType;
      break;
    case 'email_open':
    case 'email_click':
      tipoEngajamento = 'visit'; // Treated as engagement with email
      tipoContato = 'email';
      break;
    case 'call':
    case 'demo':
    case 'meeting':
      tipoEngajamento = 'submission'; // Engagement with sales
      tipoContato = interaction.interactionType;
      break;
    case 'event':
    case 'content_consumption':
      tipoEngajamento = 'visit';
      formato = interaction.channel === 'event' ? 'evento' : interaction.description;
      break;
  }

  const canalInteracao = inferCanalPrincipal(interaction.channel);

  // Determinar segurança
  const inferênciaSegura =
    interaction.interactionType !== 'event' && // event é ambíguo (webinar? workshop?)
    interaction.interactionType !== 'content_consumption'; // content_consumption é genérico

  const notas: string[] = [];
  if (!inferênciaSegura) {
    notas.push('Tipo de interação genérico; formato específico não inferível.');
  }

  return {
    interactionId: interaction.id,
    accountId: interaction.accountId,
    campaignaId: interaction.campaignId,
    canalInteracao,
    tipoEngajamento,
    tipoContato,
    formato,
    direction: interaction.direction,
    initiator: interaction.initiator,
    date: interaction.date,
    timestamp: interaction.timestamp,
    description: interaction.description,
    relevance: interaction.relevance,
    sentiment: interaction.sentiment,
    source: interaction.source,
    confidence: interaction.confidence,
    _origem_interactionType: interaction.interactionType,
    _origem_channel: interaction.channel,
    _inferência_segura: inferênciaSegura,
    _notas_mapeamento: notas.length > 0 ? notas.join(' | ') : undefined,
  };
}

// ============================================================================
// HELPERS PARA LEITURA
// ============================================================================

/**
 * Normaliza uma lista de campanhas
 */
export function normalizeCampaignsToCanonical(campaigns: Campaign[]): CampaignCanonical[] {
  return campaigns.map(normalizeCampaignToCanonical);
}

/**
 * Normaliza uma lista de interações
 */
export function normalizeInteractionsToCanonical(interactions: Interaction[]): InteractionCanonical[] {
  return interactions.map(normalizeInteractionToCanonical);
}

/**
 * Query helper: Filtrar campanhas por usoPrincipal canônico
 */
export function filterCampaignsByUsoPrincipal(
  campaigns: CampaignCanonical[],
  usoPrincipal: UsoPrincipalCanônico
): CampaignCanonical[] {
  return campaigns.filter(c => c.usoPrincipal === usoPrincipal);
}

/**
 * Query helper: Filtrar campanhas por origem canônica
 */
export function filterCampaignsByOrigem(
  campaigns: CampaignCanonical[],
  origem: OrigemCanônica
): CampaignCanonical[] {
  return campaigns.filter(c => c.origem === origem);
}

/**
 * Query helper: Filtrar campanhas por escala
 */
export function filterCampaignsByEscala(
  campaigns: CampaignCanonical[],
  escala: EscalaCanônica
): CampaignCanonical[] {
  return campaigns.filter(c => c.escala === escala);
}

/**
 * Audit helper: Listar campos não totalmente seguros
 */
export function auditCampaignInferences(campaigns: CampaignCanonical[]): {
  totalCampaigns: number;
  withInferencesUnsafe: number;
  unsafeCampaigns: CampaignCanonical[];
} {
  const unsafe = campaigns.filter(c => !c._inferência_segura);
  return {
    totalCampaigns: campaigns.length,
    withInferencesUnsafe: unsafe.length,
    unsafeCampaigns: unsafe,
  };
}

/**
 * Audit helper: Listar interações não totalmente seguras
 */
export function auditInteractionInferences(interactions: InteractionCanonical[]): {
  totalInteractions: number;
  withInferencesUnsafe: number;
  unsafeInteractions: InteractionCanonical[];
} {
  const unsafe = interactions.filter(i => !i._inferência_segura);
  return {
    totalInteractions: interactions.length,
    withInferencesUnsafe: unsafe.length,
    unsafeInteractions: unsafe,
  };
}
