import { Link, Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { AdSlot } from '../components/AdSlot'
import { ALTERNATIVES } from '../config/alternatives'

const SITE_URL = 'https://loan-calculator-ashen-six.vercel.app'

/** One dynamic page for every entry in ALTERNATIVES — content differs, structure doesn't. */
export function AlternativePage() {
  const { slug } = useParams()
  const alt = ALTERNATIVES.find((a) => a.slug === slug)
  if (!alt) return <Navigate to="/alternatives" replace />

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: alt.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const wordCount = (
    alt.intro +
    ' ' +
    alt.whoSearchesThis +
    ' ' +
    alt.whenTheyWin +
    ' ' +
    alt.howToSwitch.join(' ')
  ).split(/\s+/).length

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: alt.title,
    description: alt.description,
    image: `${SITE_URL}/og-image.png`,
    url: `${SITE_URL}/alternatives/${alt.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/alternatives/${alt.slug}` },
    wordCount,
    author: { '@type': 'Organization', name: 'LoanWise' },
    publisher: {
      '@type': 'Organization',
      name: 'LoanWise',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon-512x512.png` },
    },
  }

  return (
    <PageContainer>
      <Seo title={alt.title} description={alt.description} />
      <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>

      <div className="flex flex-col gap-6">
        <div>
          <Link to="/alternatives" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← All alternatives
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{alt.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{alt.intro}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Who searches this</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{alt.whoSearchesThis}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-slate-900 dark:text-white">Feature</th>
                <th className="p-4 font-semibold text-slate-900 dark:text-white">{alt.competitor}</th>
                <th className="p-4 font-semibold text-indigo-700 dark:text-indigo-300">LoanWise</th>
              </tr>
            </thead>
            <tbody>
              {alt.comparison.map((row) => (
                <tr key={row.trait} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{row.trait}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{row.competitor}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{row.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h2 className="font-semibold text-slate-900 dark:text-white">When {alt.competitor} is still the better choice</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{alt.whenTheyWin}</p>
        </div>

        <AdSlot name="articleMid" />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">How to switch</h2>
          <ol className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {alt.howToSwitch.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
          <dl className="mt-3 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {alt.faq.map((f) => (
              <div key={f.q} className="py-3 first:pt-0 last:pb-0">
                <dt className="font-medium text-slate-900 dark:text-white">{f.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <h2 className="font-semibold text-slate-900 dark:text-white">Related calculators</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {alt.related.map((r) => (
              <li key={r.to}>
                <Link
                  to={r.to}
                  className="inline-flex rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-100 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageContainer>
  )
}
