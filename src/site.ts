// The public site URL lives in astro.config.mjs (`site`).
export const SITE = {
  name: 'EXXodos911',
  title: 'EXXodos911 — Notes',
  description:
    'Writing about thoughtful software, simple systems, and creative work.',
  socialImage: {
    src: '/og-card.png',
    width: 1200,
    height: 630,
    alt: 'EXXodos911 — Notes. Thoughtful software, simple systems, creative work.',
  },
  bio: 'Developer writing about thoughtful software, simple systems, and the quieter parts of creative work.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/EXXodos911' },
  ],
  // Number of words per minute used for automatic reading-time estimates.
  wordsPerMinute: 200,
} as const;
