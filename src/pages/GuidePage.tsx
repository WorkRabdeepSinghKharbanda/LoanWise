import { Link, Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { AdSlot } from '../components/AdSlot'
import { RelatedPosts } from '../components/RelatedPosts'
import { GUIDES } from '../config/guides'
import { relatedContent } from '../utils/relatedContent'

const SITE_URL = 'https://loan-calculator-ashen-six.vercel.app'

/** One dynamic page for every entry in GUIDES — content differs, structure doesn't. */
export function GuidePage() {
  const { slug } = useParams()
  const guide = GUIDES.find((g) => g.slug === slug)
  if (!guide) return <Navigate to="/guides" replace />

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: `${SITE_URL}/guides/${guide.slug}`,
    publisher: { '@type': 'Organization', name: 'LoanWise' },
  }

  return (
    <PageContainer>
      <Seo title={guide.title} description={guide.description} />
      <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>

      <div className="flex flex-col gap-6">
        <div>
          <Link to="/guides" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← All guides
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{guide.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{guide.intro}</p>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {guide.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-semibold text-slate-900 dark:text-white">{s.heading}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
            </section>
          ))}
        </div>

        <AdSlot name="articleMid" />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
          <dl className="mt-3 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {guide.faq.map((f) => (
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
            {guide.related.map((r) => (
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

        <RelatedPosts items={relatedContent(guide, 'Guide')} />
      </div>
    </PageContainer>
  )
}
