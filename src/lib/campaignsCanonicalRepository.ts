/**
 * Campaigns Canonical Repository
 *
 * Camada de leitura que oferece DOIS read models em paralelo:
 * 1. getCampaigns() — Bloco C atual (legado)
 * 2. getCampaignsCanonical() — Bloco C normalizado para canônico
 *
 * Nenhum destes sobrescreve o outro. Ambos coexistem até migração completa.
 *
 * Padrão:
 * - Dados vêm do mesmo lugar (Supabase ou seed local)
 * - Leitura 1 retorna tipos atuais (Campaign)
 * - Leitura 2 retorna tipos normalizados (CampaignCanonical)
 * - Fallback defensivo preservado
 */

import { getCampaigns, getCampaignsMap } from './campaignsRepository';
import { getInteractions } from './interactionsRepository';
import {
  normalizeCampaignToCanonical,
  normalizeInteractionToCanonical,
  normalizeCampaignsToCanonical,
  normalizeInteractionsToCanonical,
  filterCampaignsByUsoPrincipal,
  filterCampaignsByOrigem,
  filterCampaignsByEscala,
  auditCampaignInferences,
  auditInteractionInferences,
  type CampaignCanonical,
  type InteractionCanonical,
} from '../data/campaignCanonicalDictionary';
import type { Campaign, Interaction } from '../../scripts/seed/buildBlockCSeed';

// ============================================================================
// READ MODEL 1: Bloco C Atual (sem mudança)
// ============================================================================

/**
 * Acesso ao Bloco C atual sem normalização (para compatibilidade com código existente)
 */
export async function getCampaignsCurrent(): Promise<Campaign[]> {
  return getCampaigns();
}

// ============================================================================
// READ MODEL 2: Bloco C Normalizado para Canônico
// ============================================================================

/**
 * Busca todas as campanhas e as normaliza para read model canônico
 */
export async function getCampaignsCanonical(): Promise<CampaignCanonical[]> {
  const current = await getCampaigns();
  return normalizeCampaignsToCanonical(current);
}

/**
 * Busca mapa de campanhas canônicas por ID
 */
export async function getCampaignsCanonicalMap(): Promise<Record<string, CampaignCanonical>> {
  const canonical = await getCampaignsCanonical();
  return canonical.reduce(
    (acc, campaign) => {
      acc[campaign.campaignaId] = campaign;
      return acc;
    },
    {} as Record<string, CampaignCanonical>
  );
}

/**
 * Normaliza uma campanha individual
 */
export function normalizeCampaign(campaign: Campaign): CampaignCanonical {
  return normalizeCampaignToCanonical(campaign);
}

// ============================================================================
// READ MODEL 3: Interações Canônicas
// ============================================================================

/**
 * Busca todas as interações e as normaliza para read model canônico
 */
export async function getInteractionsCanonical(): Promise<InteractionCanonical[]> {
  const current = await getInteractions();
  return normalizeInteractionsToCanonical(current);
}

/**
 * Busca interações de uma conta específica, normalizadas
 */
export async function getInteractionsCanonicalByAccount(accountId: string): Promise<InteractionCanonical[]> {
  const current = await getInteractions();
  const filtered = current.filter(i => i.accountId === accountId);
  return normalizeInteractionsToCanonical(filtered);
}

/**
 * Normaliza uma interação individual
 */
export function normalizeInteraction(interaction: Interaction): InteractionCanonical {
  return normalizeInteractionToCanonical(interaction);
}

// ============================================================================
// QUERY HELPERS: Filtros sobre modelo canônico
// ============================================================================

/**
 * Filtra campanhas canônicas por usoPrincipal
 */
export async function getCampaignsByUsoPrincipal(usoPrincipal: 'ABM' | 'ABX' | 'híbrido' | 'operacional_geral') {
  const campaigns = await getCampaignsCanonical();
  return filterCampaignsByUsoPrincipal(campaigns, usoPrincipal);
}

/**
 * Filtra campanhas canônicas por origem
 * Origem (Doc 15): orgânico | pago | prospecção ativa | parceria | base existente | indicação | direto
 */
export async function getCampaignsByOrigem(origem: 'orgânico' | 'pago' | 'prospecção ativa' | 'parceria' | 'base existente' | 'indicação' | 'direto') {
  const campaigns = await getCampaignsCanonical();
  return filterCampaignsByOrigem(campaigns, origem);
}

/**
 * Filtra campanhas canônicas por escala
 */
export async function getCampaignsByEscala(escala: '1:1' | '1:few' | '1:many') {
  const campaigns = await getCampaignsCanonical();
  return filterCampaignsByEscala(campaigns, escala);
}

/**
 * Filtra campanhas canônicas por tipoCampanha
 * TipoCampanha (Doc 15): conteúdo | captação | nutrição | prospecção | conversão | relacionamento | reativação | expansão | co-marketing | prova social
 */
export async function getCampaignsByTipoCampanha(
  tipoCampanha: 'conteúdo' | 'captação' | 'nutrição' | 'prospecção' | 'conversão' | 'relacionamento' | 'reativação' | 'expansão' | 'co-marketing' | 'prova social'
) {
  const campaigns = await getCampaignsCanonical();
  return campaigns.filter(c => c.tipoCampanha === tipoCampanha);
}

/**
 * Filtra campanhas canônicas por formato
 * Formato (Doc 15): webinar | workshop digital | podcast | vídeocast | sequência outreach | nurture | landing page | conteúdo rico | campanha paga | ação com parceiro | evento de mercado | evento próprio | workshop presencial
 */
export async function getCampaignsByFormato(
  formato: 'webinar' | 'workshop digital' | 'podcast' | 'vídeocast' | 'sequência outreach' | 'nurture' | 'landing page' | 'conteúdo rico' | 'campanha paga' | 'ação com parceiro' | 'evento de mercado' | 'evento próprio' | 'workshop presencial'
) {
  const campaigns = await getCampaignsCanonical();
  return campaigns.filter(c => c.formato === formato);
}

// ============================================================================
// AUDIT HELPERS
// ============================================================================

/**
 * Auditoria: Campanhas com inferências não seguras
 */
export async function auditCampaignInferencesSafety() {
  const campaigns = await getCampaignsCanonical();
  return auditCampaignInferences(campaigns);
}

/**
 * Auditoria: Interações com inferências não seguras
 */
export async function auditInteractionInferencesSafety() {
  const interactions = await getInteractionsCanonical();
  return auditInteractionInferences(interactions);
}

/**
 * Relatório completo de aderência à taxonomia canônica
 */
export async function reportCanonicalAdherence() {
  const [campaigns, interactions] = await Promise.all([getCampaignsCanonical(), getInteractionsCanonical()]);

  const campaignAudit = auditCampaignInferences(campaigns);
  const interactionAudit = auditInteractionInferences(interactions);

  // Distribuição por uso principal
  const byUsoPrincipal = {
    ABM: campaigns.filter(c => c.usoPrincipal === 'ABM').length,
    ABX: campaigns.filter(c => c.usoPrincipal === 'ABX').length,
    híbrido: campaigns.filter(c => c.usoPrincipal === 'híbrido').length,
    operacional_geral: campaigns.filter(c => c.usoPrincipal === 'operacional_geral').length,
  };

  // Distribuição por origem (Per Doc 15)
  const byOrigem = {
    orgânico: campaigns.filter(c => c.origem === 'orgânico').length,
    pago: campaigns.filter(c => c.origem === 'pago').length,
    'prospecção ativa': campaigns.filter(c => c.origem === 'prospecção ativa').length,
    parceria: campaigns.filter(c => c.origem === 'parceria').length,
    'base existente': campaigns.filter(c => c.origem === 'base existente').length,
    indicação: campaigns.filter(c => c.origem === 'indicação').length,
    direto: campaigns.filter(c => c.origem === 'direto').length,
  };

  // Distribuição por escala
  const byEscala = {
    '1:1': campaigns.filter(c => c.escala === '1:1').length,
    '1:few': campaigns.filter(c => c.escala === '1:few').length,
    '1:many': campaigns.filter(c => c.escala === '1:many').length,
  };

  // Campos não inferíveis com segurança
  const unsafeCampaigns = campaigns.filter(c => !c._inferência_segura).length;
  const unsafeInteractions = interactions.filter(i => !i._inferência_segura).length;

  return {
    campaigns: {
      total: campaigns.length,
      safe: campaigns.length - unsafeCampaigns,
      unsafe: unsafeCampaigns,
    },
    interactions: {
      total: interactions.length,
      safe: interactions.length - unsafeInteractions,
      unsafe: unsafeInteractions,
    },
    distribution: {
      byUsoPrincipal,
      byOrigem,
      byEscala,
    },
    gaps: {
      handRaiserNotIdentified: campaigns.length, // Nenhum hand raiser é detectável no Bloco C atual
      formatoExplicitoAusente: campaigns.filter(c => c.formato === c.campanha).length, // Formato é apenas name duplicado
    },
  };
}

// ============================================================================
// BACKWARD COMPATIBILITY: Manter `getCampaignsMap` funcional
// ============================================================================

/**
 * Compatibilidade: getCampaignsMap() ainda funciona como antes
 * (retorna Bloco C atual, não canônico)
 */
export async function getCampaignsMapCompat(): Promise<Record<string, Campaign>> {
  return getCampaignsMap();
}
