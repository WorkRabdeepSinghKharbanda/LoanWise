import { useEffect, useState } from 'react'
import { LoanForm } from '../components/LoanForm'
import { Seo } from '../components/Seo'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat } from '../context/SettingsContext'
import { calculateLoan, formatMonths } from '../utils/loanMath'
import { realValue } from '../utils/advancedMath'
import { downloadComparisonCsv } from '../utils/exportSchedule'
import { loadSaved } from '../utils/savedScenarios'
import type { LoanInput, LoanResult } from '../types/loan'

const INFLATION_PERCENT = 3

/** A scenario carries a stable id so removing one never remounts the others. */
interface Scenario extends LoanInput {
  id: string
  name: string
}

const STORAGE_KEY = 'compare-scenarios'
const MAX_SCENARIOS = 4
const ACCENTS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500']

const BASE: LoanInput = { principal: 20000, annualRatePercent: 8, termMonths: 48, extraMonthlyPayment: 0 }

/** Saved scenarios keep their inputs in the URL query string (see useLoanCalculator) — pull them back out. */
function parseSavedHref(href: string): LoanInput {
  const params = new URLSearchParams(href.split('?')[1] ?? '')
  const read = (key: string, fallback: number) => {
    const n = Number(params.get(key))
    return Number.isFinite(n) ? n : fallback
  }
  return {
    principal: read('amount', BASE.principal),
    annualRatePercent: read('rate', BASE.annualRatePercent),
    termMonths: read('term', BASE.termMonths),
    extraMonthlyPayment: read('extra', 0),
  }
}

function newId() {
  // randomUUID needs a secure context; Date-based ids are a fine fallback.
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function defaults(): Scenario[] {
  return [
    { ...BASE, id: newId(), name: 'Offer A' },
    { ...BASE, id: newId(), name: 'Offer B', annualRatePercent: 6 },
    { ...BASE, id: newId(), name: 'Shorter term', termMonths: 36 },
  ]
}

function normalize(parsed: unknown): Scenario[] | null {
  if (!Array.isArray(parsed) || parsed.length === 0) return null
  // Older saves had no id/name — backfill rather than discard them.
  return parsed.slice(0, MAX_SCENARIOS).map((s, i) => ({
    ...BASE,
    ...s,
    id: typeof s.id === 'string' ? s.id : newId(),
    name: typeof s.name === 'string' ? s.name : `Scenario ${i + 1}`,
  }))
}

/** A `?data=` link takes priority — that's someone sharing their comparison with you. */
function loadFromUrl(): Scenario[] | null {
  try {
    const data = new URLSearchParams(window.location.search).get('data')
    if (!data) return null
    return normalize(JSON.parse(atob(data)))
  } catch {
    return null
  }
}

function loadScenarios(): Scenario[] {
  const shared = loadFromUrl()
  if (shared) return shared
  try {
    const normalized = normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
    if (normalized) return normalized
  } catch {
    // Corrupt or blocked storage — fall through to defaults.
  }
  return defaults()
}

export function ComparePage() {
  const { money } = useFormat()
  const [scenarios, setScenarios] = useState<Scenario[]>(loadScenarios)
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [linkCopied, setLinkCopied] = useState(false)
  const [inflationAdjusted, setInflationAdjusted] = useState(false)
  // A single total is a lump sum, not a stream — discount it at the point the loan actually finishes.
  const adjustTotal = (total: number, payoffMonths: number) => (inflationAdjusted ? realValue(total, INFLATION_PERCENT, payoffMonths) : total)

  const copyLink = async () => {
    const data = btoa(JSON.stringify(scenarios))
    const url = `${window.location.origin}${window.location.pathname}?data=${data}`
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // Clipboard blocked — nothing to fall back to here.
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
    } catch {
      // Non-fatal: scenarios just won't survive a reload.
    }
  }, [scenarios])

  const update = (id: string, patch: Partial<Scenario>) =>
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const remove = (id: string) => setScenarios((prev) => prev.filter((s) => s.id !== id))
  const duplicate = (id: string) =>
    setScenarios((prev) => {
      if (prev.length >= MAX_SCENARIOS) return prev
      const source = prev.find((s) => s.id === id)
      if (!source) return prev
      return [...prev, { ...source, id: newId(), name: `${source.name} copy` }]
    })
  const add = () =>
    setScenarios((prev) =>
      prev.length >= MAX_SCENARIOS
        ? prev
        : [...prev, { ...(prev[prev.length - 1] ?? BASE), id: newId(), name: `Scenario ${prev.length + 1}` }],
    )
  const reset = () => setScenarios(defaults())
  const importSaved = (savedId: string) => {
    const saved = loadSaved().find((s) => s.id === savedId)
    if (!saved) return
    setScenarios((prev) =>
      prev.length >= MAX_SCENARIOS ? prev : [...prev, { ...parseSavedHref(saved.href), id: newId(), name: saved.label }],
    )
  }

  const results: LoanResult[] = scenarios.map(calculateLoan)
  const bestMonthly = results.reduce((best, r, i) => (r.monthlyPayment < results[best].monthlyPayment ? i : best), 0)
  const bestInterest = results.reduce((best, r, i) => (r.totalInterest < results[best].totalInterest ? i : best), 0)
  const maxMonthly = Math.max(...results.map((r) => r.monthlyPayment), 0)
  const adjustedTotals = results.map((r) => adjustTotal(r.totalPayment, r.payoffMonths))
  // Everything is compared against the cheapest total cost.
  const cheapestTotal = Math.min(...adjustedTotals)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
      <Seo title="Compare Loans" description="Compare up to four loan offers side by side — monthly payment, total interest, payoff time and the true difference between them." />

      <PrintReport
        title="Loan Comparison"
        stats={[
          { label: 'Scenarios Compared', value: String(scenarios.length) },
          { label: 'Cheapest Monthly', value: money(results[bestMonthly]?.monthlyPayment ?? 0) },
          { label: 'Cheapest Overall', value: scenarios[bestInterest]?.name ?? '—' },
          { label: 'Lowest Total Cost', value: money(cheapestTotal) },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">⚖️ Compare Loans</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Tune offers side by side and see which actually costs less. Saved in this browser automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
            {(['cards', 'table'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`px-3 py-2 text-xs font-medium capitalize transition ${
                  view === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={reset}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Reset
          </button>
          <button
            onClick={() => setInflationAdjusted((v) => !v)}
            title={`Show totals in today's money, assuming ${INFLATION_PERCENT}% inflation`}
            className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
              inflationAdjusted
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {inflationAdjusted ? "✓ Today's money" : "Today's money"}
          </button>
          <button
            onClick={() =>
              downloadComparisonCsv(
                scenarios.map((s, i) => ({
                  name: s.name,
                  principal: s.principal,
                  annualRatePercent: s.annualRatePercent,
                  termMonths: s.termMonths,
                  monthlyPayment: results[i].monthlyPayment,
                  totalInterest: results[i].totalInterest,
                  totalPayment: results[i].totalPayment,
                })),
              )
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ↓ CSV
          </button>
          <button
            onClick={copyLink}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {linkCopied ? '✓ Link copied' : '🔗 Share comparison'}
          </button>
          <PrintButton />
          {scenarios.length < MAX_SCENARIOS && loadSaved().length > 0 && (
            <select
              value=""
              onChange={(e) => e.target.value && importSaved(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Import a saved scenario"
            >
              <option value="">Import saved…</option>
              {loadSaved().map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.monthlyPayment}/mo)
                </option>
              ))}
            </select>
          )}
          <button
            onClick={add}
            disabled={scenarios.length >= MAX_SCENARIOS}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add scenario
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm tabular-nums">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">
              <tr>
                <th className="px-5 py-3">Scenario</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Rate</th>
                <th className="px-5 py-3">Term</th>
                <th className="px-5 py-3">Monthly</th>
                <th className="px-5 py-3">Interest</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">vs cheapest</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, i) => {
                const result = results[i]
                const gap = adjustedTotals[i] - cheapestTotal
                return (
                  <tr key={scenario.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                      <span className={`mr-2 inline-block h-2 w-2 rounded-full ${ACCENTS[i % ACCENTS.length]}`} />
                      {scenario.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{money(scenario.principal)}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{scenario.annualRatePercent}%</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{formatMonths(scenario.termMonths)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">{money(result.monthlyPayment)}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{money(result.totalInterest)}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{money(adjustedTotals[i])}</td>
                    <td className={`px-5 py-3 font-medium ${gap < 0.01 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {gap < 0.01 ? 'cheapest' : `+${money(gap)}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`grid gap-6 ${scenarios.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {scenarios.map((scenario, i) => {
            const result = results[i]
            const isBestMonthly = i === bestMonthly
            const isBestInterest = i === bestInterest
            const barWidth = maxMonthly > 0 ? Math.max(6, (result.monthlyPayment / maxMonthly) * 100) : 0

            return (
              <div
                key={scenario.id}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${
                  isBestMonthly ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`h-1 w-full ${ACCENTS[i % ACCENTS.length]}`} />
                <div className="flex flex-col gap-5 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <input
                      value={scenario.name}
                      onChange={(e) => update(scenario.id, { name: e.target.value })}
                      aria-label={`Name for scenario ${i + 1}`}
                      className="min-w-0 flex-1 rounded-lg bg-transparent font-semibold text-slate-900 outline-none hover:bg-slate-50 focus:bg-slate-50 dark:text-white dark:hover:bg-slate-800 dark:focus:bg-slate-800"
                    />
                    {scenarios.length < MAX_SCENARIOS && (
                      <button
                        onClick={() => duplicate(scenario.id)}
                        aria-label={`Duplicate ${scenario.name}`}
                        title="Duplicate this scenario"
                        className="rounded-md px-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                      >
                        ⧉
                      </button>
                    )}
                    {scenarios.length > 1 && (
                      <button
                        onClick={() => remove(scenario.id)}
                        aria-label={`Remove ${scenario.name}`}
                        className="rounded-md px-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="flex min-h-6 flex-wrap gap-2">
                    {isBestMonthly && <Badge>Lowest payment</Badge>}
                    {isBestInterest && <Badge>Least interest</Badge>}
                  </div>

                  <LoanForm input={scenario} onChange={(v) => update(scenario.id, v)} sliders={false} showExtra />

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Payment</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{money(result.monthlyPayment)}</p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${isBestMonthly ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                    <Metric label="Total Interest" value={money(result.totalInterest)} />
                    <Metric label="Total Payment" value={money(adjustedTotals[i])} />
                    <Metric label="Paid Off In" value={formatMonths(result.payoffMonths)} />
                    {result.interestSaved > 0 && <Metric label="Interest Saved" value={money(result.interestSaved)} />}
                  </dl>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
      ✓ {children}
    </span>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-700 dark:text-slate-200">{value}</dd>
    </div>
  )
}
