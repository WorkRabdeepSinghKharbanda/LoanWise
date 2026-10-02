import { Link } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { TOPICS } from '../config/topics'

export function TopicsIndexPage() {
  return (
    <PageContainer>
      <Seo
        title="Browse by Topic"
        description="Every guide, blog post, and comparison on this site, grouped by topic — mortgages, EMI, debt payoff, car loans, and more."
      />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🗂️ Topics</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">All our content grouped by subject, start here if you're not sure where to look.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <Link
              key={t.slug}
              to={`/topics/${t.slug}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <h2 className="font-semibold text-slate-900 dark:text-white">{t.label}</h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.intro}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
