import type { AmortizationRow } from '../types/loan'

function downloadCsv(header: string, rows: string[], filename: string) {
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** Downloads the schedule as CSV. Values are raw numbers so spreadsheets can total them. */
export function downloadScheduleCsv(schedule: AmortizationRow[], filename = 'amortization-schedule.csv') {
  const header = 'Month,Payment,Principal,Interest,Remaining Balance'
  const rows = schedule.map((r) =>
    [r.month, r.payment.toFixed(2), r.principalPaid.toFixed(2), r.interestPaid.toFixed(2), r.balance.toFixed(2)].join(','),
  )
  downloadCsv(header, rows, filename)
}

interface ComparisonRow {
  name: string
  principal: number
  annualRatePercent: number
  termMonths: number
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
}

/** Downloads the Compare page's scenarios as CSV, one row per scenario. */
export function downloadComparisonCsv(rows: ComparisonRow[], filename = 'loan-comparison.csv') {
  const header = 'Scenario,Amount,Rate %,Term (months),Monthly Payment,Total Interest,Total Payment'
  const lines = rows.map((r) =>
    [
      `"${r.name.replace(/"/g, '""')}"`,
      r.principal.toFixed(2),
      r.annualRatePercent,
      r.termMonths,
      r.monthlyPayment.toFixed(2),
      r.totalInterest.toFixed(2),
      r.totalPayment.toFixed(2),
    ].join(','),
  )
  downloadCsv(header, lines, filename)
}
