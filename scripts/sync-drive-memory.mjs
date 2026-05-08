#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { basename } from 'node:path';
import process from 'node:process';

const REMOTE = 'gdrive';
const DRIVE_ROOT_FOLDER_ID = '1Hx6NTkONj9pwBLFbV8LvUhUrMdnkAFmv';

const FILES = [
  'docs/98-operacao/00-status-atual.md',
  'docs/98-operacao/02-decisoes-arquiteturais.md',
  'docs/98-operacao/03-log-de-sessoes.md',
  'docs/98-operacao/33-plano-loja-conectores-crms.md',
  'docs/98-operacao/34-protocolo-espelhamento-memoria-operacional.md',
  'docs/98-operacao/39-salesforce-configuration-hub-spec.md',
];

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    const err = new Error(`${cmd} failed`);
    err.code = res.status;
    throw err;
  }
}

function runCapture(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8' });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    const err = new Error((res.stderr || '').trim() || `${cmd} failed`);
    err.code = res.status;
    throw err;
  }
  return (res.stdout || '').trim();
}

function parseDirtyFiles(statusShort) {
  return statusShort
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\S+\s+/, '').trim());
}

function requireCleanGit({ dryRun }) {
  const status = runCapture('git', ['status', '--short']);
  const dirty = parseDirtyFiles(status);

  if (dirty.length !== 0) {
    if (!dryRun) {
      throw new Error('GIT_DIRTY');
    }

    // Bootstrap exception: allow only these two dirty paths during dry-run.
    const allowed = new Set(['package.json', 'scripts/sync-drive-memory.mjs']);
    const hasOnlyAllowed = dirty.every((p) => allowed.has(p)) && dirty.length === allowed.size;
    if (!hasOnlyAllowed) {
      throw new Error('GIT_DIRTY');
    }
  }

  const head = runCapture('git', ['rev-parse', '--short', 'HEAD']);
  const origin = runCapture('git', ['rev-parse', '--short', 'origin/main']);
  if (head !== origin) {
    throw new Error('GIT_NOT_SYNCED');
  }
}

function requireRemote() {
  const remotes = runCapture('rclone', ['listremotes']);
  const has = remotes
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .some((r) => r === `${REMOTE}:`);
  if (!has) throw new Error('RCLONE_REMOTE_MISSING');
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
  };
}

function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));

  requireCleanGit({ dryRun });
  requireRemote();

  const common = ['--drive-root-folder-id', DRIVE_ROOT_FOLDER_ID];
  const dry = dryRun ? ['--dry-run'] : [];

  for (const src of FILES) {
    const destName = basename(src);
    const dest = `${REMOTE}:${destName}`;
    run('rclone', ['copyto', src, dest, ...common, ...dry]);
  }

  // Post-sync validation/report: list files in the Drive folder root.
  let list = '';
  try {
    list = runCapture('rclone', ['lsf', `${REMOTE}:`, ...common, '--max-depth', '1']);
  } catch (e) {
    if (!dryRun) throw e;
    // In dry-run we still succeed if the copyto dry-run succeeded; listing can fail due to permissions/DNS.
    process.stdout.write('AVISO: nao foi possivel listar a pasta no Drive durante o dry-run.\n');
  }

  const want = new Set(FILES.map((p) => basename(p)));
  const found = new Set(
    (list || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/\/$/, ''))
  );

  const planned = [...want].sort();
  const existing = planned.filter((name) => found.has(name));
  const wouldCreate = planned.filter((name) => !found.has(name));
  const wouldUpdate = existing;

  if (!dryRun) {
    const missing = wouldCreate;
    if (missing.length) {
      throw new Error(`REMOTE_MISSING_FILES: ${missing.join(', ')}`);
    }
    process.stdout.write('OK: arquivos confirmados na pasta Canopi (Drive root folder id).\n');
    process.stdout.write('Sync concluido.\n');
    return;
  }

  process.stdout.write('OK: dry-run executado (nenhum arquivo remoto foi alterado).\n');
  process.stdout.write(`Arquivos planejados: ${planned.join(', ')}\n`);
  if (list) {
    process.stdout.write(`Arquivos existentes no Drive (por nome): ${existing.length ? existing.join(', ') : '(nenhum detectado)'}\n`);
    process.stdout.write(`Arquivos que seriam criados no sync real: ${wouldCreate.length ? wouldCreate.join(', ') : '(nenhum)'}\n`);
    process.stdout.write(`Arquivos que seriam atualizados no sync real: ${wouldUpdate.length ? wouldUpdate.join(', ') : '(nenhum)'}\n`);
  }
}

try {
  main();
} catch (err) {
  const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
  if (msg === 'GIT_DIRTY') {
    console.error('ABORT: working tree nao esta limpa.');
    process.exit(2);
  }
  if (msg === 'GIT_NOT_SYNCED') {
    console.error('ABORT: HEAD diferente de origin/main.');
    process.exit(2);
  }
  if (msg === 'RCLONE_REMOTE_MISSING') {
    console.error(`ABORT: remote rclone ausente: ${REMOTE}:`);
    process.exit(2);
  }
  console.error(`ERRO: ${msg}`);
  process.exit(1);
}
