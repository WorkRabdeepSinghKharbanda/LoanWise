import { Link, Navigate, useParams } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { TOPICS } from '../config/topics'
import { GUIDES } from '../config/guides'
import { BLOG_POSTS } from '../config/blog'
import { ALTERNATIVES } from '../config/alternatives'

const SITE_URL = 'https://loan-calculator-ashen-six.vercel.app'

/** One dynamic hub page per TOPICS entry — lists every guide/post/alternative tagged with it. */
export function TopicPage() {
  const { slug } = useParams()
  const topic = TOPICS.find((t) => t.slug === slug)
  if (!topic) return <Navigate to="/topics" replace />

  const pillar = topic.pillarSlug ? GUIDES.find((g) => g.slug === topic.pillarSlug) : undefined
  const guides = GUIDES.filter((g) => g.topics.includes(topic.slug) && g.slug !== topic.pillarSlug)
  const posts = BLOG_POSTS.filter((p) => p.topics.includes(topic.slug))
  const alternatives = ALTERNATIVES.filter((a) => a.topics.includes(topic.slug))

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.label,
    url: `${SITE_URL}/topics/${topic.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        ...guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/guides/${g.slug}` })),
        ...posts.map((p, i) => ({ '@type': 'ListItem', position: guides.length + i + 1, url: `${SITE_URL}/blog/${p.slug}` })),
        ...alternatives.map((a, i) => ({
          '@type': 'ListItem',
          position: guides.length + posts.length + i + 1,
          url: `${SITE_URL}/alternatives/${a.slug}`,
        })),
      ],
    },
  }

  return (
    <PageContainer>
      <Seo title={topic.label} description={topic.intro} />
      <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>

      <div className="flex flex-col gap-6">
        <div>
          <Link to="/topics" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← All topics
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{topic.label}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{topic.intro}</p>
        </div>

        {pillar && (
          <Link
            to={`/guides/${pillar.slug}`}
            className="flex flex-col gap-2 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5 shadow-sm transition hover:border-indigo-400 dark:border-indigo-700 dark:bg-indigo-950/30"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Start here</span>
            <h2 className="font-semibold text-slate-900 dark:text-white">{pillar.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{pillar.description}</p>
          </Link>
        )}

        {guides.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Guides</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {guides.map((g) => (
                <Link
                  key={g.slug}
                  to={`/guides/${g.slug}`}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">{g.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{g.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Blog posts</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {alternatives.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Alternatives</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {alternatives.map((a) => (
                <Link
                  key={a.slug}
                  to={`/alternatives/${a.slug}`}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{a.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  )
}
