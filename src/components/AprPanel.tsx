import { useState } from 'react'
import { NumberField } from './NumberField'
import { Term } from './Term'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES } from '../utils/loanMath'
import { calculateApr } from '../utils/advancedMath'
import type { FeeInput, LoanInput } from '../types/loan'

const NO_FEES: FeeInput = { originationFee: 0, points: 0, otherFees: 0 }

/**
 * The rate a lender advertises isn't what the loan costs. APR folds fees into
 * an effective rate, which is the only number that compares offers fairly.
 */
export function AprPanel({ input }: { input: LoanInput }) {
  const [fees, setFees] = useState<FeeInput>({ originationFee: 1200, points: 0, otherFees: 800 })
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = calculateApr(input, fees)
  const hasFees = result.totalFees > 0
  const spread = result.aprPercent - input.annualRatePercent

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">
          True cost with fees (<Term>APR</Term>)
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Two loans at the same rate aren't the same loan. APR is the rate you're really paying once fees are counted —
          compare offers on this, not the headline rate.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <NumberField
          label="Origination / Processing Fee"
          prefix={symbol}
          value={fees.originationFee}
          min={0}
          onChange={(originationFee) => setFees({ ...fees, originationFee })}
        />
        <NumberField
          label="Discount Points"
          suffix="pts"
          value={fees.points}
          min={0}
          max={5}
          slider
          sliderMin={0}
          sliderMax={4}
          sliderStep={0.25}
          hint={`1 point = 1% of the loan = ${money(input.principal / 100)}`}
          onChange={(points) => setFees({ ...fees, points })}
        />
        <NumberField
          label="Other Closing Costs"
          prefix={symbol}
          value={fees.otherFees}
          min={0}
          hint="Appraisal, legal, insurance"
          onChange={(otherFees) => setFees({ ...fees, otherFees })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Advertised rate" value={`${input.annualRatePercent.toFixed(2)}%`} />
        <Stat
          label="True APR"
          value={result.feesExceedPrincipal ? '—' : `${result.aprPercent.toFixed(2)}%`}
          note={
            result.feesExceedPrincipal
              ? 'fees exceed the loan'
              : hasFees
                ? `+${spread.toFixed(2)}% from fees`
                : 'no fees entered'
          }
          highlight
        />
        <Stat label="Fees paid" value={money(result.totalFees)} note={`${((result.totalFees / Math.max(1, input.principal)) * 100).toFixed(2)}% of the loan`} />
      </div>

      {result.feesExceedPrincipal && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          The fees ({money(result.totalFees)}) are as large as the loan itself ({money(input.principal)}), so there's no
          meaningful APR to quote — you'd receive nothing after costs. Check the fee figures.
        </p>
      )}

      {hasFees && !result.feesExceedPrincipal && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A rival offer at {result.aprPercent.toFixed(2)}% with zero fees would cost you the same. Anything above that is
          worse than this deal, however the rate is advertised.{' '}
          <button
            onClick={() => setFees(NO_FEES)}
            className="font-medium text-indigo-600 underline dark:text-indigo-400"
          >
            Clear fees
          </button>
        </p>
      )}
    </div>
  )
}

function Stat({ label, value, note, highlight }: { label: string; value: string; note?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
    </div>
  )
}
