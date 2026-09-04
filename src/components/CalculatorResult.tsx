import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ResultSummary } from './ResultSummary'
import { AmortizationTable } from './AmortizationTable'
import { SplitBar } from './charts/SplitBar'
import { BalanceChart } from './charts/BalanceChart'
import { LoanPrintReport } from './PrintReport'
import { useFormat } from '../context/SettingsContext'
import { saveScenario } from '../utils/savedScenarios'
import type { LoanResult } from '../types/loan'

interface Props {
  result: LoanResult
  /** Flat monthly costs added on top of the loan payment (tax, insurance, PMI). */
  extraMonthly?: number
  /** Principal prepayment made every month, from the page's own input. */
  recurringExtra?: number
  marker?: { month: number; label: string } | null
  filename?: string
  /** Name used when the viewer saves this scenario. */
  scenarioLabel?: string
}

/** Everything below the input form — shared by every calculator page. */
export function CalculatorResult({
  result,
  extraMonthly = 0,
  recurringExtra = 0,
  marker = null,
  filename,
  scenarioLabel = 'Loan',
}: Props) {
  if (result.schedule.length === 0) {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        Enter a loan amount and term to see results.
      </p>
    )
  }

  const principalTotal = result.schedule.reduce((sum, row) => sum + row.principalPaid, 0)

  return (
    <>
      <LoanPrintReport title={scenarioLabel} result={result} />
      <ResultSummary result={result} extraMonthly={extraMonthly} recurringExtra={recurringExtra} />
      <Actions result={result} scenarioLabel={scenarioLabel} />
      <div className="grid gap-5 lg:grid-cols-2">
        <SplitBar principal={principalTotal} interest={result.totalInterest} />
        <BalanceChart schedule={result.schedule} marker={marker} />
      </div>
      <AmortizationTable schedule={result.schedule} filename={filename} />
    </>
  )
}

function Actions({ result, scenarioLabel }: { result: LoanResult; scenarioLabel: string }) {
  const { money } = useFormat()
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context / permissions) — the URL bar still has it.
    }
  }

  const save = () => {
    saveScenario({
      label: scenarioLabel,
      href: `${location.pathname}${location.search}`,
      monthlyPayment: money(result.monthlyPayment),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const share = async () => {
    try {
      await navigator.share({
        title: `${scenarioLabel} — LoanWise`,
        text: `${scenarioLabel}: ${money(result.monthlyPayment)}/mo`,
        url: window.location.href,
      })
    } catch {
      // User cancelled the share sheet, or it's unsupported despite the feature check — either way, no-op.
    }
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button onClick={copy}>{copied ? '✓ Link copied' : '🔗 Copy shareable link'}</Button>
      {typeof navigator !== 'undefined' && 'share' in navigator && <Button onClick={share}>📤 Share</Button>}
      <Button onClick={save}>{saved ? '✓ Saved' : '💾 Save this scenario'}</Button>
    </div>
  )
}

function Button({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  )
}
