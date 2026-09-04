import type { AmortizationRow } from '../types/loan'

/** Downloads the schedule as CSV. Values are raw numbers so spreadsheets can total them. */
export function downloadScheduleCsv(schedule: AmortizationRow[], filename = 'amortization-schedule.csv') {
  const header = 'Month,Payment,Principal,Interest,Remaining Balance'
  const rows = schedule.map((r) =>
    [r.month, r.payment.toFixed(2), r.principalPaid.toFixed(2), r.interestPaid.toFixed(2), r.balance.toFixed(2)].join(','),
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
