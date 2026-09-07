import { Link } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { GUIDES } from '../config/guides'

export function GuidesIndexPage() {
  return (
    <PageContainer>
      <Seo title="Loan & Mortgage Guides" description="In-depth guides on how EMI, mortgages, and debt payoff actually work — with links to the calculator for each." />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📚 Guides</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">The reasoning behind the numbers, not just the numbers.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <h2 className="font-semibold text-slate-900 dark:text-white">{g.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{g.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
