import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    author: z.string(),
    minutes: z.number(),
    image: z.object({
      src: z.string(),
      alt: z.string()
    }),
    tags: z.array(z.string())
  })
})

export const collections = { blog }