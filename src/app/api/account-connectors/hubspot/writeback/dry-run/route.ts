import { NextRequest, NextResponse } from 'next/server';
import { inflateRawSync } from 'node:zlib';
import { parseCsvText } from '@/src/lib/parseCsvLocal';
import { normalizeHubspotWritebackFiles } from '@/src/lib/hubspotWritebackNormalizer';

export const dynamic = 'force-dynamic';

type ParsedUpload = {
  fileName: string;
  fileType: 'csv' | 'xlsx';
  headers: string[];
  rows: Record<string, string>[];
};

type XlsxEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
};

function readUint16LE(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function readUint32LE(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder('utf-8').decode(bytes);
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeFileType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.csv')) return 'csv' as const;
  if (lower.endsWith('.xlsx') || lower.endsWith('.xlsm')) return 'xlsx' as const;
  return null;
}

function detectDelimiter(text: string) {
  const sample = text.split(/\r?\n/).slice(0, 5).join('\n');
  const commaCount = (sample.match(/,/g) || []).length;
  const semicolonCount = (sample.match(/;/g) || []).length;
  const tabCount = (sample.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
}

function splitXmlAttributes(fragment: string) {
  const attributes: Record<string, string> = {};
  const attributeRegex = /([A-Za-z_:][\w:.-]*)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = attributeRegex.exec(fragment))) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

function columnLettersToIndex(columnLetters: string) {
  let index = 0;
  for (let i = 0; i < columnLetters.length; i += 1) {
    index = index * 26 + (columnLetters.charCodeAt(i) - 64);
  }
  return index - 1;
}

function findZipEntries(bytes: Uint8Array): XlsxEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const searchStart = Math.max(0, bytes.length - 66_000);
  let eocdOffset = -1;

  for (let offset = bytes.length - 22; offset >= searchStart; offset -= 1) {
    if (readUint32LE(view, offset) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) throw new Error('Arquivo XLSX inválido: assinatura ZIP não encontrada.');

  const totalEntries = readUint16LE(view, eocdOffset + 10);
  const centralDirectoryOffset = readUint32LE(view, eocdOffset + 16);
  const entries: XlsxEntry[] = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    if (readUint32LE(view, offset) !== 0x02014b50) break;

    const compressionMethod = readUint16LE(view, offset + 10);
    const compressedSize = readUint32LE(view, offset + 20);
    const fileNameLength = readUint16LE(view, offset + 28);
    const extraLength = readUint16LE(view, offset + 30);
    const commentLength = readUint16LE(view, offset + 32);
    const localHeaderOffset = readUint32LE(view, offset + 42);
    const fileNameBytes = bytes.slice(offset + 46, offset + 46 + fileNameLength);
    const fileName = decodeUtf8(fileNameBytes);

    entries.push({
      name: fileName,
      compressionMethod,
      compressedSize,
      localHeaderOffset,
    });

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readZipEntry(bytes: Uint8Array, entry: XlsxEntry): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const localHeaderOffset = entry.localHeaderOffset;
  if (readUint32LE(view, localHeaderOffset) !== 0x04034b50) {
    throw new Error(`Arquivo XLSX inválido: entrada local ausente em ${entry.name}.`);
  }

  const fileNameLength = readUint16LE(view, localHeaderOffset + 26);
  const extraLength = readUint16LE(view, localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + fileNameLength + extraLength;
  const compressedBytes = bytes.slice(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return decodeUtf8(compressedBytes);
  }

  if (entry.compressionMethod === 8) {
    return decodeUtf8(inflateRawSync(compressedBytes));
  }

  throw new Error(`Método de compressão não suportado no XLSX: ${entry.compressionMethod}.`);
}

function parseSharedStrings(xml: string): string[] {
  const sharedStrings: string[] = [];
  const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let siMatch: RegExpExecArray | null;

  while ((siMatch = siRegex.exec(xml))) {
    const entryXml = siMatch[1];
    const textFragments = [...entryXml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((fragment) => decodeXmlEntities(fragment[1] || ''));
    sharedStrings.push(textFragments.join(''));
  }

  return sharedStrings;
}

function parseWorksheetRows(xml: string, sharedStrings: string[]): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const rowRegex = /<row\b[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(xml))) {
    const rowXml = rowMatch[2];
    const rowValues: string[] = [];
    const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowXml))) {
      const attributes = splitXmlAttributes(cellMatch[1]);
      const reference = attributes.r || '';
      const type = attributes.t || 'n';
      const valueXml = cellMatch[2];
      const columnMatch = reference.match(/^[A-Z]+/);
      const columnIndex = columnMatch ? columnLettersToIndex(columnMatch[0]) : rowValues.length;
      let value = '';

      if (type === 's') {
        const sharedMatch = valueXml.match(/<v>([\s\S]*?)<\/v>/);
        const sharedIndex = sharedMatch ? Number(sharedMatch[1]) : NaN;
        value = Number.isFinite(sharedIndex) ? (sharedStrings[sharedIndex] || '') : '';
      } else if (type === 'inlineStr') {
        const inlineMatch = valueXml.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
        value = inlineMatch ? decodeXmlEntities(inlineMatch[1]) : '';
      } else {
        const plainMatch = valueXml.match(/<v>([\s\S]*?)<\/v>/);
        value = plainMatch ? decodeXmlEntities(plainMatch[1]) : '';
      }

      rowValues[columnIndex] = value.trim();
    }

    rows.push(
      rowValues.reduce<Record<string, string>>((accumulator, value, columnIndex) => {
        accumulator[String(columnIndex)] = value || '';
        return accumulator;
      }, {})
    );
  }

  return rows;
}

function xlsxRowsToRecords(xml: string, sharedStrings: string[]) {
  const rows = parseWorksheetRows(xml, sharedStrings);
  if (rows.length === 0) return { headers: [] as string[], records: [] as Record<string, string>[] };

  const headerValues = Object.values(rows[0] || {});
  const headers = headerValues.map((header) => (header || '').trim()).filter(Boolean);
  const records: Record<string, string>[] = [];

  rows.slice(1).forEach((row) => {
    const values = Object.values(row);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    if (Object.values(record).some((value) => value && value.trim().length > 0)) {
      records.push(record);
    }
  });

  return { headers, records };
}

async function parseUploadedFile(file: File): Promise<ParsedUpload> {
  const fileName = file.name || 'upload';
  const fileType = normalizeFileType(fileName);
  if (!fileType) {
    throw new Error('Formato não suportado. Use CSV, XLSX ou XLSM.');
  }

  if (fileType === 'csv') {
    const text = await file.text();
    const delimiter = detectDelimiter(text);
    const parsed = await parseCsvText(text, delimiter, true);
    return { fileName, fileType, headers: parsed.headers, rows: parsed.rows };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = findZipEntries(bytes);
  const sharedStringsEntry = entries.find((entry) => entry.name === 'xl/sharedStrings.xml');
  const sheetEntry = entries
    .filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(entry.name))
    .sort((left, right) => {
      const leftNumber = Number((left.name.match(/sheet(\d+)\.xml/i) || [])[1] || 0);
      const rightNumber = Number((right.name.match(/sheet(\d+)\.xml/i) || [])[1] || 0);
      return leftNumber - rightNumber;
    })[0];

  if (!sheetEntry) {
    throw new Error('Arquivo XLSX inválido: nenhuma planilha encontrada.');
  }

  const sharedStrings = sharedStringsEntry ? parseSharedStrings(readZipEntry(bytes, sharedStringsEntry)) : [];
  const workbookXml = entries.find((entry) => entry.name === 'xl/workbook.xml');
  if (workbookXml) {
    // touch workbook so malformed archives surface early
    readZipEntry(bytes, workbookXml);
  }

  const sheetXml = readZipEntry(bytes, sheetEntry);
  const { headers, records } = xlsxRowsToRecords(sheetXml, sharedStrings);

  return { fileName, fileType, headers, rows: records };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const companiesFile = formData?.get('companiesFile');
  const contactsFile = formData?.get('contactsFile');
  const fallbackFile = formData?.get('file');

  const hasAnyUpload = companiesFile instanceof File || contactsFile instanceof File || fallbackFile instanceof File;
  if (!hasAnyUpload) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Envie uma base de empresas, uma base de contatos ou um arquivo único para preparar o dry-run.',
      },
      { status: 400 }
    );
  }

  try {
    const parsedCompanies = companiesFile instanceof File ? await parseUploadedFile(companiesFile) : null;
    const parsedContacts = contactsFile instanceof File ? await parseUploadedFile(contactsFile) : null;
    const parsedFallback = fallbackFile instanceof File ? await parseUploadedFile(fallbackFile) : null;

    const combinedHeaders = [
      ...new Set([
        ...(parsedCompanies?.headers ?? []),
        ...(parsedContacts?.headers ?? []),
        ...(parsedFallback?.headers ?? []),
      ]),
    ];

    let result;
    if (parsedCompanies && parsedContacts) {
      result = normalizeHubspotWritebackFiles({
        fileName: `${parsedCompanies.fileName} + ${parsedContacts.fileName}`,
        fileType: parsedCompanies.fileType === parsedContacts.fileType ? parsedCompanies.fileType : 'mixed',
        headers: combinedHeaders,
        companiesRows: parsedCompanies.rows,
        contactsRows: parsedContacts.rows,
      });
    } else if (parsedCompanies) {
      result = normalizeHubspotWritebackFiles({
        fileName: parsedCompanies.fileName,
        fileType: parsedCompanies.fileType,
        headers: parsedCompanies.headers,
        companiesRows: parsedCompanies.rows,
      });
    } else if (parsedContacts) {
      result = normalizeHubspotWritebackFiles({
        fileName: parsedContacts.fileName,
        fileType: parsedContacts.fileType,
        headers: parsedContacts.headers,
        contactsRows: parsedContacts.rows,
      });
    } else {
      result = normalizeHubspotWritebackFiles({
        fileName: parsedFallback?.fileName || 'upload',
        fileType: parsedFallback?.fileType || 'mixed',
        headers: parsedFallback?.headers || [],
        mixedRows: parsedFallback?.rows || [],
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível processar o arquivo enviado.';
    return NextResponse.json(
      {
        status: 'error',
        error: message,
      },
      { status: 400 }
    );
  }
}
