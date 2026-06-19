import { defineConfig } from 'astro/config'
import solidJs from '@astrojs/solid-js'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  srcDir: './www',
  site: process.env.SITE_URL || 'https://lectures.london',
  outDir: 'build/client',
  integrations: [solidJs(), sitemap({ lastmod: new Date(), changefreq: 'daily' })],
  vite: { plugins: [tailwindcss()] },
})
