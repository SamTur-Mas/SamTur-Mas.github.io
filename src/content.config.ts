import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const papers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/papers' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    arxiv: z.string().optional(),
    venue: z.string().optional(),
    authors: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    rating: z.number().min(1).max(5).optional(),
    tldr: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { papers };
