import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField'
import { PageContainer } from '../components/PageContainer'
import { Seo } from '../components/Seo'
import { PrintReport } from '../components/PrintReport'
import { PrintButton } from '../components/PrintButton'
import { useFormat, useSettings } from '../context/SettingsContext'
import { CURRENCIES, calculateRefinance, formatMonths } from '../utils/loanMath'
import type { RefinanceInput } from '../types/loan'

const INITIAL: RefinanceInput = {
  currentBalance: 250000,
  currentRatePercent: 7.5,
  currentRemainingMonths: 300,
  newRatePercent: 5.75,
  newTermMonths: 300,
  closingCosts: 6000,
}

export function RefinancePage() {
  const [input, setInput] = useState<RefinanceInput>(INITIAL)
  const { money } = useFormat()
  const { currency } = useSettings()
  const symbol = CURRENCIES[currency].symbol

  const result = useMemo(() => calculateRefinance(input), [input])
  const set = <K extends keyof RefinanceInput>(key: K) => (value: number) => setInput({ ...input, [key]: value })

  const worthIt = result.monthlySaving > 0 && result.lifetimeSaving > 0

  return (
    <PageContainer>
      <Seo title="Refinance Calculator" description="Should you refinance? See the monthly saving, the break-even month on closing costs, and whether a longer term wipes out the gain." />
      <div className="flex flex-col gap-6">
        <PrintReport
          title="Refinance"
          stats={[
            { label: 'Current Payment', value: money(result.currentMonthlyPayment) },
            { label: 'New Payment', value: money(result.newMonthlyPayment) },
            { label: 'Monthly Saving', value: money(result.monthlySaving) },
            { label: 'Lifetime Saving', value: money(result.lifetimeSaving) },
          ]}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🔄 Refinance Calculator</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              A lower monthly payment isn't automatically a win — stretching the term can cost more interest overall.
            </p>
          </div>
          <div className="no-print flex gap-2">
            <button
              onClick={() => setInput(INITIAL)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              ↺ Reset to defaults
            </button>
            <PrintButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Your current loan">
            <NumberField label="Remaining Balance" prefix={symbol} value={input.currentBalance} min={1} onChange={set('currentBalance')} />
            <NumberField label="Current Rate" suffix="% / yr" value={input.currentRatePercent} min={0} max={100} slider sliderMax={20} sliderStep={0.05} onChange={set('currentRatePercent')} />
            <NumberField label="Months Remaining" value={input.currentRemainingMonths} min={1} max={600} slider sliderMin={6} sliderMax={360} sliderStep={6} hint={formatMonths(input.currentRemainingMonths)} onChange={set('currentRemainingMonths')} />
          </Card>

          <Card title="The offer on the table">
            <NumberField label="New Rate" suffix="% / yr" value={input.newRatePercent} min={0} max={100} slider sliderMax={20} sliderStep={0.05} onChange={set('newRatePercent')} />
            <NumberField label="New Term" suffix="months" value={input.newTermMonths} min={1} max={600} slider sliderMin={6} sliderMax={360} sliderStep={6} hint={formatMonths(input.newTermMonths)} onChange={set('newTermMonths')} />
            <NumberField label="Closing Costs" prefix={symbol} value={input.closingCosts} min={0} hint="Fees, points, appraisal" onChange={set('closingCosts')} />
          </Card>
        </div>

        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            worthIt
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
              : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40'
          }`}
        >
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {result.monthlySaving <= 0
              ? "This refinance raises your payment — there's no break-even."
              : worthIt
                ? `Worth it if you stay past month ${result.breakEvenMonths}`
                : 'Lower payment, but more interest overall'}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {result.monthlySaving > 0 ? (
              <>
                You'd save {money(result.monthlySaving)}/mo, recovering {money(input.closingCosts)} of closing costs in{' '}
                {result.breakEvenMonths} months ({formatMonths(result.breakEvenMonths ?? 0)}).{' '}
                {result.lifetimeSaving > 0
                  ? `Over the full term that's ${money(result.lifetimeSaving)} saved after costs.`
                  : `But over the full term it costs ${money(Math.abs(result.lifetimeSaving))} more in interest — the longer term is doing the work, not the rate.`}
              </>
            ) : (
              <>
                The new payment is {money(Math.abs(result.monthlySaving))}/mo higher. That only makes sense if you're
                deliberately shortening the term to kill interest.
              </>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Current Payment" value={money(result.currentMonthlyPayment)} />
          <Tile label="New Payment" value={money(result.newMonthlyPayment)} highlight />
          <Tile label="Interest — Staying Put" value={money(result.currentTotalInterest)} />
          <Tile label="Interest — Refinanced" value={money(result.newTotalInterest)} />
        </div>
      </div>
    </PageContainer>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </div>
  )
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/50'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  )
}
