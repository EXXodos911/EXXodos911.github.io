import GithubSlugger from 'github-slugger';

export type TocEntry = {
  depth: 2 | 3;
  text: string;
  slug: string;
};

/** Remove fenced code blocks so `#` inside code is not treated as a heading. */
function stripCodeBlocks(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, '');
}

/** Strip inline markdown to get plain heading text for display + slugging. */
function plainText(heading: string) {
  return heading
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  const source = stripCodeBlocks(markdown);
  for (const line of source.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const depth = match[1].length as 2 | 3;
    const text = plainText(match[2]);
    if (!text) continue;
    entries.push({ depth, text, slug: slugger.slug(text) });
  }
  return entries;
}
