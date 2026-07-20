export type Post = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  content: string[];
};

export const posts: Post[] = [
  {
    slug: 'building-less',
    title: 'Building less, but better',
    description:
      'A few practical thoughts on removing noise from products, projects, and daily work.',
    publishedAt: '2026-07-12',
    readingTime: '4 min read',
    content: [
      'The easiest way to make a project feel important is to make it large. More pages, more features, more meetings, and more words can create the appearance of progress without improving the result.',
      'Restraint is harder. It asks us to decide what the work is really for, remove everything that does not support that purpose, and accept that clarity can look deceptively simple.',
      'I try to start with the smallest complete version. Not a broken prototype, but a focused version that solves one real problem well. Once that exists, every addition has to justify the complexity it introduces.',
      'Good work is often the result of subtraction. The final product should feel obvious, even when reaching that simplicity was not.'
    ]
  },
  {
    slug: 'notes-on-attention',
    title: 'Notes on attention',
    description:
      'Why protecting your attention matters more than finding another productivity system.',
    publishedAt: '2026-06-28',
    readingTime: '3 min read',
    content: [
      'Attention is the raw material behind almost everything meaningful we make. Time matters, but an uninterrupted hour is not equal to an hour divided into dozens of fragments.',
      'Most productivity advice focuses on organizing tasks. That can help, but it does not solve the deeper problem: allowing other people, tools, and notifications to decide what receives your mind.',
      'A quieter environment is useful. So is a shorter list. The biggest improvement, however, comes from choosing one thing and staying with it long enough to move beyond the obvious ideas.',
      'Protecting attention is not about becoming unreachable. It is about making deliberate space for work that requires depth.'
    ]
  },
  {
    slug: 'the-case-for-small-websites',
    title: 'The case for small websites',
    description:
      'Personal websites can be useful without becoming platforms, brands, or endless content machines.',
    publishedAt: '2026-06-04',
    readingTime: '5 min read',
    content: [
      'A personal website does not need to become a startup. It can simply be a place that you own: a small collection of writing, links, experiments, and information about your work.',
      'The modern web often encourages expansion. Add an account system, analytics dashboard, newsletter funnel, recommendation engine, and social layer. Each feature may be reasonable on its own, but together they can bury the original purpose.',
      'Small websites are easier to understand and maintain. They load quickly, age more gracefully, and leave room for personality because they are not forced into the shape of a general-purpose platform.',
      'A website can be successful because it is useful to a few people, because it documents your thinking, or simply because making it taught you something. Scale is only one possible measure.'
    ]
  }
];

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(`${date}T00:00:00`));
}
