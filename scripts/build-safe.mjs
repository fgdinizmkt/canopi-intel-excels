import { hasUnsafeRuntime, printRuntimeReport } from './next-env.mjs';
import { spawnSync } from 'node:child_process';

const report = printRuntimeReport();
if (hasUnsafeRuntime(report)) {
  console.error('Pare o servidor dev antes de rodar build.');
  process.exit(1);
}

const result = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: false });
process.exit(result.status ?? 1);
