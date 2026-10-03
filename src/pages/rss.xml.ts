import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import { SITE } from '../site';
import { getVisiblePosts, postPath } from '../utils/posts';

/** Feed readers resolve root-relative URLs inconsistently, so make them absolute. */
function absolutizeUrls(html: string, site: URL) {
  const absolute = (url: string) => (url.startsWith('/') && !url.startsWith('//') ? new URL(url, site).href : url);
  return html
    .replace(/\b(href|src)="([^"]*)"/g, (_, name, url) => `${name}="${absolute(url)}"`)
    .replace(/\bsrcset="([^"]*)"/g, (_, srcset: string) => {
      const candidates = srcset.split(',').map((candidate) => {
        const [url, ...descriptor] = candidate.trim().split(/\s+/);
        return [absolute(url), ...descriptor].join(' ');
      });
      return `srcset="${candidates.join(', ')}"`;
    });
}

export async function GET(context: APIContext) {
  const site = context.site!;
  const container = await AstroContainer.create();
  const posts = await getVisiblePosts();
  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: postPath(post),
        categories: post.data.tags,
        content: absolutizeUrls(await container.renderToString(Content), site),
      };
    })
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site,
    // Match the canonical URLs, which have no trailing slash.
    trailingSlash: false,
    customData: '<language>en</language>',
    items,
  });
}
