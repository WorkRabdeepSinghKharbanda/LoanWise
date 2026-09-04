import { useFormat } from '../context/SettingsContext'
import { formatMonths } from '../utils/loanMath'
import type { LoanResult } from '../types/loan'

interface Stat {
  label: string
  value: string
}

/**
 * A clean report header that only exists in print output (`hidden print:flex`
 * — invisible on screen, shown when the page is printed or saved as PDF).
 * Without this, printing lands straight on buttons and charts instead of a
 * summary a borrower can hand someone.
 */
export function PrintReport({ title, stats }: { title: string; stats: Stat[] }) {
  return (
    <div className="hidden flex-col gap-4 border-b border-slate-300 pb-6 print:flex">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-indigo-600 text-xs font-bold text-white">LW</span>
          <span className="text-sm font-bold">LoanWise</span>
        </div>
        <span className="text-xs text-slate-500">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
      </div>
      <h1 className="text-xl font-bold">{title} — Summary</h1>
      <div className="grid grid-cols-4 gap-4 text-sm">
        {stats.slice(0, 4).map((stat) => (
          <div key={stat.label}>
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-base font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">Estimates only, not financial advice. Generated at loan-calculator-ashen-six.vercel.app</p>
    </div>
  )
}

/** Convenience wrapper for the common case: a plain LoanResult. */
export function LoanPrintReport({ title, result }: { title: string; result: LoanResult }) {
  const { money } = useFormat()
  return (
    <PrintReport
      title={title}
      stats={[
        { label: 'Monthly Payment', value: money(result.monthlyPayment) },
        { label: 'Total Interest', value: money(result.totalInterest) },
        { label: 'Total Payment', value: money(result.totalPayment) },
        { label: 'Payoff Time', value: formatMonths(result.payoffMonths) },
      ]}
    />
  )
}
