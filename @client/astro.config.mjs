import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import solidJs from '@astrojs/solid-js'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  srcDir: './www',
  site: process.env.SITE_URL,
  integrations: [
    tailwind({ config: { applyBaseStyles: false } }),
    solidJs(),
    sitemap({ lastmod: new Date(), changefreq: 'daily' }),
  ],
})
