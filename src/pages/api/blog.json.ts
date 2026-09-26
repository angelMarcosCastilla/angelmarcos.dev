import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export const GET = (async ({ params, request }) => {
  const allBlogPosts = await getCollection('blog')
  const mapperBlog = allBlogPosts
    .filter((item) => item.data.stack?.trim() === 'NetSuite')
    .map((item) => ({
      id: item.id,
      title: item.data.title,
      date: item.data.date,
      tags: item.data.tags || []
    }))

  return new Response(
    JSON.stringify({
      blog: mapperBlog
    })
  )
}) satisfies APIRoute
