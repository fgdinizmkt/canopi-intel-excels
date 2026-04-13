#!/usr/bin/env bash
set -euo pipefail

echo "[seed] Exportando JSON do Bloco A..."
npx tsx -e "import { exportBlockASeedJson } from './scripts/seed/exportBlockASeedJson'; exportBlockASeedJson();"

echo "[seed] Validando coerência do Bloco A..."
npx tsx scripts/seed/validateBlockASeed.ts

echo "[seed] Gerando SQL do Bloco A..."
npx tsx -e "import { writeBlockASql } from './scripts/seed/buildBlockASql'; writeBlockASql();"

echo "[seed] Fluxo do Bloco A concluído com sucesso."
echo "[seed] Artefatos esperados:"
echo "  - seed/generated/bloco-a.parcial.json"
echo "  - seed/generated/bloco-a.parcial.sql"
