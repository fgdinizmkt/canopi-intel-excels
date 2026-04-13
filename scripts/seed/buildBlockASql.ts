import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBlockASeed } from './buildBlockASeed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BLOCK_A_SQL_OUTPUT_DIR = join(__dirname, '../../seed/generated');
export const BLOCK_A_SQL_OUTPUT_FILE = join(BLOCK_A_SQL_OUTPUT_DIR, 'bloco-a.parcial.sql');

function sqlString(value?: string | null): string {
  if (value === undefined || value === null) return 'null';
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlNumber(value?: number | null): string {
  if (value === undefined || value === null) return 'null';
  return String(value);
}

function sqlBoolean(value?: boolean | null): string {
  if (value === undefined || value === null) return 'null';
  return value ? 'true' : 'false';
}

function sqlJson(value: unknown): string {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function sqlTextArray(values?: string[] | null): string {
  if (!values || values.length === 0) return 'ARRAY[]::text[]';
  return `ARRAY[${values.map((value) => sqlString(value)).join(', ')}]::text[]`;
}

function buildAccountsSql(): string {
  const rows = buildBlockASeed().tables.accounts;

  if (rows.length === 0) return '-- accounts: sem linhas';

  const values = rows
    .map((row) => `(
      ${sqlString(row.id)},
      ${sqlString(row.slug)},
      ${sqlString(row.nome)},
      ${sqlString(row.dominio)},
      ${sqlString(row.vertical)},
      ${sqlString(row.segmento)},
      ${sqlString(row.porte)},
      ${sqlString(row.localizacao)},
      ${sqlString(row.ownerPrincipal)},
      ${sqlString(row.etapa)},
      ${sqlString(row.tipoEstrategico)},
      ${sqlNumber(row.potencial)},
      ${sqlNumber(row.risco)},
      ${sqlNumber(row.prontidao)},
      ${sqlNumber(row.coberturaRelacional)},
      ${sqlString(row.ultimaMovimentacao)},
      ${sqlString(row.atividadeRecente)},
      ${sqlString(row.playAtivo)},
      ${sqlString(row.statusGeral)},
      ${sqlString(row.oportunidadePrincipal)},
      ${sqlBoolean(row.possuiOportunidade)},
      ${sqlString(row.proximaMelhorAcao)},
      ${sqlString(row.resumoExecutivo)},
      ${sqlJson(row.inteligencia)},
      ${sqlTextArray(row.leituraFactual)},
      ${sqlTextArray(row.leituraInferida)},
      ${sqlTextArray(row.leituraSugerida)},
      ${sqlJson(row.historico)},
      ${sqlTextArray(row.tecnografia)},
      ${sqlJson(row.canaisCampanhas)}
    )`)
    .join(',\n');

  return `insert into accounts (
    id, slug, nome, dominio, vertical, segmento, porte, localizacao,
    "ownerPrincipal", etapa, "tipoEstrategico", potencial, risco, prontidao,
    "coberturaRelacional", "ultimaMovimentacao", "atividadeRecente", "playAtivo",
    "statusGeral", "oportunidadePrincipal", "possuiOportunidade", "proximaMelhorAcao",
    "resumoExecutivo", inteligencia, "leituraFactual", "leituraInferida",
    "leituraSugerida", historico, tecnografia, "canaisCampanhas"
  ) values
  ${values};`;
}

function buildContasSql(): string {
  const rows = buildBlockASeed().tables.contas;

  if (rows.length === 0) return '-- contas: sem linhas';

  const values = rows
    .map((row) => `(
      ${sqlString(row.id)},
      ${sqlString(row.slug)},
      ${sqlString(row.nome)},
      ${sqlNumber(row.icp)},
      ${sqlNumber(row.crm)},
      ${sqlNumber(row.vp)},
      ${sqlNumber(row.ct)},
      ${sqlNumber(row.ft)},
      ${sqlJson(row.abm)},
      ${sqlJson(row.abx)}
    )`)
    .join(',\n');

  return `insert into contas (
    id, slug, nome, icp, crm, vp, ct, ft, abm, abx
  ) values
  ${values};`;
}

function buildContactsSql(): string {
  const rows = buildBlockASeed().tables.contacts;

  if (rows.length === 0) return '-- contacts: sem linhas';

  const values = rows
    .map((row) => `(
      ${sqlString(row.id)},
      ${sqlString(row.nome)},
      ${sqlString(row.cargo)},
      ${sqlString(row.area)},
      ${sqlString(row.senioridade)},
      ${sqlString(row.papelComite)},
      ${sqlNumber(row.forcaRelacional)},
      ${sqlString(row.receptividade)},
      ${sqlString(row.acessibilidade)},
      ${sqlString(row.status)},
      ${sqlTextArray(row.classificacao)},
      ${sqlNumber(row.influencia)},
      ${sqlNumber(row.potencialSucesso)},
      ${sqlNumber(row.scoreSucesso)},
      ${sqlString(row.ganchoReuniao)},
      ${sqlString(row.liderId)},
      ${sqlString(row.owner)},
      ${sqlString(row.observacoes)},
      ${sqlString(row.historicoInteracoes)},
      ${sqlString(row.proximaAcao)},
      ${sqlString(row.accountId)},
      ${sqlString(row.accountName)}
    )`)
    .join(',\n');

  return `insert into contacts (
    id, nome, cargo, area, senioridade, "papelComite", "forcaRelacional",
    receptividade, acessibilidade, status, classificacao, influencia,
    "potencialSucesso", "scoreSucesso", "ganchoReuniao", "liderId", owner,
    observacoes, "historicoInteracoes", "proximaAcao", "accountId", "accountName"
  ) values
  ${values};`;
}

function buildSignalsSql(): string {
  const rows = buildBlockASeed().tables.signals;

  if (rows.length === 0) return '-- signals: sem linhas';

  const values = rows
    .map((row) => `(
      ${sqlString(row.id)},
      ${sqlString(row.severity)},
      ${sqlString(row.type)},
      ${sqlString(row.category)},
      ${sqlBoolean(row.archived)},
      ${sqlBoolean(row.resolved)},
      ${sqlString(row.title)},
      ${sqlString(row.description)},
      ${sqlString(row.timestamp)},
      ${sqlString(row.account)},
      ${sqlString(row.accountId)},
      ${sqlString(row.owner)},
      ${sqlNumber(row.confidence)},
      ${sqlString(row.channel)},
      ${sqlString(row.source)},
      ${sqlString(row.context)},
      ${sqlString(row.probableCause)},
      ${sqlString(row.impact)},
      ${sqlString(row.recommendation)}
    )`)
    .join(',\n');

  return `insert into signals (
    id, severity, type, category, archived, resolved, title, description, timestamp,
    account, "accountId", owner, confidence, channel, source, context,
    "probableCause", impact, recommendation
  ) values
  ${values};`;
}

function buildActionsSql(): string {
  const rows = buildBlockASeed().tables.actions;

  if (rows.length === 0) return '-- actions: sem linhas';

  const values = rows
    .map((row) => `(
      ${sqlString(row.id)},
      ${sqlString(row.priority)},
      ${sqlString(row.category)},
      ${sqlString(row.channel)},
      ${sqlString(row.status)},
      ${sqlString(row.title)},
      ${sqlString(row.description)},
      ${sqlString(row.accountName)},
      ${sqlString(row.origin)},
      ${sqlString(row.slaStatus)},
      ${sqlString(row.suggestedOwner)},
      ${sqlString(row.ownerTeam)},
      ${sqlString(row.createdAt)},
      ${sqlString(row.accountContext)},
      ${sqlString(row.relatedSignal)},
      ${sqlString(row.ownerName)},
      ${sqlString(row.slaText)},
      ${sqlString(row.expectedImpact)},
      ${sqlString(row.nextStep)},
      ${sqlTextArray(row.dependencies)},
      ${sqlTextArray(row.evidence)},
      ${sqlJson(row.history)},
      ${sqlString(row.projectObjective)},
      ${sqlString(row.projectSuccess)},
      ${sqlJson(row.projectSteps)},
      ${sqlJson(row.buttons)},
      ${sqlString(row.sourceType)},
      ${sqlString(row.playbookName)},
      ${sqlString(row.playbookRunId)},
      ${sqlString(row.playbookStepId)},
      ${sqlString(row.relatedAccountId)},
      ${sqlString(row.resolutionPath)},
      ${sqlString(row.executionNotes)},
      ${sqlString(row.learnings)}
    )`)
    .join(',\n');

  return `insert into actions (
    id, priority, category, channel, status, title, description, "accountName",
    origin, "slaStatus", "suggestedOwner", "ownerTeam", "createdAt",
    "accountContext", "relatedSignal", "ownerName", "slaText", "expectedImpact",
    "nextStep", dependencies, evidence, history, "projectObjective", "projectSuccess",
    "projectSteps", buttons, "sourceType", "playbookName", "playbookRunId",
    "playbookStepId", "relatedAccountId", "resolutionPath", "executionNotes", learnings
  ) values
  ${values};`;
}

function buildOportunidadesSql(): string {
  const rows = buildBlockASeed().tables.oportunidades;

  if (rows.length === 0) return '-- oportunidades: sem linhas';

  const values = rows
    .map((row) => `(
      ${sqlString(row.id)},
      ${sqlString(row.account_slug)},
      ${sqlString(row.nome)},
      ${sqlString(row.etapa)},
      ${sqlNumber(row.valor)},
      ${sqlString(row.owner)},
      ${sqlString(row.risco)},
      ${sqlNumber(row.probabilidade)},
      ${sqlTextArray(row.historico)}
    )`)
    .join(',\n');

  return `insert into oportunidades (
    id, account_slug, nome, etapa, valor, owner, risco, probabilidade, historico
  ) values
  ${values};`;
}

export function buildBlockASql(): string {
  return [
    '-- Seed canônico do Bloco A | Cenário Parcial',
    'begin;',
    '',
    'delete from actions;',
    'delete from signals;',
    'delete from contacts;',
    'delete from oportunidades;',
    'delete from contas;',
    'delete from accounts;',
    '',
    buildAccountsSql(),
    '',
    buildContasSql(),
    '',
    buildContactsSql(),
    '',
    buildSignalsSql(),
    '',
    buildActionsSql(),
    '',
    buildOportunidadesSql(),
    '',
    'commit;',
    '',
  ].join('\n');
}

export async function writeBlockASql(): Promise<void> {
  const sql = buildBlockASql();
  await mkdir(BLOCK_A_SQL_OUTPUT_DIR, { recursive: true });
  await writeFile(BLOCK_A_SQL_OUTPUT_FILE, sql, 'utf-8');
  console.log(`[seed] SQL do Bloco A exportado em: ${BLOCK_A_SQL_OUTPUT_FILE}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeBlockASql().catch((error) => {
    console.error('[seed] Falha ao gerar SQL do Bloco A:', error);
    process.exit(1);
  });
}
