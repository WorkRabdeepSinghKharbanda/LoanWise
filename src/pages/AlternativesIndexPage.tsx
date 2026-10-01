import { Link } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { ALTERNATIVES } from '../config/alternatives'

export function AlternativesIndexPage() {
  return (
    <PageContainer>
      <Seo
        title="Alternatives to Other Loan Calculators"
        description="Factual, feature-by-feature comparisons against other loan and mortgage calculator sites — no account, no lead forms, nothing leaves your browser."
      />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🔀 Alternatives</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            How this site compares to other loan and mortgage calculators, feature by feature.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ALTERNATIVES.map((a) => (
            <Link
              key={a.slug}
              to={`/alternatives/${a.slug}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <h2 className="font-semibold text-slate-900 dark:text-white">{a.competitor} Alternative</h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{a.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
