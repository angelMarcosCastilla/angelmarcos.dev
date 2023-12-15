<script>
  import { onMount } from 'svelte'

  export let image
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

<img {src}  class={`w-full h-full ${isLoading ? "blur-xl [clip-path:inset(0)] ": ""}`} />

