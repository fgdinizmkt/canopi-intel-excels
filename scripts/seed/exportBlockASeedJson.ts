import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBlockASeed } from './buildBlockASeed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BLOCK_A_OUTPUT_DIR = join(__dirname, '../../seed/generated');
export const BLOCK_A_OUTPUT_FILE = join(BLOCK_A_OUTPUT_DIR, 'bloco-a.parcial.json');

export async function exportBlockASeedJson(): Promise<void> {
  const seed = buildBlockASeed();

  await mkdir(BLOCK_A_OUTPUT_DIR, { recursive: true });
  await writeFile(BLOCK_A_OUTPUT_FILE, JSON.stringify(seed, null, 2), 'utf-8');

  console.log(`[seed] Bloco A exportado em: ${BLOCK_A_OUTPUT_FILE}`);
  console.log('[seed] Resumo do artefato gerado:');
  console.log(JSON.stringify(seed.summary, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  exportBlockASeedJson().catch((error) => {
    console.error('[seed] Falha ao exportar Bloco A:', error);
    process.exit(1);
  });
}
