import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import svelte from '@astrojs/svelte'
import { codeBlockTransformer } from './src/utils'

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      transformers: [codeBlockTransformer]
    }
  },

  integrations: [
    tailwind({
      applyBaseStyles: true
    }),
    svelte()
  ]
})
