import { useEffect, useState } from 'react'
import { useFormat } from '../context/SettingsContext'
import { calculateMonthlyPayment, rateSensitivity } from '../utils/loanMath'
import type { LoanInput } from '../types/loan'

/** What a rate you negotiate — or don't — actually costs. */
export function RateSensitivity({ input }: { input: LoanInput }) {
  const { money } = useFormat()
  const rows = rateSensitivity(input)
  const worst = Math.max(...rows.map((r) => Math.abs(r.monthlyDelta)), 1)
  const basePayment = calculateMonthlyPayment(input)

  const sliderMin = Math.max(0, input.annualRatePercent - 3)
  const sliderMax = input.annualRatePercent + 3
  const [whatIfRate, setWhatIfRate] = useState(input.annualRatePercent)
  // The slider re-centers on the loan's own rate whenever it changes elsewhere (e.g. the form),
  // otherwise a stale whatIfRate could sit outside the newly-computed min/max entirely.
  useEffect(() => setWhatIfRate(input.annualRatePercent), [input.annualRatePercent])
  const whatIfPayment = calculateMonthlyPayment({ ...input, annualRatePercent: whatIfRate })
  const whatIfDelta = whatIfPayment - basePayment

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="px-6 pt-6">
        <h2 className="font-semibold text-slate-900 dark:text-white">If the rate were different</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quarter-point moves look small and add up to real money over the term.
        </p>
      </div>

      <div className="no-print mx-6 mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="what-if-rate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Try a rate: <span className="font-semibold text-slate-900 dark:text-white">{whatIfRate.toFixed(2)}%</span>
          </label>
          <p className="text-sm">
            <span className="font-semibold text-slate-900 dark:text-white">{money(whatIfPayment)}</span>/mo
            {whatIfDelta !== 0 && (
              <span className={whatIfDelta > 0 ? 'ml-1 text-red-600 dark:text-red-400' : 'ml-1 text-emerald-600 dark:text-emerald-400'}>
                ({whatIfDelta > 0 ? '+' : '−'}
                {money(Math.abs(whatIfDelta))})
              </span>
            )}
          </p>
        </div>
        <input
          id="what-if-rate"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={0.05}
          value={whatIfRate}
          onChange={(e) => setWhatIfRate(Number(e.target.value))}
          className="mt-3 w-full accent-indigo-600"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3">Rate</th>
              <th className="px-6 py-3">Monthly</th>
              <th className="px-6 py-3">vs now</th>
              <th className="px-6 py-3">Total interest</th>
              <th className="hidden px-6 py-3 sm:table-cell">Impact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isBase = row.delta === 0
              const width = (Math.abs(row.monthlyDelta) / worst) * 100
              return (
                <tr
                  key={row.ratePercent}
                  className={`border-t border-slate-100 dark:border-slate-800 ${
                    isBase ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                  }`}
                >
                  <td className={`px-6 py-3 ${isBase ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {row.ratePercent.toFixed(2)}%{isBase && ' (yours)'}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{money(row.monthlyPayment)}</td>
                  <td
                    className={`px-6 py-3 font-medium ${
                      row.monthlyDelta > 0
                        ? 'text-red-600 dark:text-red-400'
                        : row.monthlyDelta < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                    }`}
                  >
                    {row.monthlyDelta === 0 ? '—' : `${row.monthlyDelta > 0 ? '+' : '−'}${money(Math.abs(row.monthlyDelta))}`}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{money(row.totalInterest)}</td>
                  <td className="hidden px-6 py-3 sm:table-cell">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${row.monthlyDelta > 0 ? 'bg-red-400' : 'bg-emerald-400'}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
