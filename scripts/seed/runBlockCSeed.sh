#!/usr/bin/env bash
set -euo pipefail

echo "[seed] Exportando JSON do Bloco C..."
npx tsx -e "import { exportBlockCSeedJson } from './scripts/seed/exportBlockCSeedJson'; exportBlockCSeedJson();"

echo "[seed] Validando coerência do Bloco C..."
npx tsx scripts/seed/validateBlockCSeed.ts

echo "[seed] Fluxo do Bloco C concluído com sucesso."
echo "[seed] Artefatos esperados:"
echo "  - seed/generated/bloco-c.parcial.json"
