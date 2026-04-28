export interface CsvValidationError {
  code:
    | 'INVALID_EXTENSION'
    | 'EMPTY_FILE'
    | 'NO_HEADERS'
    | 'MISSING_REQUIRED_FIELD'
    | 'MISSING_DEDUPE_KEY';
  message: string;
}

export interface CsvValidationWarning {
  code:
    | 'LARGE_FILE'
    | 'ROWS_WITHOUT_DEDUPE_KEY'
    | 'DUPLICATE_DEDUPE_KEYS'
    | 'EMPTY_ROWS';
  message: string;
  count?: number;
  examples?: string[];
}

export interface CsvValidationResult {
  isValid: boolean;
  errors: CsvValidationError[];
  warnings: CsvValidationWarning[];
  rowsWithoutDedupeKey: number;
  duplicateDedupeKeys: string[];
  emptyRows: number;
}

export interface CsvUploadMeta {
  fileName: string;
  fileSizeBytes: number;
  headers: string[];
  rowCount: number;
  previewRows: Record<string, string>[];
  uploadedAt: string;
  validationResult: CsvValidationResult | null;
  schemaAnalysis?: CsvSchemaAnalysis | null;
}

export type CsvSchemaQualityLevel = 'alta' | 'média' | 'baixa';

export interface CsvSchemaRecommendation {
  csvField: string;
  canopiField: string;
  canopiLabel: string;
  confidence: CsvSchemaQualityLevel;
  reason: string;
  status: 'encontrado' | 'ausente';
}

export interface CsvSchemaAnalysis {
  totalHeaders: number;
  detectedRecommendedFields: CsvSchemaRecommendation[];
  missingRecommendedFields: CsvSchemaRecommendation[];
  extraHeaders: string[];
  suggestedMappings: CsvSchemaRecommendation[];
  qualityScore: number;
  qualityLevel: CsvSchemaQualityLevel;
  mappingConfidence: CsvSchemaQualityLevel;
  warnings: string[];
}

interface CsvSchemaFieldDefinition {
  canopiField: string;
  canopiLabel: string;
  aliases: string[];
}

const CSV_SCHEMA_EXACT_ONLY_ALIASES = new Set(['id']);

const CSV_SCHEMA_FIELD_DEFINITIONS: CsvSchemaFieldDefinition[] = [
  {
    canopiField: 'externalAccountId',
    canopiLabel: 'ID externo da conta',
    aliases: ['id', 'account_id', 'company_id', 'hs_object_id'],
  },
  {
    canopiField: 'accountName',
    canopiLabel: 'Nome da conta',
    aliases: ['name', 'company', 'empresa', 'account_name', 'razao_social', 'razão_social'],
  },
  {
    canopiField: 'accountDomain',
    canopiLabel: 'Domínio da conta',
    aliases: ['domain', 'website', 'site', 'dominio', 'domínio'],
  },
  {
    canopiField: 'accountIndustry',
    canopiLabel: 'Setor',
    aliases: ['industry', 'setor', 'segmento', 'vertical'],
  },
  {
    canopiField: 'accountCountry',
    canopiLabel: 'País',
    aliases: ['country', 'pais', 'país', 'country_code'],
  },
  {
    canopiField: 'externalOwnerId',
    canopiLabel: 'Owner externo',
    aliases: ['owner', 'owner_id', 'hubspot_owner_id', 'responsavel', 'responsável'],
  },
  {
    canopiField: 'externalCreatedAt',
    canopiLabel: 'Criado em',
    aliases: ['created_at', 'createdate', 'created_date', 'hs_createdate'],
  },
  {
    canopiField: 'externalUpdatedAt',
    canopiLabel: 'Atualizado em',
    aliases: ['updated_at', 'lastmodifieddate', 'updated_date', 'hs_lastmodifieddate'],
  },
];

function normalizeSchemaToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function scoreSchemaMatch(header: string, aliases: string[]): { confidence: CsvSchemaQualityLevel; reason: string; score: number } {
  const normalizedHeader = normalizeSchemaToken(header);
  let bestScore = 0;
  let bestReason = 'Nenhuma correspondência forte.';

  aliases.forEach((alias) => {
    const normalizedAlias = normalizeSchemaToken(alias);
    if (!normalizedHeader || !normalizedAlias) return;
    if (normalizedHeader === 'id' && normalizedAlias !== 'id') return;

    const headerTokens = new Set(normalizedHeader.split('_').filter(Boolean));
    const aliasTokens = new Set(normalizedAlias.split('_').filter(Boolean));
    const sharedTokens = [...headerTokens].filter((token) => aliasTokens.has(token)).length;
    const sharedSpecificTokens = [...headerTokens].filter(
      (token) => aliasTokens.has(token) && token.length > 3 && token !== 'id'
    ).length;
    const allowsSubstringMatch = normalizedAlias.length > 3;
    const exactOnlyAlias = CSV_SCHEMA_EXACT_ONLY_ALIASES.has(normalizedAlias);

    let score = 0;
    if (normalizedHeader === normalizedAlias) {
      score = 3;
    } else if (
      !exactOnlyAlias &&
      allowsSubstringMatch &&
      (normalizedHeader.includes(normalizedAlias) || normalizedAlias.includes(normalizedHeader))
    ) {
      score = 2;
    } else if (!exactOnlyAlias && sharedSpecificTokens > 0) {
      score = 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestReason = score === 3
        ? `Correspondência forte com o cabeçalho "${header}".`
        : score === 2
          ? `Correspondência semântica com o cabeçalho "${header}".`
          : `Inferência fraca a partir do cabeçalho "${header}".`;
    }
  });

  const confidence: CsvSchemaQualityLevel = bestScore === 3 ? 'alta' : bestScore === 2 ? 'média' : bestScore === 1 ? 'baixa' : 'baixa';
  return { confidence, reason: bestReason, score: bestScore };
}

function buildSchemaRecommendation(
  definition: CsvSchemaFieldDefinition,
  headers: string[]
): CsvSchemaRecommendation {
  let bestHeader = '';
  let bestScore = 0;
  let bestMatch = scoreSchemaMatch('', []);

  headers.forEach((header) => {
    const match = scoreSchemaMatch(header, definition.aliases);
    if (match.score > bestScore) {
      bestScore = match.score;
      bestHeader = match.score > 0 ? header : bestHeader;
      bestMatch = match;
    }
  });

  if (bestScore > 0 && bestHeader) {
    return {
      csvField: bestHeader,
      canopiField: definition.canopiField,
      canopiLabel: definition.canopiLabel,
      confidence: bestMatch.confidence,
      reason: bestMatch.reason,
      status: 'encontrado',
    };
  }

  return {
    csvField: '',
    canopiField: definition.canopiField,
    canopiLabel: definition.canopiLabel,
    confidence: 'baixa',
    reason: 'Nenhum cabeçalho compatível foi encontrado.',
    status: 'ausente',
  };
}

export function analyzeCsvSchema(
  parsed: ParsedCsv,
  options: {
    requiredMinimumField: string;
    dedupeKey: string;
  }
): CsvSchemaAnalysis {
  const { requiredMinimumField, dedupeKey } = options;
  const headers = parsed.headers ?? [];
  const normalizedHeaders = headers.map((header) => normalizeSchemaToken(header));
  const recommendations = CSV_SCHEMA_FIELD_DEFINITIONS.map((definition) => buildSchemaRecommendation(definition, headers));
  const detectedRecommendedFields = recommendations.filter((mapping) => mapping.status === 'encontrado');
  const missingRecommendedFields = recommendations.filter((mapping) => mapping.status === 'ausente');
  const extraHeaders = headers.filter((header) => {
    return !CSV_SCHEMA_FIELD_DEFINITIONS.some((definition) => scoreSchemaMatch(header, definition.aliases).score > 0);
  });

  const requiredHeader = normalizeSchemaToken(requiredMinimumField);
  const dedupeHeader = normalizeSchemaToken(dedupeKey);
  const hasRequiredField = requiredHeader.length > 0
    ? normalizedHeaders.includes(requiredHeader)
    : true;
  const hasDedupeKey = dedupeHeader.length > 0
    ? normalizedHeaders.includes(dedupeHeader)
    : true;

  const rowsWithoutDedupeKey = dedupeKey.trim().length > 0
    ? parsed.rows.filter((row) => {
      const value = row[dedupeKey.trim()];
      return !value || value.trim() === '';
    }).length
    : 0;

  const duplicateKeyCounts = new Map<string, number>();
  if (dedupeKey.trim().length > 0) {
    parsed.rows.forEach((row) => {
      const value = (row[dedupeKey.trim()] || '').trim();
      if (!value) return;
      duplicateKeyCounts.set(value, (duplicateKeyCounts.get(value) || 0) + 1);
    });
  }
  const duplicateDedupeKeys = [...duplicateKeyCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);

  let qualityScore = 58;
  if (headers.length > 0) qualityScore += Math.min(10, headers.length * 2);
  qualityScore += Math.min(12, detectedRecommendedFields.length * 3);
  if (hasRequiredField) qualityScore += 14; else qualityScore -= 26;
  if (hasDedupeKey) qualityScore += 14; else qualityScore -= 22;
  if (parsed.rows.length > 0 && rowsWithoutDedupeKey > 0) {
    qualityScore -= Math.min(18, Math.round((rowsWithoutDedupeKey / Math.max(parsed.rows.length, 1)) * 30));
  }
  if (duplicateDedupeKeys.length > 0) {
    qualityScore -= Math.min(16, duplicateDedupeKeys.length * 4);
  }
  if (missingRecommendedFields.length > 0) {
    qualityScore -= Math.min(12, missingRecommendedFields.length * 2);
  }
  if (extraHeaders.length > headers.length / 2 && headers.length > 0) {
    qualityScore -= 5;
  }
  if (headers.length === 0) {
    qualityScore = 0;
  }

  qualityScore = Math.max(0, Math.min(100, qualityScore));

  const qualityLevel: CsvSchemaQualityLevel = qualityScore >= 80 ? 'alta' : qualityScore >= 55 ? 'média' : 'baixa';
  const mappingConfidence: CsvSchemaQualityLevel = detectedRecommendedFields.length >= 6 && qualityScore >= 80
    ? 'alta'
    : detectedRecommendedFields.length >= 3 || qualityScore >= 55
      ? 'média'
      : 'baixa';

  const warnings: string[] = [];
  if (headers.length === 0) {
    warnings.push('Nenhum cabeçalho detectado para a análise local do CSV.');
  }
  if (!hasRequiredField && normalizeSchemaToken(requiredMinimumField).length > 0) {
    warnings.push(`Campo obrigatório ausente: "${requiredMinimumField}".`);
  }
  if (!hasDedupeKey && normalizeSchemaToken(dedupeKey).length > 0) {
    warnings.push(`Chave de dedupe ausente ou fraca: "${dedupeKey}".`);
  }
  if (rowsWithoutDedupeKey > 0) {
    warnings.push(`${rowsWithoutDedupeKey} linha(s) sem valor na chave de dedupe "${dedupeKey}".`);
  }
  if (duplicateDedupeKeys.length > 0) {
    warnings.push(`${duplicateDedupeKeys.length} valor(es) duplicado(s) na chave de dedupe "${dedupeKey}".`);
  }
  if (missingRecommendedFields.length > 0) {
    warnings.push(`Campos recomendados ausentes: ${missingRecommendedFields.map((mapping) => mapping.canopiField).join(', ')}.`);
  }
  if (extraHeaders.length > 0) {
    warnings.push(`${extraHeaders.length} cabeçalho(s) extra(s) não mapeado(s) nesta análise local.`);
  }
  if (qualityLevel === 'baixa') {
    warnings.push('Qualidade mínima da base abaixo do ideal para seguir sem revisão.');
  }

  return {
    totalHeaders: headers.length,
    detectedRecommendedFields,
    missingRecommendedFields,
    extraHeaders,
    suggestedMappings: recommendations,
    qualityScore,
    qualityLevel,
    mappingConfidence,
    warnings,
  };
}

// RFC 4180 minimal: respects quoted fields containing the delimiter or newlines.
function splitCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // Escaped quote inside quoted field: ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (line.slice(i, i + delimiter.length) === delimiter) {
        fields.push(current.trim());
        current = '';
        i += delimiter.length - 1;
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  rawRowCount: number;
  emptyRowCount: number;
}

export type CsvParsePhase =
  | 'reading_file'
  | 'parsing_csv'
  | 'validating_columns'
  | 'building_preview'
  | 'done'
  | 'error';

export interface CsvParseProgress {
  phase: CsvParsePhase;
  processedRows: number;
  totalRows: number;
  percent: number;
  message: string;
}

export interface CsvParseOptions {
  onProgress?: (progress: CsvParseProgress) => void;
}

function waitForPaint(): Promise<void> {
  if (typeof requestAnimationFrame === 'function') {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function parseCsvText(
  text: string,
  delimiter: string,
  hasHeaderInFirstLine: boolean,
  options: CsvParseOptions = {}
): Promise<ParsedCsv> {
  const emitProgress = (
    phase: CsvParsePhase,
    processedRows: number,
    totalRows: number,
    percent: number,
    message: string
  ) => {
    options.onProgress?.({
      phase,
      processedRows,
      totalRows,
      percent,
      message,
    });
  };

  // Normalize CRLF → LF then split
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let headers: string[] = [];
  const dataLines: string[] = [];
  let emptyRowCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (i === 0 && hasHeaderInFirstLine) {
      headers = splitCsvLine(line, delimiter);
      continue;
    }
    if (line === '') {
      emptyRowCount++;
      continue;
    }
    dataLines.push(line);
  }

  const totalRows = dataLines.length;
  const batchSize = Math.max(50, Math.ceil(Math.max(totalRows, 1) / 20));
  const rows: Record<string, string>[] = [];

  emitProgress(
    'parsing_csv',
    0,
    totalRows,
    totalRows > 0 ? 15 : 100,
    totalRows > 0
      ? 'Interpretando o CSV no navegador...'
      : 'Nenhuma linha de dados encontrada para processar.'
  );

  if (!hasHeaderInFirstLine && dataLines.length > 0) {
    // Generate column indices as fallback headers
    const firstRow = splitCsvLine(dataLines[0], delimiter);
    headers = firstRow.map((_, idx) => `col_${idx + 1}`);
  }

  for (let start = 0; start < dataLines.length; start += batchSize) {
    const batch = dataLines.slice(start, start + batchSize);
    batch.forEach((line) => {
      const values = splitCsvLine(line, delimiter);
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] ?? '';
      });
      rows.push(row);
    });

    const processedRows = Math.min(rows.length, totalRows);
    const progressPercent = totalRows > 0 ? Math.min(78, 15 + Math.round((processedRows / totalRows) * 63)) : 78;
    emitProgress(
      'parsing_csv',
      processedRows,
      totalRows,
      progressPercent,
      totalRows > 0
        ? `Processando linhas ${processedRows.toLocaleString('pt-BR')} de ${totalRows.toLocaleString('pt-BR')}...`
        : 'Nenhuma linha útil encontrada no arquivo.'
    );

    if (start + batchSize < dataLines.length) {
      await waitForPaint();
    }
  }

  emitProgress(
    'validating_columns',
    rows.length,
    totalRows,
    totalRows > 0 ? 86 : 90,
    'Preparando validação das colunas e do preview...'
  );
  await waitForPaint();
  emitProgress(
    'building_preview',
    rows.length,
    totalRows,
    totalRows > 0 ? 94 : 96,
    'Montando o preview local...'
  );
  await waitForPaint();
  emitProgress(
    'done',
    rows.length,
    totalRows,
    100,
    'CSV lido e pronto para validação local.'
  );

  return { headers, rows, rawRowCount: dataLines.length, emptyRowCount };
}

export function validateCsvData(
  fileName: string,
  fileSizeBytes: number,
  parsed: ParsedCsv,
  options: {
    requiredMinimumField: string;
    dedupeKey: string;
    maxPreviewRows?: number;
  }
): { previewRows: Record<string, string>[]; validation: CsvValidationResult } {
  const { requiredMinimumField, dedupeKey, maxPreviewRows = 5 } = options;
  const errors: CsvValidationError[] = [];
  const warnings: CsvValidationWarning[] = [];

  // INVALID_EXTENSION
  if (!fileName.toLowerCase().endsWith('.csv')) {
    errors.push({ code: 'INVALID_EXTENSION', message: 'O arquivo deve ter extensão .csv.' });
  }

  // EMPTY_FILE
  if (fileSizeBytes === 0 || parsed.rawRowCount === 0) {
    errors.push({ code: 'EMPTY_FILE', message: 'O arquivo está vazio ou não contém linhas de dados.' });
  }

  // NO_HEADERS
  if (parsed.headers.length === 0) {
    errors.push({ code: 'NO_HEADERS', message: 'Nenhum cabeçalho detectado no arquivo.' });
  }

  // MISSING_REQUIRED_FIELD
  if (
    requiredMinimumField.trim() &&
    parsed.headers.length > 0 &&
    !parsed.headers.includes(requiredMinimumField.trim())
  ) {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      message: `Campo obrigatório "${requiredMinimumField}" não encontrado nos cabeçalhos.`,
    });
  }

  // MISSING_DEDUPE_KEY
  if (
    dedupeKey.trim() &&
    parsed.headers.length > 0 &&
    !parsed.headers.includes(dedupeKey.trim())
  ) {
    errors.push({
      code: 'MISSING_DEDUPE_KEY',
      message: `Chave de dedupe "${dedupeKey}" não encontrada nos cabeçalhos.`,
    });
  }

  // LARGE_FILE
  if (fileSizeBytes > 5 * 1024 * 1024) {
    warnings.push({
      code: 'LARGE_FILE',
      message: `Arquivo grande (${(fileSizeBytes / 1024 / 1024).toFixed(1)} MB). Processamento pode ser mais lento.`,
    });
  }

  let rowsWithoutDedupeKey = 0;
  const duplicateDedupeKeys: string[] = [];
  let emptyRows = parsed.emptyRowCount;

  if (parsed.headers.length > 0 && parsed.rows.length > 0) {
    // ROWS_WITHOUT_DEDUPE_KEY
    if (dedupeKey.trim() && parsed.headers.includes(dedupeKey.trim())) {
      rowsWithoutDedupeKey = parsed.rows.filter(
        (row) => !row[dedupeKey.trim()] || row[dedupeKey.trim()].trim() === ''
      ).length;
      if (rowsWithoutDedupeKey > 0) {
        warnings.push({
          code: 'ROWS_WITHOUT_DEDUPE_KEY',
          message: `${rowsWithoutDedupeKey} linha(s) sem valor na chave de dedupe "${dedupeKey}".`,
          count: rowsWithoutDedupeKey,
        });
      }

      // DUPLICATE_DEDUPE_KEYS
      const seen = new Map<string, number>();
      parsed.rows.forEach((row) => {
        const val = (row[dedupeKey.trim()] || '').trim();
        if (val) seen.set(val, (seen.get(val) || 0) + 1);
      });
      seen.forEach((count, val) => {
        if (count > 1) duplicateDedupeKeys.push(val);
      });
      if (duplicateDedupeKeys.length > 0) {
        warnings.push({
          code: 'DUPLICATE_DEDUPE_KEYS',
          message: `${duplicateDedupeKeys.length} valor(es) duplicado(s) na chave de dedupe "${dedupeKey}".`,
          count: duplicateDedupeKeys.length,
          examples: duplicateDedupeKeys.slice(0, 10),
        });
      }
    }

    // EMPTY_ROWS (already counted in parseCsvText)
    if (emptyRows > 0) {
      warnings.push({
        code: 'EMPTY_ROWS',
        message: `${emptyRows} linha(s) completamente vazia(s) ignorada(s).`,
        count: emptyRows,
      });
    }
  }

  const previewRows = parsed.rows.slice(0, maxPreviewRows);

  return {
    previewRows,
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowsWithoutDedupeKey,
      duplicateDedupeKeys: duplicateDedupeKeys.slice(0, 10),
      emptyRows,
    },
  };
}
