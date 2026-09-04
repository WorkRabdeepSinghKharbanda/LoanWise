import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { GLOSSARY } from '../components/Term'
import { PrintButton } from '../components/PrintButton'

const TERMS = Object.entries(GLOSSARY).sort(([a], [b]) => a.localeCompare(b))

export function GlossaryPage() {
  return (
    <PageContainer>
      <Seo title="Loan Glossary" description="Plain-English definitions for APR, amortization, PMI, DTI, and every other term used across the calculators." />
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📖 Glossary</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Every term you'll see underlined across the calculators, in one place.
            </p>
          </div>
          <PrintButton />
        </div>

        <dl className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
          {TERMS.map(([term, definition]) => (
            <div key={term} className="p-5">
              <dt className="font-semibold capitalize text-slate-900 dark:text-white">{term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </PageContainer>
  )
}
