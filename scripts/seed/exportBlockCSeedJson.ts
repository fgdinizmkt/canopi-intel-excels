/**
 * Export Bloco C Seed to JSON
 *
 * Generates seed/generated/bloco-c.parcial.json from the canonical structure.
 * This is part of the automated seed generation pipeline.
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildBlockCSeed, BlockoCCanonical } from './buildBlockCSeed';

const SEED_OUTPUT_DIR = path.join(__dirname, '..', '..', 'seed', 'generated');
const BLOCO_C_OUTPUT_FILE = path.join(SEED_OUTPUT_DIR, 'bloco-c.parcial.json');

/**
 * Export Bloco C canonical structure to JSON
 *
 * Called from scripts/seed/runBlockCSeed.sh
 */
export function exportBlockCSeedJson(): void {
  console.log('[seed] Building Bloco C canonical structure...');

  try {
    // Build the canonical structure
    const blockoCCanonical = buildBlockCSeed();

    // Ensure output directory exists
    if (!fs.existsSync(SEED_OUTPUT_DIR)) {
      fs.mkdirSync(SEED_OUTPUT_DIR, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(
      BLOCO_C_OUTPUT_FILE,
      JSON.stringify(blockoCCanonical, null, 2),
      'utf-8'
    );

    console.log(`[seed] Bloco C exportado em: ${BLOCO_C_OUTPUT_FILE}`);
    console.log('[seed] Resumo do artefato gerado:');
    console.log(JSON.stringify({
      campaigns: blockoCCanonical.campaigns.length,
      interactions: blockoCCanonical.interactions.length,
      playRecommendations: blockoCCanonical.playRecommendations.length,
      playPoolSize: blockoCCanonical.playPool.length,
      ...blockoCCanonical.metadata.summary,
    }, null, 2));
  } catch (error) {
    console.error('[seed] Erro ao exportar Bloco C:', error);
    process.exit(1);
  }
}

export default exportBlockCSeedJson;
