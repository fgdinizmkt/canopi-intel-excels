#!/usr/bin/env bash
set -euo pipefail

echo "[seed] Exportando JSON do Bloco A..."
npx tsx scripts/seed/exportBlockASeedJson.ts

echo "[seed] Validando coerência do Bloco A..."
npx tsx scripts/seed/validateBlockASeed.ts

echo "[seed] Gerando SQL do Bloco A..."
npx tsx scripts/seed/buildBlockASql.ts

echo "[seed] Fluxo do Bloco A concluído com sucesso."
echo "[seed] Artefatos esperados:"
echo "  - seed/generated/bloco-a.parcial.json"
echo "  - seed/generated/bloco-a.parcial.sql"
