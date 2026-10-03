// Astro integration that makes every page load at both /path and /path/.
//
// GitHub Pages serves /path from path.html, but redirects /path to /path/ when
// only path/index.html exists, and 404s /path/ when only path.html exists.
// With `build.format: 'file'`, Astro writes path.html; this copies each one to
// path/index.html so both forms are served directly, with no redirect.

import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath, entry.name));
}

export function slashAliases() {
  return {
    name: 'slash-aliases',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let count = 0;
        for (const file of await htmlFiles(root)) {
          const page = relative(root, file);
          // index.html already serves "/", and 404.html is not a route.
          if (page === 'index.html' || page === '404.html' || page.endsWith('/index.html')) continue;
          const alias = join(file.slice(0, -'.html'.length), 'index.html');
          await mkdir(dirname(alias), { recursive: true });
          await copyFile(file, alias);
          count += 1;
        }
        logger.info(`Aliased ${count} pages so /path and /path/ both load directly.`);
      },
    },
  };
}
