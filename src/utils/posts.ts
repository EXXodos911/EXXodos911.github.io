import { getCollection, type CollectionEntry } from 'astro:content';
import GithubSlugger from 'github-slugger';
import { SITE } from '../site';

export type Post = CollectionEntry<'blog'>;

export type TagGroup = {
  slug: string;
  label: string;
  posts: Post[];
};

const base = import.meta.env.BASE_URL;

/**
 * Posts to show, newest first. Drafts are included under `astro dev` so they
 * can be previewed locally, and are never part of a production build.
 */
export async function getVisiblePosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function postPath(post: Post) {
  return `/blog/${post.id}`;
}

export function tagPath(slug: string) {
  return `/tags/${slug}`;
}

/** Prefix a site path with the configured base for use in href attributes. */
export function withBase(path: string) {
  return `${base}${path.replace(/^\/+/, '')}`;
}

// Frontmatter dates are parsed as UTC midnight, so format them in UTC too;
// otherwise builds in timezones west of UTC show the previous day.
export function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / SITE.wordsPerMinute));
  return `${minutes} min read`;
}

export function slugifyTag(tag: string) {
  return new GithubSlugger().slug(tag.trim());
}

/**
 * Group posts by tag slug so tags that differ only in case or punctuation
 * ("Web" and "web") share one page instead of colliding on the same route.
 * Sorted by post count, then label.
 */
export function groupByTag(posts: Post[]): TagGroup[] {
  const groups = new Map<string, TagGroup>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      const group = groups.get(slug) ?? { slug, label: tag, posts: [] };
      if (!group.posts.includes(post)) group.posts.push(post);
      groups.set(slug, group);
    }
  }
  return [...groups.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.label.localeCompare(b.label)
  );
}
