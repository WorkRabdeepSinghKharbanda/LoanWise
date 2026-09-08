import { Link, Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { AdSlot } from '../components/AdSlot'
import { BLOG_POSTS } from '../config/blog'

const SITE_URL = 'https://loan-calculator-ashen-six.vercel.app'

/** One dynamic page for every entry in BLOG_POSTS — content differs, structure doesn't. */
export function BlogPage() {
  const { slug } = useParams()
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return <Navigate to="/blog" replace />

  const postingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    publisher: { '@type': 'Organization', name: 'LoanWise' },
  }

  return (
    <PageContainer>
      <Seo title={post.title} description={post.description} />
      <script type="application/ld+json">{JSON.stringify(postingJsonLd)}</script>

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

        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {post.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-semibold text-slate-900 dark:text-white">{s.heading}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
            </section>
          ))}
        </div>

        <AdSlot name="articleMid" />

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
      </div>
    </PageContainer>
  )
}
