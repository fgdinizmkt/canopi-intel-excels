/**
 * Export Bloco B Seed to JSON
 *
 * Generates seed/generated/bloco-b.parcial.json from the canonical structure.
 * This is part of the automated seed generation pipeline.
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildBlockBSeed, BlockoBCanonical } from './buildBlockBSeed';

const SEED_OUTPUT_DIR = path.join(__dirname, '..', '..', 'seed', 'generated');
const BLOCO_B_OUTPUT_FILE = path.join(SEED_OUTPUT_DIR, 'bloco-b.parcial.json');

/**
 * Export Bloco B canonical structure to JSON
 *
 * Called from scripts/seed/runBlockBSeed.sh
 */
export function exportBlockBSeedJson(): void {
  console.log('[seed] Building Bloco B canonical structure...');

  try {
    // Build the canonical structure
    const blockoBCanonical = buildBlockBSeed();

    // Ensure output directory exists
    if (!fs.existsSync(SEED_OUTPUT_DIR)) {
      fs.mkdirSync(SEED_OUTPUT_DIR, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(
      BLOCO_B_OUTPUT_FILE,
      JSON.stringify(blockoBCanonical, null, 2),
      'utf-8'
    );

    console.log(`[seed] Bloco B exportado em: ${BLOCO_B_OUTPUT_FILE}`);
    console.log('[seed] Resumo do artefato gerado:');
    console.log(JSON.stringify({
      integrations: blockoBCanonical.integrations.length,
      sourceSnapshots: blockoBCanonical.sourceSnapshots.length,
      accountSourceCoverage: blockoBCanonical.accountSourceCoverage.length,
      syncStatuses: blockoBCanonical.syncStatuses.length,
      ...blockoBCanonical.summary,
    }, null, 2));
  } catch (error) {
    console.error('[seed] Erro ao exportar Bloco B:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export default exportBlockBSeedJson;
