import { useFormat, useT } from '../context/SettingsContext'
import { formatMonths, payoffDate } from '../utils/loanMath'
import type { LoanResult } from '../types/loan'

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
  // Cap at the total: if a loan closes in its first month, the "monthly"
  // payment is that single payment, not the scheduled amount plus extras.
  const totalMonthly = Math.min(
    result.monthlyPayment + Math.max(0, recurringExtra) + extraMonthly,
    result.totalPayment + extraMonthly,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('monthlyPayment')} value={money(totalMonthly)} highlight />
        <Stat label={t('totalInterest')} value={money(result.totalInterest)} />
        <Stat label={t('totalPayment')} value={money(result.totalPayment + extraMonthly * result.payoffMonths)} />
        <Stat label={t('paidOffIn')} value={formatMonths(result.payoffMonths)} sub={payoffDate(result.payoffMonths)} />
      </div>

      {result.interestSaved > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
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
      )}
    </div>
  )
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}
