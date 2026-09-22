import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const failures = [];

function fail(message) {
  failures.push(message);
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

const required = ['index.html', '404.html', 'rss.xml', 'robots.txt', 'sitemap-index.xml', 'og-card.svg'];
for (const file of required) {
  if (!existsSync(join(root, file))) fail(`missing dist/${file}`);
}

const htmlFiles = filesUnder(root).filter((file) => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const label = relative(root, file);

  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${label}: missing title`);
  if (!/<meta name="description"/.test(html)) fail(`${label}: missing description`);
  if ((html.match(/<h1\b/g) ?? []).length !== 1) fail(`${label}: expected exactly one h1`);

  for (const [, rawTarget] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (!rawTarget.startsWith('/') || rawTarget.startsWith('//') || rawTarget.startsWith('/#')) continue;
    const target = rawTarget.split(/[?#]/, 1)[0];
    if (target !== '/' && target.endsWith('/')) fail(`${label}: trailing-slash link ${rawTarget}`);

    const relativeTarget = target.slice(1);
    const candidates = target === '/'
      ? ['index.html']
      : [relativeTarget, `${relativeTarget}.html`, `${relativeTarget}/index.html`];
    if (!candidates.some((candidate) => existsSync(join(root, candidate)))) {
      fail(`${label}: broken internal target ${rawTarget}`);
    }
  }
}

for (const file of filesUnder(root).filter((path) => path.endsWith('.xml'))) {
  const xml = readFileSync(file, 'utf8');
  for (const [, rawUrl] of xml.matchAll(/<(?:loc|link)>([^<]+)<\/(?:loc|link)>/g)) {
    const pathname = new URL(rawUrl).pathname;
    if (pathname !== '/' && pathname.endsWith('/')) fail(`${relative(root, file)}: trailing-slash URL ${rawUrl}`);
  }
}

const builtText = filesUnder(root)
  .filter((file) => /\.(html|xml)$/.test(file))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
if (builtText.includes('A draft that stays hidden') || builtText.includes('You should not see this')) {
  fail('draft content leaked into dist/');
}

const notFound = readFileSync(join(root, '404.html'), 'utf8');
if (!/name="robots" content="noindex, nofollow"/.test(notFound)) {
  fail('404.html is not marked noindex');
}
if (/<link rel="canonical"/.test(notFound)) fail('404.html should not have a canonical URL');

if (failures.length > 0) {
  console.error(failures.map((failure) => `✗ ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${htmlFiles.length} HTML pages, XML feeds, internal links, metadata, and draft filtering.`);
}
