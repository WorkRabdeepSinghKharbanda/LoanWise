import { useFormat } from '../context/SettingsContext'
import { formatMonths } from '../utils/loanMath'
import type { LoanResult } from '../types/loan'

interface Stat {
  label: string
  value: string
}

/**
 * A clean, branded report header that only exists in print output
 * (`hidden print:flex` — invisible on screen, shown when the page is printed
 * or saved as PDF). Without this, printing lands straight on buttons and
 * charts instead of a summary a borrower can hand someone.
 *
 * The gradient band mirrors the homepage hero so a printed/PDF report reads
 * as unmistakably LoanWise, not a generic spreadsheet — `.print-report`
 * (see index.css) forces browsers to keep the background color/gradient in
 * print output, which they strip by default.
 */
export function PrintReport({ title, stats }: { title: string; stats: Stat[] }) {
  return (
    <div className="print-report hidden flex-col overflow-hidden rounded-2xl border border-slate-300 print:flex">
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
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
        <h1 className="text-xl font-bold text-slate-900">{title} — Summary</h1>
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          {stats.slice(0, 4).map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-base font-semibold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="border-t border-slate-200 px-6 py-3 text-xs text-slate-400">
        Estimates only, not financial advice · Generated at loan-calculator-ashen-six.vercel.app
      </p>
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
