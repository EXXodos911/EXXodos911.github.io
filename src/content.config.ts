import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string().trim().min(1)).default([]),
    /** Optional hero image, optimized at build time through astro:assets. */
    cover: image().optional(),
    coverAlt: z.string().trim().optional(),
  }).refine((data) => !data.cover || data.coverAlt !== undefined, {
    message: 'coverAlt is required when a cover image is provided.',
    path: ['coverAlt'],
  }),
});

export const collections = { blog };
