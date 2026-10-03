import { SITE } from '../site';
import GithubSlugger from 'github-slugger';

export function formatPostDate(date: Date | string) {
  const d = date instanceof Date ? date : new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}

export function toISODate(date: Date | string) {
  const d = date instanceof Date ? date : new Date(`${date}T00:00:00`);
  return d.toISOString().slice(0, 10);
}

export function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / SITE.wordsPerMinute));
  return `${minutes} min read`;
}

export function slugifyTag(tag: string) {
  return new GithubSlugger().slug(tag.trim());
}
