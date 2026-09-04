import { useState } from 'react'
import { useFormat, useT } from '../context/SettingsContext'
import { formatMonths, payoffDate } from '../utils/loanMath'
import type { LoanResult } from '../types/loan'

const FREQUENCIES = [
  { id: 'monthly', label: 'Monthly', perYear: 12 },
  { id: 'biweekly', label: 'Bi-weekly', perYear: 26 },
  { id: 'weekly', label: 'Weekly', perYear: 52 },
] as const

export function ResultSummary({
  result,
  extraMonthly = 0,
  recurringExtra = 0,
}: {
  result: LoanResult
  /** Flat costs bolted on top (tax/insurance/PMI) — never amortized. */
  extraMonthly?: number
  /** Principal prepayment paid every month, which the borrower does pay monthly. */
  recurringExtra?: number
}) {
  const { money } = useFormat()
  const t = useT()
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]['id']>('monthly')
  // Cap at the total: if a loan closes in its first month, the "monthly"
  // payment is that single payment, not the scheduled amount plus extras.
  const totalMonthly = Math.min(
    result.monthlyPayment + Math.max(0, recurringExtra) + extraMonthly,
    result.totalPayment + extraMonthly,
  )
  // Same yearly total, just sliced into more/smaller payments — not a different amortization.
  const perYear = FREQUENCIES.find((f) => f.id === frequency)?.perYear ?? 12
  const displayPayment = (totalMonthly * 12) / perYear
  // Original term = how long it would've taken without the extra, restored from payoff + months saved.
  const originalTerm = result.payoffMonths + result.monthsSaved

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t('monthlyPayment')}
          value={money(displayPayment)}
          // The frequency toggle is a screen-only convenience — printed output always shows the true monthly figure.
          printValue={frequency !== 'monthly' ? money(totalMonthly) : undefined}
          highlight
          footer={
            <div className="no-print mt-2 flex gap-1">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFrequency(f.id)}
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition ${
                    frequency === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          }
        />
        <Stat label={t('totalInterest')} value={money(result.totalInterest)} />
        <Stat label={t('totalPayment')} value={money(result.totalPayment + extraMonthly * result.payoffMonths)} />
        <Stat label={t('paidOffIn')} value={formatMonths(result.payoffMonths)} sub={payoffDate(result.payoffMonths)} />
      </div>

      {result.interestSaved > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">✓ Paying extra pays off</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Interest saved: <span className="font-semibold">{money(result.interestSaved)}</span>
            </p>
            {result.monthsSaved > 0 && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Time saved: <span className="font-semibold">{formatMonths(result.monthsSaved)}</span>
              </p>
            )}
          </div>
          {originalTerm > 0 && (
            <div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
                <div className="h-full bg-indigo-500" style={{ width: `${(result.payoffMonths / originalTerm) * 100}%` }} />
                <div className="h-full bg-emerald-400" style={{ width: `${(result.monthsSaved / originalTerm) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                {formatMonths(result.payoffMonths)} paying · {formatMonths(result.monthsSaved)} saved off the original {formatMonths(originalTerm)} term
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  printValue,
  sub,
  highlight,
  footer,
}: {
  label: string
  value: string
  /** When set, shown instead of `value` in print output (screen-only toggles shouldn't leak into a PDF). */
  printValue?: string
  sub?: string
  highlight?: boolean
  footer?: React.ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'} ${printValue ? 'print:hidden' : ''}`}>
        {value}
      </p>
      {printValue && (
        <p className={`mt-1 hidden text-2xl font-bold print:block ${highlight ? 'text-indigo-700' : 'text-slate-900'}`}>{printValue}</p>
      )}
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      {footer}
    </div>
  )
}
