#!/usr/bin/env bash
set -euo pipefail

echo "[seed] Exportando JSON do Bloco A..."
npx tsx -e "import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'; const mod = await import(pathToFileURL(resolve('scripts/seed/exportBlockASeedJson.ts')).href); await mod.exportBlockASeedJson();"

echo "[seed] Validando coerência do Bloco A..."
npx tsx -e "import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'; const mod = await import(pathToFileURL(resolve('scripts/seed/validateBlockASeed.ts')).href); await mod.validateBlockASeed();"

echo "[seed] Gerando SQL do Bloco A..."
npx tsx -e "import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'; const mod = await import(pathToFileURL(resolve('scripts/seed/buildBlockASql.ts')).href); await mod.writeBlockASql();"

echo "[seed] Fluxo do Bloco A concluído com sucesso."
echo "[seed] Artefatos esperados:"
echo "  - seed/generated/bloco-a.parcial.json"
echo "  - seed/generated/bloco-a.parcial.sql"
