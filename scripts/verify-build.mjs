import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slug as githubSlug } from 'github-slugger';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const contentDir = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const failures = [];

function fail(message) {
  failures.push(message);
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

/** Strip slashes at both ends so "/tags" and "/tags/" compare equal. */
function trimSlashes(pathname) {
  return pathname.replace(/^\/+|\/+$/g, '');
}

/**
 * Map a site path to the dist file GitHub Pages serves for it directly, or null.
 * Pages serves /a from a file named `a` or `a.html`, and /a/ from a/index.html.
 * A bare a/ directory is not enough for /a: Pages would answer with a redirect.
 */
function resolveSitePath(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidates = clean === '' || clean.endsWith('/') ? [`${clean}index.html`] : [clean, `${clean}.html`];
  return (
    candidates.find((candidate) => {
      const path = join(root, candidate);
      return existsSync(path) && statSync(path).isFile();
    }) ?? null
  );
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
const routes = new Set();
let site;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const label = relative(root, file).split(sep).join('/');
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

  if (isNotFound) continue;

  // tags.html and tags/index.html are the same route, /tags.
  const route = trimSlashes(label.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''));
  routes.add(route);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) {
    fail(`${label}: missing canonical URL`);
    continue;
  }
  const canonicalUrl = new URL(canonical);
  site ??= canonicalUrl.origin;
  if (trimSlashes(canonicalUrl.pathname) !== route) {
    fail(`${label}: canonical ${canonical} should point at /${route}`);
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

// Every page loads directly at both /path and /path/, with no redirect.
for (const route of routes) {
  if (route === '') continue;
  for (const form of [`/${route}`, `/${route}/`]) {
    if (!resolveSitePath(form)) fail(`${form} does not load directly; expected both ${route}.html and ${route}/index.html`);
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

// Every post marked `draft: true` must not be built. Lists, RSS, and the
// sitemap only link to built pages, so the link checks above cover them too.
// Post URLs follow Astro's glob loader: a `slug` field, or the slugified path.
const drafts = filesUnder(contentDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const frontmatter = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const slug =
      frontmatter.match(/^slug:\s*(['"]?)(.+?)\1\s*$/m)?.[2] ??
      relative(contentDir, file)
        .replace(/\.md$/, '')
        .split(sep)
        .map((segment) => githubSlug(segment))
        .join('/')
        .replace(/\/index$/, '');
    return { slug, isDraft: /^draft:\s*true\s*$/m.test(frontmatter) };
  })
  .filter(({ isDraft }) => isDraft);
for (const { slug } of drafts) {
  if (resolveSitePath(`/blog/${slug}`) || resolveSitePath(`/blog/${slug}/`)) {
    fail(`draft ${slug} was built to dist/blog/`);
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
    `Verified ${routes.size} pages (each at /path and /path/), XML feeds, canonical URLs, ` +
      `internal links, social images, and ${drafts.length} hidden drafts.`
  );
}
