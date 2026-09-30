import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'

export default defineConfig({
  site: 'https://duanju.guide',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/draft/') && !page.includes('/mock/'),
    }),
    mdx(),
  ],
  build: { format: 'directory' },
  markdown: { shikiConfig: { theme: 'github-light' } },
})
