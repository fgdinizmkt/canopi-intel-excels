import { killNextRuntime, removeNextCache, startDevServer } from './next-env.mjs';

async function main() {
  killNextRuntime();
  await removeNextCache();
  startDevServer();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
