import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../content/posts' }),
  schema: z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    excerpt: z.string().min(1),
    category: z.enum(['study', 'life', 'entertainment']),
    date: z.coerce.date(),
    status: z.enum(['draft', 'published']).default('published'),
    accent: z.enum(['sunset', 'blue', 'green', 'cream', 'purple', 'orange']).default('blue'),
  }),
});

export const collections = { posts };
