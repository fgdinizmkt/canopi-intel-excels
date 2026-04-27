import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const DEV_PORT = 3053;

function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 4, ...options });
}

function parsePsOutput(output) {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) return null;
      return { pid: Number(match[1]), command: match[2] };
    })
    .filter(Boolean);
}

function getNextProcesses() {
  const result = run('ps', ['-axo', 'pid=,command=']);
  if (result.status !== 0) {
    return [];
  }

  const patterns = [
    /next\s+dev/i,
    /next\s+start/i,
    /next-server/i,
    /node\s+.*next/i,
  ];

  return parsePsOutput(result.stdout).filter((entry) =>
    patterns.some((pattern) => pattern.test(entry.command))
  );
}

function getListeningPorts() {
  const result = run('lsof', ['-n', '-P', '-Fpcn', '-iTCP', '-sTCP:LISTEN']);
  if (result.status !== 0 && result.status !== 1) {
    return [];
  }

  const rows = [];
  let current = null;

  for (const line of result.stdout.split('\n')) {
    if (!line) continue;
    const prefix = line[0];
    const value = line.slice(1);

    if (prefix === 'p') {
      if (current) rows.push(current);
      current = { pid: Number(value), command: '', name: '', port: null, raw: '' };
      continue;
    }

    if (!current) continue;

    if (prefix === 'c') {
      current.command = value;
    } else if (prefix === 'n') {
      current.name = value;
      const portMatch = value.match(/:(\d+)(?:$|\s)/);
      current.port = portMatch ? Number(portMatch[1]) : null;
    }
    current.raw += `${line}\n`;
  }

  if (current) rows.push(current);

  return rows.filter((entry) => Number.isFinite(entry.pid) && entry.port !== null);
}

function getNextListeners() {
  const listeners = getListeningPorts();
  const nextLike = getNextProcesses();
  const nextPids = new Set(nextLike.map((item) => item.pid));

  return listeners.filter((listener) =>
    listener.port === DEV_PORT || listener.port === 3000 || nextPids.has(listener.pid) || /next|node/i.test(listener.command)
  );
}

function printRuntimeReport() {
  const processes = getNextProcesses();
  const listeners = getNextListeners();

  console.log('Next processes:');
  if (processes.length === 0) {
    console.log('  none');
  } else {
    processes.forEach((proc) => console.log(`  ${proc.pid} ${proc.command}`));
  }

  console.log('Next listeners:');
  if (listeners.length === 0) {
    console.log('  none');
  } else {
    listeners.forEach((listener) => console.log(`  ${listener.pid} ${listener.port} ${listener.command} ${listener.name}`));
  }

  return { processes, listeners };
}

function hasUnsafeRuntime(report = null) {
  const runtime = report || {
    processes: getNextProcesses(),
    listeners: getNextListeners(),
  };

  return runtime.processes.length > 0 || runtime.listeners.length > 0;
}

function killNextRuntime() {
  const patterns = [
    'next dev',
    'next start',
    'next-server',
    'node .*next',
  ];

  patterns.forEach((pattern) => {
    run('pkill', ['-9', '-f', pattern]);
  });

  [3000, DEV_PORT].forEach((port) => {
    const result = run('lsof', ['-tiTCP:' + port, '-sTCP:LISTEN', '-n', '-P']);
    if (result.status === 0 && result.stdout.trim()) {
      result.stdout
        .trim()
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean)
        .forEach((pid) => {
          run('kill', ['-9', pid]);
        });
    }
  });
}

async function removeNextCache() {
  await fs.rm(path.resolve(PROJECT_ROOT, '.next'), { recursive: true, force: true });
}

function startDevServer() {
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      HOST: '0.0.0.0',
      PORT: String(DEV_PORT),
    },
  });

  const stop = (signal) => {
    if (!child.killed) child.kill(signal);
  };

  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

export {
  DEV_PORT,
  getNextListeners,
  getNextProcesses,
  hasUnsafeRuntime,
  killNextRuntime,
  printRuntimeReport,
  removeNextCache,
  startDevServer,
};
