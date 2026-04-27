import { hasUnsafeRuntime, printRuntimeReport } from './next-env.mjs';

const report = printRuntimeReport();
const hasOfficialRuntimeOnly =
  report.processes.length === 0 &&
  report.listeners.length === 1 &&
  report.listeners[0]?.port === 3053;

const hasAnyRuntime = report.processes.length > 0 || report.listeners.length > 0;

if (!hasAnyRuntime) {
  console.log('Nenhum runtime Next ativo.');
} else if (hasOfficialRuntimeOnly) {
  console.log('Runtime oficial ativo em 3053.');
} else if (hasUnsafeRuntime(report)) {
  console.log('Runtime fora do padrão. Use npm run dev:clean.');
}
