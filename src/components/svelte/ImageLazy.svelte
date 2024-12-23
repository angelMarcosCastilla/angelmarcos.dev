<script>
  import { cn } from '@/utils'
  import { onMount } from 'svelte'

  export let image
  export let alt

  const exts = image.split('.').pop()
  const ingurSmall = image.replace(`.${exts}`, `t.${exts}`)
  let src = ingurSmall
  let isLoading = true
  onMount(() => {
    const img = new Image(image)
    img.src = image
    img.onload = () => {
      isLoading = false
      src = img.src
    }
  })
</script>

<div class="p-2 rounded-md border border-input">
  <img
    {src}
    {alt}
    class={cn('w-full h-full rounded-md', isLoading ? 'blur-xl [clip-path:inset(0)]' : '')}
  />
</div>
