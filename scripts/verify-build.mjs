import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const contentDir = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
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

/** Strip slashes at both ends so "/tags" and "/tags/" compare equal. */
function trimSlashes(pathname) {
  return pathname.replace(/^\/+|\/+$/g, '');
}

/** Map a site path to the dist file that serves it, or null if none does. */
function resolveSitePath(pathname) {
  const clean = trimSlashes(decodeURIComponent(pathname));
  const candidates = clean === '' ? ['index.html'] : [clean, `${clean}.html`, `${clean}/index.html`];
  return candidates.find((candidate) => existsSync(join(root, candidate))) ?? null;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const required = [
  'index.html',
  '404.html',
  'rss.xml',
  'robots.txt',
  'sitemap-index.xml',
  'og-card.png',
  'apple-touch-icon.png',
];
for (const file of required) {
  if (!existsSync(join(root, file))) fail(`missing dist/${file}`);
}

const allFiles = filesUnder(root);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
let site;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const label = relative(root, file);
  const isNotFound = label === '404.html';

  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${label}: missing title`);
  if (!/<meta name="description"/.test(html)) fail(`${label}: missing description`);
  if ((html.match(/<h1\b/g) ?? []).length !== 1) fail(`${label}: expected exactly one h1`);

  for (const [, rawTarget] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (!rawTarget.startsWith('/') || rawTarget.startsWith('//') || rawTarget.startsWith('/#')) continue;
    const target = rawTarget.split(/[?#]/, 1)[0];
    if (!resolveSitePath(target)) {
      fail(`${label}: broken internal target ${rawTarget}`);
    }
  }

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (isNotFound) continue;
  if (!canonical) {
    fail(`${label}: missing canonical URL`);
    continue;
  }
  const canonicalUrl = new URL(canonical);
  site ??= canonicalUrl.origin;
  const expectedPath = `/${label.split(sep).join('/').replace(/index\.html$/, '')}`;
  if (trimSlashes(canonicalUrl.pathname) !== trimSlashes(expectedPath)) {
    fail(`${label}: canonical ${canonical} should point at ${expectedPath}`);
  }

  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (!ogImage) {
    fail(`${label}: missing og:image`);
  } else if (!/\.(png|jpe?g)$/.test(ogImage)) {
    fail(`${label}: og:image ${ogImage} must be PNG or JPEG for social previews`);
  } else if (!resolveSitePath(new URL(ogImage).pathname)) {
    fail(`${label}: og:image ${ogImage} does not exist in dist/`);
  }
}

for (const file of allFiles.filter((path) => path.endsWith('.xml'))) {
  const xml = readFileSync(file, 'utf8');
  const label = relative(root, file);
  for (const [, rawUrl] of xml.matchAll(/<(?:loc|link)>([^<]+)<\/(?:loc|link)>/g)) {
    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      fail(`${label}: invalid URL ${rawUrl}`);
      continue;
    }
    if (site && url.origin !== site) continue;
    if (!resolveSitePath(url.pathname)) {
      fail(`${label}: URL ${rawUrl} does not exist in dist/`);
    }
  }
}

// Every post marked `draft: true` must be absent from the build.
const builtText = allFiles
  .filter((file) => /\.(html|xml)$/.test(file))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const drafts = filesUnder(contentDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => ({ file, frontmatter: readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '' }))
  .filter(({ frontmatter }) => /^draft:\s*true\s*$/m.test(frontmatter));
for (const { file, frontmatter } of drafts) {
  const slug = basename(file, '.md');
  const title = frontmatter.match(/^title:\s*(['"]?)(.*)\1\s*$/m)?.[2];
  if (existsSync(join(root, 'blog', slug))) fail(`draft ${slug} was built to dist/blog/${slug}/`);
  if (title && (builtText.includes(title) || builtText.includes(escapeHtml(title)))) {
    fail(`draft title "${title}" leaked into dist/`);
  }
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
  console.log(
    `Verified ${htmlFiles.length} HTML pages, XML feeds, canonical URLs, internal links, ` +
      `social image, and ${drafts.length} hidden drafts.`
  );
}
