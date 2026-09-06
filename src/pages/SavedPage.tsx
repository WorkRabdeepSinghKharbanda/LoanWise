import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../components/PageContainer'
import { PrintButton } from '../components/PrintButton'
import { Seo } from '../components/Seo'
import { deleteScenario, loadSaved, restoreScenario, updateNote, type SavedScenario } from '../utils/savedScenarios'

export function SavedPage() {
  const [scenarios, setScenarios] = useState(loadSaved)
  const [lastDeleted, setLastDeleted] = useState<SavedScenario | null>(null)

  const remove = (scenario: SavedScenario) => {
    setScenarios(deleteScenario(scenario.id))
    setLastDeleted(scenario)
    setTimeout(() => setLastDeleted((current) => (current?.id === scenario.id ? null : current)), 6000)
  }

  const undo = () => {
    if (!lastDeleted) return
    setScenarios(restoreScenario(lastDeleted))
    setLastDeleted(null)
  }

  return (
    <PageContainer>
      <Seo title="Saved Scenarios" description="Every loan scenario you saved, stored in this browser only." noIndex />
      <div className="flex flex-col gap-6">
        {/* Print-only combined report — brand header, then every saved scenario as a row. */}
        <div className="print-report hidden flex-col overflow-hidden rounded-2xl border border-slate-300 print:flex">
          <div className="flex items-center justify-between px-6 py-5" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-sm font-bold text-white">LW</span>
              <div>
                <p className="text-sm font-bold leading-none text-white">LoanWise</p>
                <p className="mt-1 text-[10px] leading-none text-indigo-100">loan-calculator-ashen-six.vercel.app</p>
              </div>
            </div>
            <span className="text-xs text-indigo-100">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>
          <div className="px-6 py-5">
            <h1 className="text-xl font-bold text-slate-900">Saved Scenarios</h1>
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2">Scenario</th>
                  <th className="py-2">Monthly</th>
                  <th className="py-2">Saved</th>
                  <th className="py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} className="border-t border-slate-200">
                    <td className="py-2 font-medium text-slate-900">{s.label}</td>
                    <td className="py-2 text-slate-700">{s.monthlyPayment}/mo</td>
                    <td className="py-2 text-slate-500">{new Date(s.savedAt).toLocaleDateString()}</td>
                    <td className="py-2 text-slate-500">{s.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-200 px-6 py-3 text-xs text-slate-400">
            Estimates only, not financial advice · Generated at loan-calculator-ashen-six.vercel.app
          </p>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">💾 Saved Scenarios</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Kept in this browser only — nothing is uploaded. Open one to restore every input exactly as it was.
            </p>
          </div>
          {scenarios.length > 0 && <PrintButton />}
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
          <ul className="no-print flex flex-col gap-3">
            {scenarios.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
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
                      onClick={() => remove(s)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:hover:bg-slate-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  defaultValue={s.note ?? ''}
                  placeholder="Add a note — why you saved this…"
                  onBlur={(e) => setScenarios(updateNote(s.id, e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {lastDeleted && (
        <div className="no-print fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
            <span>Deleted "{lastDeleted.label}"</span>
            <button onClick={undo} className="font-semibold text-indigo-300 hover:underline dark:text-indigo-600">
              Undo
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
