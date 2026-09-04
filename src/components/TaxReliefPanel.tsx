import { useState } from 'react'
import { NumberField } from './NumberField'
import { useFormat } from '../context/SettingsContext'
import { calculateTaxRelief } from '../utils/advancedMath'
import type { AmortizationRow } from '../types/loan'

/**
 * Interest relief (US itemized mortgage interest, India §24). Relief lowers the
 * effective cost of the loan, so it belongs next to the interest total.
 */
export function TaxReliefPanel({ schedule }: { schedule: AmortizationRow[] }) {
  const [marginalRate, setMarginalRate] = useState(24)
  const [annualCap, setAnnualCap] = useState(0)
  const { money } = useFormat()

  const cap = annualCap > 0 ? annualCap : Infinity
  const result = calculateTaxRelief(schedule, marginalRate, cap)
  const capBinding = result.deductibleInterest < result.grossInterest - 0.01

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">Interest tax relief</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          If you can deduct mortgage interest, the loan costs less than the interest total suggests. Only worth counting
          if you actually claim it.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <NumberField
          label="Your marginal tax rate"
          suffix="%"
          value={marginalRate}
          min={0}
          max={60}
          slider
          sliderMin={0}
          sliderMax={50}
          hint="The band your last dollar of income falls in"
          onChange={setMarginalRate}
        />
        <NumberField
          label="Annual deduction cap"
          value={annualCap}
          min={0}
          hint="0 = no cap. India §24 caps at ₹200,000/yr"
          onChange={setAnnualCap}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Interest paid" value={money(result.grossInterest)} />
        <Stat label="Tax saved" value={money(result.taxSaved)} highlight />
        <Stat label="Interest after relief" value={money(result.netInterest)} note={`${result.effectiveRatePercent.toFixed(0)}% of the gross`} />
      </div>

      {capBinding && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The cap bites: only {money(result.deductibleInterest)} of your {money(result.grossInterest)} interest is
          deductible.
        </p>
      )}
    </div>
  )
}

function Stat({ label, value, note, highlight }: { label: string; value: string; note?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold ${highlight ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
    </div>
  )
}
