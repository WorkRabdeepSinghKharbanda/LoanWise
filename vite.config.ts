import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { ALL_NAV } from './src/config/navigation.ts'

const SITE = 'https://loan-calculator-ashen-six.vercel.app'

/**
 * Generates sitemap.xml from the navigation config at build time, so adding a
 * calculator never leaves the sitemap stale.
 */
function sitemap() {
  return {
    name: 'sitemap',
    closeBundle() {
      const today = new Date().toISOString().slice(0, 10)
      const urls = ['/', ...ALL_NAV.map((item) => item.to)]
      const body = urls
        .map(
          (path) =>
            `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${today}</lastmod>\n` +
            `    <changefreq>monthly</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`,
        )
        .join('\n')

      writeFileSync(
        resolve('dist/sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sitemap()],
  test: {
    // Render tests need a DOM; the math tests don't care.
    environment: 'happy-dom',
    globals: true,
  },
})
