import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.md'
  }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    author: z.string(),
    minutes: z.number(),
    image: z
      .object({
        src: z.string(),
        alt: z.string()
      })
      .optional(),
    tags: z.array(z.string()),
    stack: z.string()
  })
})

export const collections = { blog }
