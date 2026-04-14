#!/usr/bin/env bash
set -euo pipefail

echo "[seed] Exportando JSON do Bloco B..."
npx tsx -e "import { exportBlockBSeedJson } from './scripts/seed/exportBlockBSeedJson'; exportBlockBSeedJson();"

echo "[seed] Validando coerência do Bloco B..."
npx tsx scripts/seed/validateBlockBSeed.ts

echo "[seed] Fluxo do Bloco B concluído com sucesso."
echo "[seed] Artefatos esperados:"
echo "  - seed/generated/bloco-b.parcial.json"
