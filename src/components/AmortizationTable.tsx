import { useState } from 'react'
import { useFormat, useT } from '../context/SettingsContext'
import { downloadScheduleCsv } from '../utils/exportSchedule'
import { currentMonthValue, monthLabel, summarizeByYear } from '../utils/loanMath'
import { realValue } from '../utils/advancedMath'
import type { AmortizationRow } from '../types/loan'

const INFLATION_PERCENT = 3

export function AmortizationTable({ schedule, filename }: { schedule: AmortizationRow[]; filename?: string }) {
  const { money } = useFormat()
  const t = useT()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'monthly' | 'yearly'>(schedule.length > 60 ? 'yearly' : 'monthly')
  const [startDate, setStartDate] = useState(currentMonthValue)
  const [inflationAdjusted, setInflationAdjusted] = useState(false)

  const years = summarizeByYear(schedule)
  // In real terms, a payment made in year 20 costs less than the same payment today.
  const adjust = (value: number, month: number) => (inflationAdjusted ? realValue(value, INFLATION_PERCENT, month) : value)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400"
        >
          {open ? t('hideSchedule') : t('showSchedule')} ({schedule.length} months)
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>

        <div className="no-print flex flex-wrap items-center gap-2">
          {open && (
            <>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                Starts
                <input
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                />
              </label>
              <button
                onClick={() => setInflationAdjusted((v) => !v)}
                title={`Show amounts in today's money, assuming ${INFLATION_PERCENT}% inflation`}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  inflationAdjusted
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {inflationAdjusted ? "✓ Today's money" : "Today's money"}
              </button>
              <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
                {(['monthly', 'yearly'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setView(mode)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition ${
                      view === mode
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            onClick={() => downloadScheduleCsv(schedule, filename)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ↓ CSV
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ↓ PDF
          </button>
        </div>
      </div>

      {open && (
        <div className="print-open max-h-96 overflow-auto border-t border-slate-100 dark:border-slate-800">
          <table className="w-full text-sm tabular-nums">
            <thead className="sticky top-0 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800">
              <tr>
                <th className="px-5 py-3">{view === 'yearly' ? 'Year' : 'Payment due'}</th>
                <th className="px-5 py-3">{view === 'yearly' ? 'Paid' : 'Payment'}</th>
                <th className="px-5 py-3">Principal</th>
                <th className="px-5 py-3">Interest</th>
                <th className="px-5 py-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {view === 'yearly'
                ? years.map((y) => {
                    const month = y.year * 12
                    return (
                      <Row
                        key={y.year}
                        label={`Year ${y.year} · ${monthLabel(month, startDate)}`}
                        payment={money(adjust(y.payment, month))}
                        principal={money(adjust(y.principalPaid, month))}
                        interest={money(adjust(y.interestPaid, month))}
                        balance={money(adjust(y.endingBalance, month))}
                      />
                    )
                  })
                : schedule.map((row) => (
                    <Row
                      key={row.month}
                      label={monthLabel(row.month, startDate)}
                      payment={money(adjust(row.payment, row.month))}
                      principal={money(adjust(row.principalPaid, row.month))}
                      interest={money(adjust(row.interestPaid, row.month))}
                      balance={money(adjust(row.balance, row.month))}
                    />
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  payment,
  principal,
  interest,
  balance,
}: {
  label: string
  payment: string
  principal: string
  interest: string
  balance: string
}) {
  return (
    <tr className="border-t border-slate-100 even:bg-slate-50/50 dark:border-slate-800 dark:even:bg-slate-800/40">
      <td className="px-5 py-2.5 text-slate-500 dark:text-slate-400">{label}</td>
      <td className="px-5 py-2.5 font-medium text-slate-900 dark:text-white">{payment}</td>
      <td className="px-5 py-2.5 text-slate-600 dark:text-slate-300">{principal}</td>
      <td className="px-5 py-2.5 text-slate-600 dark:text-slate-300">{interest}</td>
      <td className="px-5 py-2.5 text-slate-500 dark:text-slate-400">{balance}</td>
    </tr>
  )
}
