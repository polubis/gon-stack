import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One MDX file per component; the file name is the route slug.
const docs = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { docs };
