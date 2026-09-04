import { useState } from 'react'
import { NumberField } from './NumberField'
import { useFormat } from '../context/SettingsContext'
import { formatMonths } from '../utils/loanMath'
import { pointsBuydown } from '../utils/advancedMath'
import type { LoanInput } from '../types/loan'

/** Buying the rate down: worth it only if you keep the loan past break-even. */
export function PointsBuydownPanel({ input }: { input: LoanInput }) {
  const [reductionPerPoint, setReductionPerPoint] = useState(0.25)
  const [yearsKept, setYearsKept] = useState(7)
  const { money } = useFormat()

  const options = pointsBuydown(input, reductionPerPoint)
  const monthsKept = yearsKept * 12
  // Best option for the holding period the borrower actually expects.
  const best = options.reduce((winner, option) => {
    const value = option.monthlySaving * monthsKept - option.cost
    const winnerValue = winner.monthlySaving * monthsKept - winner.cost
    return value > winnerValue ? option : winner
  }, options[0])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white">Buy the rate down with points</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Each point costs 1% of the loan up front and cuts the rate. It pays off only if you hold the loan past the
          break-even month.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <NumberField
            label="Rate cut per point"
            suffix="%"
            value={reductionPerPoint}
            min={0.05}
            max={1}
            slider
            sliderMin={0.05}
            sliderMax={0.5}
            sliderStep={0.05}
            hint="Lenders typically offer 0.25%"
            onChange={setReductionPerPoint}
          />
          <NumberField
            label="How long you'll keep this loan"
            suffix="years"
            value={yearsKept}
            min={1}
            max={40}
            slider
            sliderMin={1}
            sliderMax={30}
            hint="Before selling or refinancing"
            onChange={setYearsKept}
          />
        </div>

        <p className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm dark:bg-indigo-950/50">
          {best.points === 0 ? (
            <span className="text-indigo-900 dark:text-indigo-200">
              Over {yearsKept} years, <strong>paying no points</strong> wins — you'd sell or refinance before the up-front
              cost pays back.
            </span>
          ) : (
            <span className="text-indigo-900 dark:text-indigo-200">
              Over {yearsKept} years, <strong>{best.points} point{best.points === 1 ? '' : 's'}</strong> is the best deal:{' '}
              {money(best.cost)} up front saves {money(best.monthlySaving)}/mo, netting{' '}
              {money(best.monthlySaving * monthsKept - best.cost)}.
            </span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3">Points</th>
              <th className="px-6 py-3">Rate</th>
              <th className="px-6 py-3">Cost</th>
              <th className="px-6 py-3">Monthly</th>
              <th className="px-6 py-3">Break-even</th>
              <th className="px-6 py-3">Net over term</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => {
              const isBest = option.points === best.points
              return (
                <tr
                  key={option.points}
                  className={`border-t border-slate-100 dark:border-slate-800 ${
                    isBest ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                    {option.points}
                    {isBest && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">best</span>}
                  </td>
                  <td className="px-6 py-3 text-slate-700 dark:text-slate-300">{option.ratePercent.toFixed(2)}%</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{option.cost === 0 ? '—' : money(option.cost)}</td>
                  <td className="px-6 py-3 text-slate-900 dark:text-white">{money(option.monthlyPayment)}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-400">
                    {option.breakEvenMonths === null ? '—' : `${option.breakEvenMonths} mo (${formatMonths(option.breakEvenMonths)})`}
                  </td>
                  <td
                    className={`px-6 py-3 font-medium ${
                      option.netSavingOverTerm > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {option.netSavingOverTerm === 0 ? '—' : money(option.netSavingOverTerm)}
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
