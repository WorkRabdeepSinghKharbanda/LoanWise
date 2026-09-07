import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { ALL_NAV } from './src/config/navigation.ts'
import { GUIDES } from './src/config/guides.ts'

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
      // noIndex pages (per-visitor localStorage state, nothing for a crawler to see) are excluded.
      // /privacy isn't a calculator so it's not in ALL_NAV, but it's real static content — include it.
      const urls = [
        '/',
        '/privacy',
        ...ALL_NAV.filter((item) => !item.noIndex).map((item) => item.to),
        ...GUIDES.map((g) => `/guides/${g.slug}`),
      ]
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

      writeFileSync(resolve('dist/llms.txt'), llmsTxt())
    },
  }
}

/**
 * llms.txt (llmstxt.org): a plain-English map of the site for AI assistants
 * that fetch it directly instead of crawling every page. Generated from the
 * same ALL_NAV/GUIDES source of truth as the sitemap, for the same reason —
 * it can't go stale.
 */
function llmsTxt() {
  const calculators = ALL_NAV.filter((item) => !item.noIndex)
    .map((item) => `- [${item.label}](${SITE}${item.to}): ${item.desc}`)
    .join('\n')
  const guides = GUIDES.map((g) => `- [${g.title}](${SITE}/guides/${g.slug}): ${g.description}`).join('\n')

  return `# LoanWise

> Free loan, mortgage, and EMI calculators with full amortization schedules. Every calculation runs client-side in the browser — no backend, no account, no data ever leaves the visitor's device.

## Calculators
${calculators}

## Guides
${guides}

## Other
- [Compare loans, saved scenarios, quiz, glossary](${SITE}/compare)
- [Privacy policy](${SITE}/privacy)
`
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
