const BASE_URL = process.env.CSS_CHECK_BASE_URL || 'http://127.0.0.1:3053';

function fail(message) {
  console.error(`ERRO: ${message}`);
  process.exit(1);
}

function extractFirstCssHref(html) {
  const matches = html.match(/href="(\/_next\/static\/css\/[^"]+)"/g) || [];
  if (matches.length === 0) return null;
  const first = matches[0].match(/href="([^"]+)"/);
  return first ? first[1] : null;
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  return { res, text: await res.text() };
}

async function main() {
  const target = `${BASE_URL}/login`;
  const { res: htmlRes, text: html } = await fetchText(target).catch((err) => {
    fail(`nao foi possivel acessar ${target}: ${err instanceof Error ? err.message : String(err)}`);
  });

  if (!htmlRes.ok) {
    fail(`GET /login retornou HTTP ${htmlRes.status}`);
  }

  const cssPath = extractFirstCssHref(html);
  if (!cssPath) {
    fail('nenhuma referencia a /_next/static/css encontrada no HTML de /login');
  }

  const cssUrl = `${BASE_URL}${cssPath}`;
  const cssRes = await fetch(cssUrl, { redirect: 'follow' }).catch((err) => {
    fail(`nao foi possivel acessar CSS ${cssUrl}: ${err instanceof Error ? err.message : String(err)}`);
  });

  if (!cssRes.ok) {
    fail(`CSS retornou HTTP ${cssRes.status}`);
  }

  const cssText = await cssRes.text();
  if (cssText.length <= 1000) {
    fail(`CSS com tamanho inesperado (${cssText.length} bytes)`);
  }

  console.log('OK: CSS global carregando');
  console.log(`- html: ${target}`);
  console.log(`- css:  ${cssPath} (${cssText.length} bytes)`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
