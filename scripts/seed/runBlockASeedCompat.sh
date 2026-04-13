#!/usr/bin/env bash
set -euo pipefail

echo "[seed] Exportando JSON do Bloco A..."
npx tsx -e "(async () => { const { pathToFileURL } = await import('node:url'); const { resolve } = await import('node:path'); const mod = await import(pathToFileURL(resolve('scripts/seed/exportBlockASeedJson.ts')).href); await mod.exportBlockASeedJson(); })().catch((error) => { console.error(error); process.exit(1); });"

echo "[seed] Validando coerência do Bloco A..."
npx tsx -e "(async () => { const { pathToFileURL } = await import('node:url'); const { resolve } = await import('node:path'); const mod = await import(pathToFileURL(resolve('scripts/seed/validateBlockASeed.ts')).href); await mod.validateBlockASeed(); })().catch((error) => { console.error(error); process.exit(1); });"

echo "[seed] Gerando SQL do Bloco A..."
npx tsx -e "(async () => { const { pathToFileURL } = await import('node:url'); const { resolve } = await import('node:path'); const mod = await import(pathToFileURL(resolve('scripts/seed/buildBlockASql.ts')).href); await mod.writeBlockASql(); })().catch((error) => { console.error(error); process.exit(1); });"

echo "[seed] Fluxo do Bloco A concluído com sucesso."
echo "[seed] Artefatos esperados:"
echo "  - seed/generated/bloco-a.parcial.json"
echo "  - seed/generated/bloco-a.parcial.sql"
