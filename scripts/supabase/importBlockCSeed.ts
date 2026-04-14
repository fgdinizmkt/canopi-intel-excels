/**
 * Import Bloco C Seed to Supabase
 *
 * Idempotent import of campaigns, interactions, and play_recommendations.
 * Source: seed/generated/bloco-c.parcial.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Simple manual .env.local parser to avoid dependencies outside package.json
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL_DEV;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV; // Should use service role for imports

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[Import] Error: NEXT_PUBLIC_SUPABASE_URL_DEV or SUPABASE_SERVICE_ROLE_KEY_DEV not found in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SEED_FILE = path.join(__dirname, '../../seed/generated/bloco-c.parcial.json');

async function importBlockC() {
  console.log('[Import] Iniciando importação do Bloco C...');

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`[Import] Arquivo não encontrado: ${SEED_FILE}`);
    process.exit(1);
  }

  const seedData = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  const { campaigns, interactions, playRecommendations } = seedData;

  // 1. Import Campaigns
  console.log(`[Import] Upserting ${campaigns.length} campaigns...`);
  const { error: camError } = await supabase
    .from('campaigns')
    .upsert(campaigns.map((c: any) => ({
      ...c,
      // Map camelCase to snake_case if necessary, but migration uses snake_case and seed uses camelCase?
      // Let's check migration vs seed. 
      // Seed: id, name, type, channel, source, startDate, endDate, budget, objective, targetAudience, accountsReached, accountsEngaged, signalsGenerated, isActive, performance
      // Migration: id, name, type, channel, source, start_date, end_date, budget, objective, target_audience, accounts_reached, accounts_engaged, signals_generated, is_active, performance
      
      start_date: c.startDate,
      end_date: c.endDate,
      target_audience: c.targetAudience,
      accounts_reached: c.accountsReached,
      accounts_engaged: c.accountsEngaged,
      signals_generated: c.signalsGenerated,
      is_active: c.isActive,
      // Remove camelCase fields to avoid Supabase errors if not in table
      startDate: undefined,
      endDate: undefined,
      targetAudience: undefined,
      accountsReached: undefined,
      accountsEngaged: undefined,
      signalsGenerated: undefined,
      isActive: undefined
    })), { onConflict: 'id' });

  if (camError) console.error('[Import] Error campaigns:', camError.message);
  else console.log('[Import] Campaigns finalizadas.');

  // 2. Import Interactions
  console.log(`[Import] Upserting ${interactions.length} interactions...`);
  // Break into chunks to avoid request size limits
  const INTERACTION_CHUNKS = 50;
  for (let i = 0; i < interactions.length; i += INTERACTION_CHUNKS) {
    const chunk = interactions.slice(i, i + INTERACTION_CHUNKS);
    const { error: intError } = await supabase
      .from('interactions')
      .upsert(chunk.map((int: any) => ({
        id: int.id,
        account_id: int.accountId,
        campaign_id: int.campaignId,
        interaction_type: int.interactionType,
        timestamp: int.timestamp,
        date: int.date,
        channel: int.channel,
        direction: int.direction,
        initiator: int.initiator,
        description: int.description,
        relevance: int.relevance,
        sentiment: int.sentiment,
        owner: int.owner,
        follow_up_required: int.followUpRequired,
        next_step: int.nextStep,
        source: int.source,
        confidence: int.confidence,
      })), { onConflict: 'id' });
    
    if (intError) console.error(`[Import] Error interactions chunk ${i}:`, intError.message);
  }
  console.log('[Import] Interactions finalizadas.');

  // 3. Import Play Recommendations
  console.log(`[Import] Upserting ${playRecommendations.length} play recommendations...`);
  const { error: playError } = await supabase
    .from('play_recommendations')
    .upsert(playRecommendations.map((p: any) => ({
      id: p.id,
      account_id: p.accountId,
      play_id: p.playId,
      play_name: p.playName,
      play_type: p.playType,
      rationale: p.rationale,
      key_signals: p.keySignals,
      account_readiness: p.accountReadiness,
      estimated_value: p.estimatedValue,
      timeline_weeks: p.timelineWeeks,
      confidence_score: p.confidenceScore,
      is_active: p.isActive,
      started_at: p.startedAt,
      success_probability: p.successProbability,
      next_step_description: p.nextStepDescription,
      next_step_owner: p.nextStepOwner,
      next_step_deadline: p.nextStepDeadline,
    })), { onConflict: 'id' });

  if (playError) console.error('[Import] Error play recommendations:', playError.message);
  else console.log('[Import] Play Recommendations finalizadas.');

  console.log('[Import] Processo concluído.');
}

importBlockC();
