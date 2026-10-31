<script lang="ts">
  import { onMount } from 'svelte'

  interface BlogI {
    id: string
    date: string
    title: string
    tags: string[]
  }
  let status = $state<'Loading' | 'Loaded' | 'Error'>('Loading')
  let data = $state<BlogI[]>([])

  onMount(() => {
    fetch('/api/blog.json', {})
      .then((res) => res.json())
      .then((value) => {
        status = 'Loaded'
        data = value?.blog
      })
      .catch(() => {
        status = 'Error'
      })
  })
</script>

<div class="flex flex-col gap-3">
  {#if status === 'Loading'}
    <div class="flex flex-col gap-3" role="status" aria-label="Cargando blogs">
      {#each [1, 2, 3] as placeholder (placeholder)}
        <div class="rounded-lg bg-card p-4 px-5 shadow-sm" aria-hidden="true">
          <div class="mb-3 h-3 w-24 animate-pulse rounded bg-muted"></div>
          <div class="mb-4 h-5 w-3/4 animate-pulse rounded bg-muted"></div>
          <div class="flex gap-2">
            <div class="h-3 w-16 animate-pulse rounded bg-muted"></div>
            <div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if status === 'Loaded' && data.length > 0}
    {#each data as blog}
      <a href={`/blog/${blog.id}`} class="rounded-lg bg-card shadow-sm hover:bg-nsBackground">
        <article class="flex flex-col space-y-1.5 p-4 px-5">
          <header class="flex items-center gap-3">
            <span class="text-xs">{blog.date}</span>
          </header>
          <div class="mb-2">
            <h3 class="text-base font-bold text-nsPrimary">{blog.title}</h3>
          </div>
          <div class="flex justify-between items-center gap-y-2">
            <div class="flex flex-wrap gap-2">
              {#each blog.tags as tag}
                <span class="text-xs">#{tag}</span>
              {/each}
            </div>
          </div>
        </article>
      </a>
    {/each}
  {/if}

  {#if status === 'Error'}
    <p>Error al cargar blogs</p>
  {/if}
</div>
