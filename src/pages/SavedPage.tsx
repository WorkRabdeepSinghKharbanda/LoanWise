import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { deleteScenario, loadSaved } from '../utils/savedScenarios'

export function SavedPage() {
  const [scenarios, setScenarios] = useState(loadSaved)

  return (
    <PageContainer>
      <Seo title="Saved Scenarios" description="Every loan scenario you saved, stored in this browser only." />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">💾 Saved Scenarios</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kept in this browser only — nothing is uploaded. Open one to restore every input exactly as it was.
          </p>
        </div>

        {scenarios.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">Nothing saved yet.</p>
            <Link
              to="/mortgage"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Run a calculation →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {scenarios.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">{s.label}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {s.monthlyPayment}/mo · saved {new Date(s.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={s.href}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => setScenarios(deleteScenario(s.id))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:hover:bg-slate-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  )
}
