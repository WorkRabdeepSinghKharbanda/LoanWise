import { Link, Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { AdSlot } from '../components/AdSlot'
import { RelatedPosts } from '../components/RelatedPosts'
import { BlogDiagram } from '../components/BlogDiagram'
import { BLOG_POSTS } from '../config/blog'
import { TOPICS } from '../config/topics'
import { relatedContent } from '../utils/relatedContent'

const SITE_URL = 'https://loan-calculator-ashen-six.vercel.app'

/** One dynamic page for every entry in BLOG_POSTS — content differs, structure doesn't. */
export function BlogPage() {
  const { slug } = useParams()
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return <Navigate to="/blog" replace />

  const wordCount = (post.intro + ' ' + post.sections.map((s) => s.body).join(' ')).split(/\s+/).length
  const topics = TOPICS.filter((t) => post.topics.includes(t.slug))

  const faqJsonLd =
    post.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null

  const postingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: `${SITE_URL}/og-image.png`,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
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
      <Seo title={post.title} description={post.description} />
      <script type="application/ld+json">{JSON.stringify(postingJsonLd)}</script>
      {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}

      <div className="flex flex-col gap-6">
        <div>
          <Link to="/blog" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← All posts
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{post.title}</h1>
          <time dateTime={post.date} className="mt-1 block text-sm text-slate-400">
            {new Date(post.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </time>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{post.intro}</p>
        </div>

        {post.diagram && <BlogDiagram spec={post.diagram} />}

        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {post.sections.map((s) => (
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
            {post.faq.map((f) => (
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
            {post.related.map((r) => (
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

        {topics.length > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Part of:{' '}
            {topics.map((t, i) => (
              <span key={t.slug}>
                <Link to={`/topics/${t.slug}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                  {t.label}
                </Link>
                {i < topics.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        )}

        <RelatedPosts items={relatedContent(post, 'Blog')} />
      </div>
    </PageContainer>
  )
}
