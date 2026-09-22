export const SITE = {
  name: 'EXXodos911',
  title: 'EXXodos911 — Notes',
  description:
    'Writing about thoughtful software, simple systems, and creative work.',
  siteUrl: 'https://exxodos911.github.io',
  socialImage: '/og-card.svg',
  bio: 'Developer writing about thoughtful software, simple systems, and the quieter parts of creative work.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/EXXodos911' },
  ],
  // Number of words per minute used for automatic reading-time estimates.
  wordsPerMinute: 200,
} as const;

export type Site = typeof SITE;
